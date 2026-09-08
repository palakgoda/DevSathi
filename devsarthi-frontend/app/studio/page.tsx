'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StudioHeader from '../components/studio/StudioHeader';
import SourcesPanel from '../components/studio/SourcesPanel';
import LearningWorkspace, { WorkspaceMode } from '../components/studio/LearningWorkspace';
import TutorPanel from '../components/studio/TutorPanel';
import NotesDrawer from '../components/studio/NotesDrawer';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type SourceType = "code" | "image" | "pdf" | "document" | "text" | "video" | "youtube" | "unknown";

export type FileItem = {
  name: string;
  type: SourceType;
  language: string;
  content: string;
};

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDF9EF] flex items-center justify-center">Loading Studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const subject = searchParams?.get('subject') || '';
  const topic = searchParams?.get('topic') || '';
  const hasSession = Boolean(subject && topic);

  // Default initial states
  const defaultFiles: FileItem[] = hasSession ? [
    { name: 'main.py', type: 'code', language: 'python', content: 'def main():\n    print("Hello DevSarthi")\n\nmain()' },
    { name: 'utils.js', type: 'code', language: 'javascript', content: 'export const add = (a, b) => a + b;' }
  ] : [];

  const defaultMessages: Message[] = hasSession ? [
    { id: '1', role: 'assistant', content: 'Hello! I am DevSarthi. How can I help you with your coding today?' }
  ] : [
    { id: '1', role: 'assistant', content: 'Your Socratic learning guide.\n\nAdd a source or start a learning activity, and I\'ll help you understand it step by step.' }
  ];

  const [code, setCode] = useState<string>(defaultFiles[0]?.content || '');
  const [language, setLanguage] = useState<string>('python');
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [activeFile, setActiveFile] = useState<string>(hasSession ? 'main.py' : '');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(hasSession ? 'entry' : 'welcome');

  // Guard to prevent empty initial state from overwriting DB on first load
  const [isLoadedFromDB, setIsLoadedFromDB] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [tutorOpen, setTutorOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);

  type Activity = 'read' | 'practice' | 'code' | null;
  const [sessionActivity, setSessionActivity] = useState<Activity>(null);

  // Synchronize code edits into active file object
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setFiles(prev =>
      prev.map(f => (f.name === activeFile ? { ...f, content: newCode } : f))
    );
  };

  // -------------------------------------------------------------
  // 1. Fetch Session from Supabase on mount / topic change
  // -------------------------------------------------------------
  useEffect(() => {
    if (!subject || !topic) {
      setIsLoadedFromDB(true);
      return;
    }

    let isMounted = true;

    async function loadSession() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/studio/session?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`
        );
        if (res.ok) {
          const result = await res.json();
          if (isMounted && result.exists && result.data) {
            const data = result.data;
            if (data.files && data.files.length > 0) {
              setFiles(data.files);
              const target = data.files.find((f: FileItem) => f.name === data.active_file) || data.files[0];
              setActiveFile(target.name);
              setCode(target.content);
              setLanguage(target.language || 'python');
            }
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages);
            }
            if (data.workspace_mode) {
              setWorkspaceMode(data.workspace_mode);
            }
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using default session state:', err);
      } finally {
        if (isMounted) setIsLoadedFromDB(true);
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [subject, topic]);

  // -------------------------------------------------------------
  // 2. Debounced Auto-Save to Supabase
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isLoadedFromDB || !subject || !topic) return;

    const timer = setTimeout(async () => {
      try {
        await fetch('http://localhost:8000/api/studio/session', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            topic,
            files,
            active_file: activeFile,
            code,
            messages,
            workspace_mode: workspaceMode,
          }),
        });
      } catch (err) {
        console.error('Auto-save to Supabase failed:', err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [files, activeFile, code, messages, workspaceMode, subject, topic, isLoadedFromDB]);

  // Activity Switcher
  useEffect(() => {
    setSessionActivity(null);
  }, [subject, topic]);

  const handleActivitySelect = (activity: Activity) => {
    setSessionActivity(activity);
    if (activity === 'read') setWorkspaceMode('viewer');
    else if (activity === 'practice') setWorkspaceMode('practice');
    else if (activity === 'code') setWorkspaceMode('editor');
  };

  // Tutor Analysis
  const handleAnalyze = async (context?: { snippet?: string; fileName?: string }) => {
    const fileName = context?.fileName || activeFile || 'your code';
    const snippet = context?.snippet;

    const userPrompt = snippet
      ? `Can you review these selected lines in ${fileName}?\n\`\`\`${language}\n${snippet}\n\`\`\``
      : `Can you review my code in ${fileName}?`;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userPrompt };
    setMessages(prev => [...prev, userMsg]);
    setIsAnalyzing(true);
    if (!tutorOpen) setTutorOpen(true);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: snippet || code,
          language,
          prompt: userPrompt,
          fileName
        }),
      });

      if (!response.ok) throw new Error('Backend offline');
      const data = await response.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Analysis complete. Do you have any specific doubts?'
      }]);
    } catch {
      setTimeout(() => {
        const fallbackHint = snippet
          ? `Looking closely at your selected snippet in **${fileName}**:\n\`\`\`${language}\n${snippet}\n\`\`\`\nWhat output do you expect when this condition evaluates? Does the syntax match Python's indentation rules?`
          : `I'm analyzing **${fileName}**. Notice how your control flow branches execute. Walk me through the first condition—what happens if the input is negative or zero?`;

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackHint
        }]);
        setIsAnalyzing(false);
      }, 700);
      return;
    }

    setIsAnalyzing(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isAnalyzing) return;

    const userPrompt = chatInput;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userPrompt };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, prompt: userPrompt, language }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'Analysis complete. Do you have any specific doubts?'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Backend connection issue. Make sure FastAPI server (port 8000) is running.'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let sourceType: SourceType = 'unknown';

    const codeExtensions = [
      'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json',
      'java', 'c', 'cpp', 'cs', 'go', 'rs', 'php', 'rb', 'sql', 'sh'
    ];

    if (codeExtensions.includes(ext)) {
      sourceType = 'code';
    } else if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
      sourceType = 'image';
    } else if (file.type === 'application/pdf' || ext === 'pdf') {
      sourceType = 'pdf';
    } else if (file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv'].includes(ext)) {
      sourceType = 'video';
    } else if (['doc', 'docx', 'csv', 'md'].includes(ext)) {
      sourceType = 'document';
    } else if (file.type.startsWith('text/') || ext === 'txt') {
      sourceType = 'text';
    } else {
      sourceType = 'code';
    }

    if (['image', 'pdf', 'video'].includes(sourceType)) {
      const objectUrl = URL.createObjectURL(file);
      const newFile: FileItem = {
        name: file.name,
        type: sourceType,
        language: ext || 'binary',
        content: objectUrl
      };

      setFiles(prev => [...prev, newFile]);
      setActiveFile(file.name);
      setCode(objectUrl);
      setWorkspaceMode('viewer');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newFile: FileItem = {
        name: file.name,
        type: sourceType,
        language: ext || 'text',
        content
      };
      setFiles(prev => [...prev, newFile]);
      setActiveFile(file.name);
      setCode(content);
      setWorkspaceMode(sourceType === 'code' ? 'editor' : 'viewer');
    };
    reader.readAsText(file);
  };

  const handleStartSession = (newSubject: string, newTopic: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('subject', newSubject);
    params.set('topic', newTopic);
    router.push(`/studio?${params.toString()}`);
  };

  const handleYoutubeLink = () => {
    const url = prompt("Enter YouTube tutorial link:");
    if (url) {
      const newFile: FileItem = {
        name: `YouTube Video ${files.length + 1}`,
        type: 'youtube',
        language: 'video',
        content: url
      };
      setFiles(prev => [...prev, newFile]);
      setActiveFile(newFile.name);
      setCode(url);
      setWorkspaceMode('viewer');
      setSessionActivity('read');

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: `I'm learning from this video: ${url}`
      }]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Great! Video context has been loaded. We can discuss the concepts from the tutorial.'
        }]);
      }, 1000);
      if (!tutorOpen) setTutorOpen(true);
    }
  };

  const handleFileSelect = (fileName: string) => {
    const selected = files.find(f => f.name === fileName);
    if (!selected) return;

    setActiveFile(selected.name);
    setCode(selected.content);

    const lang = selected.language === 'py'
      ? 'python'
      : selected.language === 'js'
        ? 'javascript'
        : selected.language === 'ts'
          ? 'typescript'
          : selected.language || 'text';
    setLanguage(lang);

    if (selected.type === 'code') {
      if (sessionActivity === 'read') {
        setWorkspaceMode('viewer');
      } else if (sessionActivity === 'practice') {
        setWorkspaceMode('practice');
      } else {
        setWorkspaceMode('editor');
        setSessionActivity('code');
      }
    } else {
      setWorkspaceMode('viewer');
      setSessionActivity('read');
    }
  };

  const handleDeleteSource = (fileName: string) => {
    const updatedFiles = files.filter(f => f.name !== fileName);
    setFiles(updatedFiles);

    if (activeFile === fileName) {
      if (updatedFiles.length > 0) {
        handleFileSelect(updatedFiles[0].name);
      } else {
        setActiveFile('');
        setCode('');
        setWorkspaceMode('welcome');
      }
    }
  };

  const activeFileObj = files.find(f => f.name === activeFile);
  const activeFileType = activeFileObj?.type || 'unknown';

  return (
    <div className="flex flex-col min-h-screen bg-[#FDF9EF] font-body-md text-[#1c1c16] overflow-hidden">
      <StudioHeader
        subject={subject}
        topic={topic}
        activity={sessionActivity || 'code'}
        onActivityChange={handleActivitySelect}
      />

      <main
        className="mt-16 flex-1 grid h-[calc(100vh-4rem)] p-4 gap-4 overflow-hidden relative"
        style={{
          gridTemplateColumns: `${sourcesOpen ? '280px' : '48px'} minmax(400px, 1fr) ${tutorOpen ? '340px' : '0px'}`
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(#013626 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <SourcesPanel
          subject={subject}
          topic={topic}
          isOpen={sourcesOpen}
          setIsOpen={setSourcesOpen}
          files={files}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onFileUpload={handleFileUpload}
          onYoutubeLink={handleYoutubeLink}
          onDeleteSource={handleDeleteSource}
        />

        <LearningWorkspace
          key={activeFile || 'workspace'}
          mode={workspaceMode}
          setMode={setWorkspaceMode}
          code={code}
          setCode={handleCodeChange}
          language={language}
          activeFile={activeFile}
          activeFileType={activeFileType}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          subject={subject}
          topic={topic}
          onFileUpload={handleFileUpload}
          onStartSession={handleStartSession}
          onActivitySelect={handleActivitySelect}
        />

        <TutorPanel
          subject={subject}
          topic={topic}
          isOpen={tutorOpen}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isAnalyzing={isAnalyzing}
          onSendMessage={handleSendMessage}
          onQuickPrompt={(prompt) => {
            setChatInput(prompt);
            setTimeout(() => {
              setChatInput('');
              const userMsg: Message = { id: Date.now().toString(), role: 'user', content: prompt };
              setMessages(prev => [...prev, userMsg]);
              setIsAnalyzing(true);
              fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, prompt, language }),
              })
                .then(res => res.json())
                .then(data => {
                  setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.response || data.message || 'Analysis complete.'
                  }]);
                })
                .catch(() => {
                  setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'DevSarthi backend is currently offline. Start Ollama / FastAPI on port 8000.'
                  }]);
                })
                .finally(() => setIsAnalyzing(false));
            }, 50);
          }}
        />
      </main>
    </div>
  );
}
