'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  Component, Search, LayoutDashboard, Sparkles, BookOpen, LineChart, Calendar, Target, Timer, Activity, LogOut, CheckCircle
} from 'lucide-react';

import { supabase } from '../../utils/supabase';

import StudioHeader from '../components/studio/StudioHeader';
import SourcesPanel from '../components/studio/SourcesPanel';
import LearningWorkspace, { WorkspaceMode } from '../components/studio/LearningWorkspace';
import TutorPanel from '../components/studio/TutorPanel';
import NotesDrawer from '../components/studio/NotesDrawer';
import CommandPalette from '../components/studio/CommandPalette';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type SourceType = "code" | "image" | "pdf" | "document" | "text" | "video" | "youtube" | "folder" | "unknown";

export type FileItem = {
  id: string;
  name: string;
  type: SourceType;
  language: string;
  content: string;
  parent_id?: string | null;
  updated_at?: string;
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

  const notebookIdParam = searchParams?.get('notebookId');
  const subjectParam = searchParams?.get('subject') || '';
  const topicParam = searchParams?.get('topic') || '';

  const [notebookId, setNotebookId] = useState<string | null>(notebookIdParam || null);
  const [subject, setSubject] = useState(subjectParam);
  const [topic, setTopic] = useState(topicParam);

  const hasSession = Boolean(subject && topic) || Boolean(notebookId);

  // Default initial states
  const defaultFiles: FileItem[] = hasSession ? [
    { id: 'default-file-1', name: 'main.py', type: 'code', language: 'python', content: 'def main():\n    print("Hello DevSarthi")\n\nmain()', parent_id: null, updated_at: new Date().toISOString() },
    { id: 'default-file-2', name: 'utils.js', type: 'code', language: 'javascript', content: 'export const add = (a, b) => a + b;', parent_id: null, updated_at: new Date().toISOString() }
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
  
  const [profile, setProfile] = useState({ fullName: 'Student', course: 'IT', semester: 'V', initials: 'ST' });
  const [upcomingEventsList, setUpcomingEventsList] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Guard to prevent empty initial state from overwriting DB on first load
  const [isLoadedFromDB, setIsLoadedFromDB] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalName, setSaveModalName] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [tutorOpen, setTutorOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);

  type Activity = 'read' | 'practice' | 'code' | null;
  const [sessionActivity, setSessionActivity] = useState<Activity>(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize code edits into active file object
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setFiles(prev =>
      prev.map(f => (f.name === activeFile ? { ...f, content: newCode } : f))
    );
  };

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, course, semester')
        .eq('id', user.id)
        .single();
        
      if (userData) {
        const nameParts = userData.full_name?.trim().split(' ') || [];
        const initials = nameParts.length >= 2 ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() : (userData.full_name?.slice(0, 2).toUpperCase() || 'ST');
        setProfile({ fullName: userData.full_name, course: userData.course || 'IT', semester: userData.semester || 'V', initials });
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, event_date, event_type')
        .eq('user_id', user.id)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(3);
      if (eventsData) setUpcomingEventsList(eventsData);
      
      const { data: actData } = await supabase
        .from('activity_log')
        .select('id, title, activity_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (actData) setRecentActivities(actData);

      if (notebookIdParam) {
        const { data: nbData, error } = await supabase
          .from('notebooks')
          .select('*')
          .eq('id', notebookIdParam)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error("Supabase Error [studio notebookId]:", error.message);
        }

        if (nbData && !error) {
          setSubject(nbData.subject);
          setTopic(nbData.topic || '');
          if (nbData.content) {
            const parsed = typeof nbData.content === 'string' ? JSON.parse(nbData.content) : nbData.content;
            if (parsed.files && parsed.files.length > 0) {
              setFiles(parsed.files);
              const target = parsed.files.find((f: FileItem) => f.name === parsed.active_file) || parsed.files[0];
              setActiveFile(target.name);
              setCode(target.content);
              setLanguage(target.language || 'python');
            }
            if (parsed.messages && parsed.messages.length > 0) setMessages(parsed.messages);
            if (parsed.workspace_mode) setWorkspaceMode(parsed.workspace_mode);
          }
        }
      } else if (subjectParam && topicParam) {
        const { data: nbData, error } = await supabase
          .from('notebooks')
          .select('*')
          .eq('subject', subjectParam)
          .eq('topic', topicParam)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          console.error("Supabase Error [studio subject/topic]:", error.message);
        }

        if (nbData) {
          setNotebookId(nbData.id);
          if (nbData.content) {
            const parsed = typeof nbData.content === 'string' ? JSON.parse(nbData.content) : nbData.content;
            if (parsed.files && parsed.files.length > 0) setFiles(parsed.files);
            if (parsed.active_file) {
                const target = parsed.files?.find((f: FileItem) => f.name === parsed.active_file);
                if (target) {
                    setActiveFile(target.name);
                    setCode(target.content);
                    setLanguage(target.language || 'python');
                }
            }
            if (parsed.messages && parsed.messages.length > 0) setMessages(parsed.messages);
            if (parsed.workspace_mode) setWorkspaceMode(parsed.workspace_mode);
          }
        }
      }
      setIsLoadedFromDB(true);
    }
    loadData();
  }, [notebookIdParam, subjectParam, topicParam, router]);

  const handleSave = async (silent = false, customTitle?: string) => {
    const currentSubject = subject || 'Untitled Session';
    const finalTitle = customTitle || topic || currentSubject;
    if (customTitle) setTopic(customTitle);
    
    setIsSaving(!silent);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const payload = {
        title: finalTitle,
        subject: currentSubject,
        topic: finalTitle,
        coverage: 15,
        content: JSON.stringify({
          files,
          active_file: activeFile,
          messages,
          workspace_mode: workspaceMode
        }),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      let currentNotebookId = notebookId;

      if (currentNotebookId) {
        await supabase
          .from('notebooks')
          .update(payload)
          .eq('id', currentNotebookId);
      } else {
        const { data, error } = await supabase
          .from('notebooks')
          .insert(payload)
          .select()
          .single();
        if (data && !error) {
          setNotebookId(data.id);
          currentNotebookId = data.id;
          const params = new URLSearchParams(searchParams?.toString() || '');
          params.set('notebookId', data.id);
          router.replace(`/studio?${params.toString()}`);
        }
      }
      
      
      if (silent !== true) {
        await supabase
          .from('activity_log')
          .insert({
            user_id: user.id,
            title: `Updated notebook: ${payload.title}`,
            activity_type: 'code',
            action: 'Saved session in AI Studio'
          });
        setSaveSuccessMsg('Notebook successfully saved!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
        
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!isLoadedFromDB) return;
    const timeoutId = setTimeout(() => {
      handleSave(true);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [files, messages, activeFile, workspaceMode, isLoadedFromDB, subject]);

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
        id: crypto.randomUUID(),
        name: file.name,
        type: sourceType,
        language: ext || 'binary',
        content: objectUrl,
        parent_id: null,
        updated_at: new Date().toISOString()
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
        id: crypto.randomUUID(),
        name: file.name,
        type: sourceType,
        language: ext || 'text',
        content,
        parent_id: null,
        updated_at: new Date().toISOString()
      };
      setFiles(prev => [...prev, newFile]);
      setActiveFile(file.name);
      setCode(content);
      setWorkspaceMode(sourceType === 'code' ? 'editor' : 'viewer');
    };
    reader.readAsText(file);
  };

  const handleCreateNode = (name: string, type: 'file' | 'folder', parentId: string | null) => {
    let sourceType: SourceType = 'unknown';
    let language = 'text';

    if (type === 'folder') {
      sourceType = 'folder';
      language = 'folder';
    } else {
      const ext = name.split('.').pop()?.toLowerCase() || '';
      const codeExtensions = ['py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'php', 'rb', 'sql', 'sh'];
      if (codeExtensions.includes(ext)) {
        sourceType = 'code';
        language = ext;
      } else if (['md', 'txt', 'csv'].includes(ext)) {
        sourceType = 'document';
        language = ext;
      } else {
        sourceType = 'text';
      }
    }

    const newFile: FileItem = {
      id: crypto.randomUUID(),
      name,
      type: sourceType,
      language,
      content: '',
      parent_id: parentId,
      updated_at: new Date().toISOString()
    };

    setFiles(prev => [...prev, newFile]);

    if (type === 'file') {
      setActiveFile(newFile.name);
      setCode('');
      setWorkspaceMode('editor');
    }
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
        id: crypto.randomUUID(),
        name: `YouTube Video ${files.length + 1}`,
        type: 'youtube',
        language: 'video',
        content: url,
        parent_id: null,
        updated_at: new Date().toISOString()
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
    <div className="h-screen flex flex-col bg-[#FDF9EF] font-body-md text-[#1c1c16] overflow-hidden">
      <StudioHeader
        subject={subject}
        topic={topic}
        activity={sessionActivity || 'code'}
        onActivityChange={handleActivitySelect}
        profile={profile}
        upcomingEventsList={upcomingEventsList}
        recentActivities={recentActivities}
        onSave={() => {
          setSaveModalName(topic || subject || 'Untitled Session');
          setIsSaveModalOpen(true);
        }}
        isSaving={isSaving}
      />

      <main
        className="mt-16 flex-1 grid p-4 gap-4 overflow-hidden relative h-[calc(100vh-4rem)]"
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
          onCreateNode={handleCreateNode}
        />

        {isSplitView ? (
          <div className="flex gap-4 min-w-0 h-full w-full">
            <div className="flex-1 min-w-0">
              <LearningWorkspace
                key={activeFile + '-viewer'}
                mode="viewer"
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
                isSplitView={isSplitView}
                onToggleSplitView={() => setIsSplitView(!isSplitView)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <LearningWorkspace
                key="scratchpad"
                mode="editor"
                setMode={() => {}}
                code={`# Scratchpad for ${activeFile}\n\n`}
                setCode={() => {}}
                language="python"
                activeFile="scratchpad.py"
                activeFileType="code"
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                subject={subject}
                topic={topic}
                onFileUpload={handleFileUpload}
                onStartSession={handleStartSession}
                onActivitySelect={handleActivitySelect}
                isSplitView={isSplitView}
                onToggleSplitView={() => setIsSplitView(!isSplitView)}
              />
            </div>
          </div>
        ) : (
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
            isSplitView={isSplitView}
            onToggleSplitView={() => setIsSplitView(!isSplitView)}
          />
        )}

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
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onAskDevSarthi={(prompt) => {
            const userMsg: Message = { id: Date.now().toString(), role: 'user', content: prompt };
            setMessages(prev => [...prev, userMsg]);
            setIsAnalyzing(true);
            if (!tutorOpen) setTutorOpen(true);
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
          }}
          onSwitchMode={(mode) => setWorkspaceMode(mode as WorkspaceMode)}
        />
        </main>

        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full">
              <h3 className="font-serif text-lg font-bold text-[#013626] mb-4">Save Notebook</h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notebook Name</label>
                <input
                  type="text"
                  value={saveModalName}
                  onChange={(e) => setSaveModalName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#013626]"
                  placeholder="Enter a name..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSave(false, saveModalName);
                    setIsSaveModalOpen(false);
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#013626] hover:bg-[#001f14] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="fixed bottom-4 right-4 bg-[#013626] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-sm">{saveSuccessMsg}</span>
          </div>
        )}
    </div>
  );
}
