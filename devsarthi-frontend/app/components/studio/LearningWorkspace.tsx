import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePyodide } from './usePyodide';
import {
  Code2,
  Play,
  Brain,
  ArrowRight,
  School,
  Library,
  Terminal,
  Lightbulb,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Terminal as TerminalIcon,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  RefreshCw,
  Layers,
  FileCode2,
  ArrowUpRight
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export type WorkspaceMode = 'welcome' | 'entry' | 'editor' | 'viewer' | 'practice';

type LearningWorkspaceProps = {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  code: string;
  setCode: (code: string) => void;
  language: string;
  activeFile: string;
  activeFileType?: string;
  onAnalyze: (context?: { snippet?: string; fileName?: string }) => void;
  isAnalyzing: boolean;
  subject: string;
  topic: string;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartSession?: (subject: string, topic: string) => void;
  onActivitySelect?: (activity: 'read' | 'practice' | 'code') => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
};

export default function LearningWorkspace({
  mode,
  setMode,
  code,
  setCode,
  language,
  activeFile,
  activeFileType = 'unknown',
  onAnalyze,
  isAnalyzing,
  subject,
  topic,
  onFileUpload,
  onStartSession,
  onActivitySelect,
  isSplitView,
  onToggleSplitView
}: LearningWorkspaceProps) {
  const { isPyodideReady, isRunning: isPyRunning, runPython } = usePyodide();

  const [showSetup, setShowSetup] = useState(false);
  const [tempSubject, setTempSubject] = useState(subject || 'Data Structures');
  const [tempTopic, setTempTopic] = useState(topic || 'Recursion');
  const [inlineMenuPos, setInlineMenuPos] = useState<{ top: number, left: number } | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState('');

  const editorRef = React.useRef<any>(null);

  const handleAskDevSarthi = () => {
    let snippet = '';
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      if (selection && !selection.isEmpty()) {
        snippet = editorRef.current.getModel().getValueInRange(selection);
      }
    }
    onAnalyze({ snippet, fileName: activeFile || 'untitled.py' });
  };

  // Terminal / Execution Drawer State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const handleRunCode = async () => {
    setIsTerminalOpen(true);
    setTerminalOutput([`Executing ${activeFile || 'main.py'}...\n`]);

    if (language === 'python' || activeFileType === 'code') {
      await runPython(
        code,
        (out) => setTerminalOutput(prev => [...prev, out]),
        (err) => setTerminalOutput(prev => [...prev, `[Runtime Error]: ${err}`])
      );
      setTerminalOutput(prev => [...prev, '\n[Execution finished]']);
    } else {
      setTimeout(() => {
        setTerminalOutput(prev => [
          ...prev,
          `Client execution engine currently supports Python. For ${language}, use an online runner or node environment.`
        ]);
      }, 300);
    }
  };

  // ==========================================
  // PRACTICE ARENA: 10-QUESTION QUIZ ENGINE
  // ==========================================
  type PracticeScope = 'file' | 'subject';

  type Question = {
    id: number;
    scope: PracticeScope;
    type: 'mcq' | 'predict' | 'fix';
    title: string;
    prompt: string;
    codeSnippet?: string;
    options?: string[];
    correctOptionIndex?: number;
    expectedKeywords?: string[];
    hint1: string;
    hint2: string;
    solutionExplanation: string;
  };

  const questionBank: Question[] = [
    // --- 10 QUESTIONS FOR FOCUSED FILE SCOPE ---
    {
      id: 1,
      scope: 'file',
      type: 'predict',
      title: `Analysis: ${activeFile || 'Current File'}`,
      prompt: `Based on the active file (${activeFile || 'your script'}) loaded in your workspace, review the snippet below. What is the primary output or behavior?`,
      codeSnippet: code ? (code.length > 300 ? code.substring(0, 300) + '\n# [Truncated...]' : code) : `if marks > 70:\n    print("first class")\n...`,
      expectedKeywords: ['second class', 'error', 'true', 'false', '1', '0', 'none', 'null'],
      hint1: 'Examine the variables and control flow in the provided workspace snippet.',
      hint2: 'Step through the first few lines to see what evaluates to True.',
      solutionExplanation: 'In a dynamic workspace, the exact output depends on the source code provided.'
    },
    {
      id: 2,
      scope: 'file',
      type: 'fix',
      title: 'Bug Hunter: Python Syntax',
      prompt: 'Identify the keyword error preventing this branch from running in Python:',
      codeSnippet: `age = 19\nelse if (age >= 18):\n    print("Eligible to vote")`,
      expectedKeywords: ['elif'],
      hint1: 'Python does not use two words like C or JS.',
      hint2: 'Contract "else if" into a single keyword.',
      solutionExplanation: 'Python requires "elif" instead of "else if".'
    },
    {
      id: 3,
      scope: 'file',
      type: 'mcq',
      title: 'Boundary Value Analysis',
      prompt: 'What prints if marks = 55 in the condition `elif marks > 55: print("third class") else: print("fail")`?',
      options: ['third class', 'fail', 'SyntaxError', 'None of the above'],
      correctOptionIndex: 1,
      hint1: 'Check if the inequality is strict (>) or inclusive (>=).',
      hint2: '55 is not strictly greater than 55.',
      solutionExplanation: 'Since 55 is not > 55, it skips to the else block and prints "fail".'
    },
    {
      id: 4,
      scope: 'file',
      type: 'predict',
      title: 'Even or Odd Modulo Evaluation',
      prompt: 'In the condition `if (a % 2 == 0):`, what does `a % 2` evaluate to when a = 15?',
      expectedKeywords: ['1'],
      hint1: 'The modulo operator (%) returns the remainder of integer division.',
      hint2: '15 divided by 2 is 7 with what remainder?',
      solutionExplanation: '15 % 2 evaluates to 1, meaning it resolves to False in the check == 0.'
    },
    {
      id: 5,
      scope: 'file',
      type: 'mcq',
      title: 'Input Conversion Pitfall',
      prompt: 'What happens if the user types `"75"` but the code omits the `int()` wrapper: `marks = input(...)` followed by `if marks > 70:`?',
      options: [
        'Python automatically converts the string to an integer',
        'Raises a TypeError for unorderable types: str() > int()',
        'It defaults to the else block silently',
        'It prints "first class" correctly'
      ],
      correctOptionIndex: 1,
      hint1: 'In Python 3, strings and integers cannot be directly compared with > or <.',
      hint2: 'Comparing "75" > 70 will raise an exception.',
      solutionExplanation: 'Python 3 raises TypeError: ">" not supported between instances of "str" and "int".'
    },
    {
      id: 6,
      scope: 'file',
      type: 'predict',
      title: 'Sign Check Evaluation',
      prompt: 'When `num = 0` in `if num > 0: print("pos") elif num < 0: print("neg") else: print("zero")`, what prints?',
      expectedKeywords: ['zero'],
      hint1: 'Is 0 positive or negative?',
      hint2: 'Both > 0 and < 0 evaluate to False.',
      solutionExplanation: '0 is neither greater than nor less than 0, falling through to print "zero".'
    },
    {
      id: 7,
      scope: 'file',
      type: 'mcq',
      title: 'Logical Comparison',
      prompt: 'Which operator checks if both numbers `a` and `b` are positive simultaneously?',
      options: ['if a > 0 & b > 0:', 'if a > 0 and b > 0:', 'if a > 0 && b > 0:', 'if (a, b) > 0:'],
      correctOptionIndex: 1,
      hint1: 'Python uses explicit English words for boolean operations.',
      hint2: '&& is used in C/C++/Java, not Python.',
      solutionExplanation: 'Python uses the keyword `and` for logical conjunction.'
    },
    {
      id: 8,
      scope: 'file',
      type: 'predict',
      title: 'Max of Two Numbers',
      prompt: 'Given `a = 40, b = 40`. In `if a > b: print(a) else: print(b)`, which variable is printed?',
      expectedKeywords: ['b', '40'],
      hint1: 'Is 40 strictly greater than 40?',
      hint2: 'Since a > b is False, it falls into the else branch.',
      solutionExplanation: 'Because 40 is not > 40, execution enters the else branch and prints b.'
    },
    {
      id: 9,
      scope: 'file',
      type: 'mcq',
      title: 'Indentation Syntax',
      prompt: 'What occurs if the `print("even")` statement inside an if block has no indentation?',
      options: ['IndentationError', 'NameError', 'Runs normally', 'Warning only'],
      correctOptionIndex: 0,
      hint1: 'Python relies strictly on whitespace to delineate code blocks.',
      hint2: 'A missing tab or spaces after a colon raises an error.',
      solutionExplanation: 'Python raises IndentationError: expected an indented block after "if".'
    },
    {
      id: 10,
      scope: 'file',
      type: 'predict',
      title: 'Ternary Operator Equivalence',
      prompt: 'Write the 1-line Python ternary syntax equivalent to: `status = "even" if (n % 2 == 0) else "odd"`. What is status if n = 8?',
      expectedKeywords: ['even'],
      hint1: '8 % 2 is 0, which matches the condition.',
      hint2: 'The condition evaluates to True.',
      solutionExplanation: '8 % 2 == 0 evaluates to True, assigning "even" to status.'
    },

    // --- 10 QUESTIONS FOR ENTIRE SUBJECT SCOPE ---
    {
      id: 11,
      scope: 'subject',
      type: 'mcq',
      title: 'Structural Reasoning',
      prompt: `In ${subject || 'Computer Science'} (${topic || 'Algorithms'}), what happens when using multiple standalone 'if' statements instead of an 'if-elif-else' ladder?`,
      options: [
        'Every single condition is evaluated independently, even if an earlier one was True',
        'Python raises a SyntaxError at runtime',
        'Only the last condition gets executed',
        'Execution performance is identical in all runtimes'
      ],
      correctOptionIndex: 0,
      hint1: 'Consider what happens when multiple separate conditions evaluate to True.',
      hint2: 'Standalone if statements do not halt when one matches.',
      solutionExplanation: 'Multiple independent if statements evaluate each check sequentially.'
    },
    {
      id: 12,
      scope: 'subject',
      type: 'mcq',
      title: 'Recursion Base Condition',
      prompt: 'What error occurs if a recursive function does not define or reach its base condition?',
      options: ['RecursionError: maximum recursion depth exceeded', 'ZeroDivisionError', 'MemoryIndexError', 'TypeError'],
      correctOptionIndex: 0,
      hint1: 'The call stack grows indefinitely with each recursive frame.',
      hint2: 'Python guards against stack overflow with a recursion depth limit.',
      solutionExplanation: 'Unbounded recursion exhausts the call stack, raising RecursionError.'
    },
    {
      id: 13,
      scope: 'subject',
      type: 'predict',
      title: 'Recursion Call Stack Trace',
      prompt: 'If `def f(n): return 1 if n <= 1 else n * f(n-1)`, what is the return value of `f(4)`?',
      expectedKeywords: ['24'],
      hint1: '4 * 3 * 2 * 1.',
      hint2: 'Factorial of 4.',
      solutionExplanation: 'f(4) evaluates to 4 * 3 * 2 * 1 = 24.'
    },
    {
      id: 14,
      scope: 'subject',
      type: 'mcq',
      title: 'Time Complexity of Binary Search',
      prompt: 'What is the worst-case time complexity of searching an element in a sorted array using binary search?',
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
      correctOptionIndex: 0,
      hint1: 'The search space is divided in half on each step.',
      hint2: 'Repeatedly dividing by 2 yields logarithmic complexity.',
      solutionExplanation: 'Binary search splits the search interval in half every iteration, running in O(log n).'
    },
    {
      id: 15,
      scope: 'subject',
      type: 'mcq',
      title: 'Space Complexity of Recursive Factorial',
      prompt: 'What is the auxiliary stack space complexity of calculating factorial(n) recursively?',
      options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
      correctOptionIndex: 0,
      hint1: 'Each recursive call adds a new stack frame to memory.',
      hint2: 'There are n simultaneous stack frames at maximum depth.',
      solutionExplanation: 'The call stack holds n active function frames before hitting the base case, taking O(n) space.'
    },
    {
      id: 16,
      scope: 'subject',
      type: 'predict',
      title: 'Array Indexing',
      prompt: 'In an array of length N, what is the zero-based index of the last element?',
      expectedKeywords: ['n-1', 'n - 1'],
      hint1: 'The first element is at index 0.',
      hint2: 'Subtract 1 from the total length.',
      solutionExplanation: 'Zero-based indexing places the final element at index N - 1.'
    },
    {
      id: 17,
      scope: 'subject',
      type: 'mcq',
      title: 'Data Structures: LIFO vs FIFO',
      prompt: 'Which data structure enforces Last-In, First-Out (LIFO) order?',
      options: ['Stack', 'Queue', 'Linked List', 'Binary Tree'],
      correctOptionIndex: 0,
      hint1: 'Think of a stack of plates: the last plate placed on top is the first one removed.',
      hint2: 'Queues are FIFO, while stacks are LIFO.',
      solutionExplanation: 'A Stack strictly enforces LIFO order (Push/Pop operations).'
    },
    {
      id: 18,
      scope: 'subject',
      type: 'predict',
      title: 'Recursion Depth',
      prompt: 'In a binary recursion tree of depth 3 where every non-leaf node calls itself twice, how many leaf calls occur at depth 3?',
      expectedKeywords: ['8', '2^3'],
      hint1: 'Each level doubles the number of calls (2^depth).',
      hint2: '2 raised to the power of 3.',
      solutionExplanation: 'At depth d with branching factor 2, the number of leaf calls is 2^3 = 8.'
    },
    {
      id: 19,
      scope: 'subject',
      type: 'mcq',
      title: 'Pass by Assignment',
      prompt: 'In Python, passing a mutable list to a function and modifying it with `.append()` modifies the original list. Why?',
      options: [
        'Python passes references to objects by assignment (call-by-sharing)',
        'Lists are stored as global variables automatically',
        'Python creates a deep copy before function execution',
        'Functions always return lists by default'
      ],
      correctOptionIndex: 0,
      hint1: 'Variables in Python hold references to objects in memory.',
      hint2: 'Both the caller and function point to the same list instance in heap memory.',
      solutionExplanation: 'Python uses pass-by-assignment; modifying a mutable object affects the underlying reference.'
    },
    {
      id: 20,
      scope: 'subject',
      type: 'predict',
      title: 'Divide and Conquer Base Step',
      prompt: 'In merge sort, at what sub-array size does the recursion stop dividing?',
      expectedKeywords: ['1', 'one', '<= 1'],
      hint1: 'An array of this length is inherently sorted.',
      hint2: 'When only a single element remains.',
      solutionExplanation: 'Recursion stops when sub-arrays reach length 1, which are trivially sorted.'
    }
  ];

  // Quiz State Tracking
  const [practiceScope, setPracticeScope] = useState<PracticeScope>('file');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [userAnswersRecord, setUserAnswersRecord] = useState<Record<number, boolean>>({});
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState<{
    status: 'correct' | 'incorrect' | null;
    message: string;
  }>({ status: null, message: '' });

  // Get current 10 questions for the active scope
  const scopedQuestions = questionBank.filter(q => q.scope === practiceScope);
  const totalQuestions = scopedQuestions.length; // Exactly 10
  const activeQuestion = scopedQuestions[activeQuestionIndex] || scopedQuestions[0];

  // Total answered questions count
  const answeredCount = Object.keys(userAnswersRecord).length;
  const correctCount = Object.values(userAnswersRecord).filter(Boolean).length;

  // Handle switching scopes
  const handleScopeChange = (newScope: PracticeScope) => {
    setPracticeScope(newScope);
    setActiveQuestionIndex(0);
    setSelectedOption(null);
    setTextAnswer('');
    setHintLevel(0);
    setUserAnswersRecord({});
    setIsQuizComplete(false);
    setQuestionFeedback({ status: null, message: '' });
  };

  // Evaluate Answer
  const handleVerifyAnswer = () => {
    if (!activeQuestion) return;

    let isCorrect = false;
    if (activeQuestion.type === 'mcq') {
      if (selectedOption === null) return;
      isCorrect = selectedOption === activeQuestion.correctOptionIndex;
    } else {
      if (!textAnswer.trim()) return;
      const normalized = textAnswer.toLowerCase().trim();
      isCorrect = !!activeQuestion.expectedKeywords?.some(k => normalized.includes(k.toLowerCase()));
    }

    // Save to progress record
    setUserAnswersRecord(prev => ({
      ...prev,
      [activeQuestion.id]: isCorrect
    }));

    setQuestionFeedback({
      status: isCorrect ? 'correct' : 'incorrect',
      message: isCorrect
        ? `Correct! ${activeQuestion.solutionExplanation}`
        : `Review the logic. ${activeQuestion.solutionExplanation}`
    });
  };

  // Next Question
  const handleNextQuestion = () => {
    if (activeQuestionIndex + 1 < totalQuestions) {
      setActiveQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTextAnswer('');
      setHintLevel(0);
      setQuestionFeedback({ status: null, message: '' });
    } else {
      setIsQuizComplete(true);
    }
  };

  // Previous Question
  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
      setSelectedOption(null);
      setTextAnswer('');
      setHintLevel(0);
      setQuestionFeedback({ status: null, message: '' });
    }
  };

  // Reset Quiz
  const handleRestartQuiz = () => {
    setActiveQuestionIndex(0);
    setSelectedOption(null);
    setTextAnswer('');
    setHintLevel(0);
    setUserAnswersRecord({});
    setIsQuizComplete(false);
    setQuestionFeedback({ status: null, message: '' });
  };

  const handleLoadSnippetInEditor = (snippet: string) => {
    setCode(snippet);
    setMode('editor');
    if (onActivitySelect) onActivitySelect('code');
  };
  // ==========================================
  // 1. WELCOME SCREEN
  // ==========================================
  if (mode === 'welcome') {
    return (
      <section className="flex-1 min-w-0 h-full flex flex-col justify-between items-center text-center p-6 lg:p-10 relative bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] overflow-y-auto">
        <div className="max-w-xl w-full my-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-[#f7f3e9] border border-[#c0c9c2] rounded-full flex items-center justify-center shadow-sm mb-6">
            <School className="text-[#013626] w-8 h-8" />
          </div>

          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#013626] mb-3 uppercase tracking-wide">
            Welcome to DevSarthi
          </h1>

          <p className="font-sans text-base text-[#414944] font-medium mb-1">
            Start your first learning session.
          </p>

          <p className="font-sans text-sm text-[#4B635B] mb-8 max-w-md leading-relaxed">
            Bring your study material and choose how you want to learn, practice, or code.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 w-full">
            <label className="bg-[#013626] text-[#FDF9EF] font-sans font-semibold text-sm rounded-lg py-2.5 px-6 hover:bg-[#001f14] transition-all shadow-md flex items-center gap-2 cursor-pointer">
              <span className="text-lg leading-none">+</span>
              Add Your First Source
              <input type="file" className="hidden" onChange={onFileUpload} />
            </label>
            <button
              onClick={() => setMode('entry')}
              className="border border-[#013626] text-[#013626] font-sans font-semibold text-sm rounded-lg py-2.5 px-6 hover:bg-[#f7f3e9] transition-colors bg-transparent"
            >
              Start Without a Source
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-2xl border-t border-[#c0c9c2]/40 pt-6 mt-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-[#c0c9c2]/30">
              <Library className="w-5 h-5 text-[#013626] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-semibold text-xs text-[#013626] uppercase">Add Material</h3>
                <p className="font-sans text-[11px] text-[#4B635B] mt-0.5 leading-snug">PDFs · Documents · Links · Videos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-[#c0c9c2]/30">
              <Terminal className="w-5 h-5 text-[#013626] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-semibold text-xs text-[#013626] uppercase">Practice</h3>
                <p className="font-sans text-[11px] text-[#4B635B] mt-0.5 leading-snug">Solve problems and experiment with code</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-[#c0c9c2]/30">
              <Lightbulb className="w-5 h-5 text-[#013626] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-semibold text-xs text-[#013626] uppercase">Get Guidance</h3>
                <p className="font-sans text-[11px] text-[#4B635B] mt-0.5 leading-snug">Learn through Socratic guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // 2. ENTRY & ACTIVITY SELECTOR SCREEN
  // ==========================================
  if (mode === 'entry') {
    if (!(subject && topic)) {
      if (showSetup) {
        return (
          <div className="flex-1 min-w-0 flex flex-col p-6 lg:p-12 overflow-y-auto bg-[#FDF9EF] rounded-xl border border-[#c0c9c2]">
            <div className="max-w-md mx-auto w-full my-auto flex flex-col justify-center">
              <div className="text-center mb-6">
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#013626] mb-2 tracking-tight">START LEARNING SESSION</h1>
                <p className="font-sans text-sm text-[#4B635B]">Set up your session for {activeFile || 'your workspace'}</p>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block font-sans font-semibold text-sm text-[#013626] mb-1">Subject</label>
                  <input
                    type="text"
                    value={tempSubject}
                    onChange={e => setTempSubject(e.target.value)}
                    className="w-full border border-[#c0c9c2] rounded-lg px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#013626]"
                    placeholder="e.g. Data Structures"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-sm text-[#013626] mb-1">Topic</label>
                  <input
                    type="text"
                    value={tempTopic}
                    onChange={e => setTempTopic(e.target.value)}
                    className="w-full border border-[#c0c9c2] rounded-lg px-4 py-2.5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#013626]"
                    placeholder="e.g. Recursion"
                  />
                </div>
                <button
                  onClick={() => onStartSession && onStartSession(tempSubject, tempTopic)}
                  disabled={!tempSubject || !tempTopic}
                  className="mt-3 bg-[#013626] text-[#FDF9EF] font-sans font-semibold text-sm rounded-lg py-2.5 px-6 hover:bg-[#001f14] transition-all disabled:opacity-50 shadow-md"
                >
                  Start Session
                </button>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="flex-1 min-w-0 flex flex-col p-6 lg:p-12 overflow-y-auto bg-[#FDF9EF] rounded-xl border border-[#c0c9c2]">
          <div className="max-w-xl mx-auto w-full my-auto flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-[#f7f3e9] border border-[#c0c9c2] rounded-full mb-6 flex items-center justify-center shadow-sm">
              <School className="text-[#013626] w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#013626] mb-3 tracking-tight">Source Added Successfully</h1>
            <p className="font-sans text-sm lg:text-base text-[#4B635B] mb-6 max-w-md">
              Start a learning session to begin reading, practicing, or coding with {activeFile || 'your file'}.
            </p>
            <button
              onClick={() => setShowSetup(true)}
              className="bg-[#013626] text-[#FDF9EF] font-sans font-semibold text-sm rounded-lg py-3 px-8 hover:bg-[#001f14] transition-all shadow-md"
            >
              Start Learning Session
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 min-w-0 flex flex-col p-6 lg:p-10 overflow-y-auto bg-[#FDF9EF] rounded-xl border border-[#c0c9c2]">
        <div className="max-w-3xl mx-auto w-full my-auto flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl lg:text-4xl font-bold text-[#013626] mb-2 tracking-tight">What would you like to do?</h1>
            <p className="font-sans text-sm lg:text-base text-[#4B635B]">
              Select an activity to begin your session with {subject} &middot; {topic}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setMode('viewer');
                if (onActivitySelect) onActivitySelect('read');
              }}
              className="group flex flex-col items-center justify-center p-6 bg-white border border-[#c0c9c2] rounded-2xl hover:border-[#013626] hover:shadow-md transition-all text-center"
            >
              <div className="h-12 w-12 rounded-full bg-[#f7f3e9] flex items-center justify-center text-[#013626] mb-4 group-hover:bg-[#013626] group-hover:text-[#FDF9EF] transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#013626] mb-1">Read</h3>
              <p className="font-sans text-xs text-[#4B635B]">Review source material with guided notes.</p>
            </button>

            <button
              onClick={() => {
                setMode('practice');
                if (onActivitySelect) onActivitySelect('practice');
              }}
              className="group flex flex-col items-center justify-center p-6 bg-white border border-[#c0c9c2] rounded-2xl hover:border-[#013626] hover:shadow-md transition-all text-center"
            >
              <div className="h-12 w-12 rounded-full bg-[#f7f3e9] flex items-center justify-center text-[#013626] mb-4 group-hover:bg-[#013626] group-hover:text-[#FDF9EF] transition-colors">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#013626] mb-1">Practice</h3>
              <p className="font-sans text-xs text-[#4B635B]">Test knowledge with auto-generated questions.</p>
            </button>

            <button
              onClick={() => {
                setMode('editor');
                if (onActivitySelect) onActivitySelect('code');
              }}
              className="group flex flex-col items-center justify-center p-6 bg-white border border-[#c0c9c2] rounded-2xl hover:border-[#013626] hover:shadow-md transition-all text-center"
            >
              <div className="h-12 w-12 rounded-full bg-[#f7f3e9] flex items-center justify-center text-[#013626] mb-4 group-hover:bg-[#013626] group-hover:text-[#FDF9EF] transition-colors">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#013626] mb-1">Code</h3>
              <p className="font-sans text-xs text-[#4B635B]">Write and execute code based on the unit.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. READ MODE ('viewer') - UNIVERSAL VIEWER
  // ==========================================
  if (mode === 'viewer') {
    // 3A. Images
    if (activeFileType === 'image') {
      return (
        <div className="flex-1 min-w-0 flex flex-col bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] p-4 overflow-hidden h-full">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <h2 className="text-[#013626] font-semibold text-sm truncate">{activeFile}</h2>
            <span className="text-xs text-[#4B635B] bg-[#f7f3e9] px-2.5 py-1 rounded-md border border-[#c0c9c2]">Image</span>
          </div>
          <div className="flex-1 w-full flex items-center justify-center bg-white rounded-lg border border-[#c0c9c2] overflow-hidden p-4 shadow-sm">
            <img src={code} alt={activeFile} className="max-w-full max-h-[70vh] object-contain rounded-md" />
          </div>
        </div>
      );
    }

    // 3B. PDFs
    if (activeFileType === 'pdf') {
      return (
        <div className="flex-1 min-w-0 flex flex-col bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] p-4 overflow-hidden h-full">
          <div className="w-full flex items-center justify-between mb-2 px-2">
            <h2 className="text-[#013626] font-semibold text-sm truncate">{activeFile}</h2>
            <span className="text-xs text-[#4B635B] bg-[#f7f3e9] px-2.5 py-1 rounded-md border border-[#c0c9c2]">PDF Viewer</span>
          </div>
          <div className="flex-1 w-full bg-white rounded-lg border border-[#c0c9c2] overflow-hidden shadow-sm">
            <iframe src={code} title={activeFile} className="w-full h-full border-none" />
          </div>
        </div>
      );
    }

    // 3C. Videos
    if (activeFileType === 'video') {
      return (
        <div className="flex-1 min-w-0 flex flex-col bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] p-4 overflow-hidden h-full">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <h2 className="text-[#013626] font-semibold text-sm truncate">{activeFile}</h2>
            <span className="text-xs text-[#4B635B] bg-[#f7f3e9] px-2.5 py-1 rounded-md border border-[#c0c9c2]">Video</span>
          </div>
          <div className="flex-1 w-full flex items-center justify-center bg-black/90 rounded-lg border border-[#c0c9c2] overflow-hidden shadow-sm p-2">
            <video src={code} controls className="w-full max-h-[70vh] rounded-md">
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      );
    }

    // 3D. YouTube Player (Bulletproof Video ID Extractor)
    if (activeFileType === 'youtube') {
      const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return '';
        // Handles youtu.be/<id>?si=..., youtube.com/watch?v=<id>&..., youtube.com/embed/<id>
        const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
        const match = url.match(regExp);
        const videoId = match ? match[1] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      };

      const embedUrl = getYouTubeEmbedUrl(code);

      return (
        <div className="flex-1 min-w-0 flex flex-col bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] p-4 overflow-hidden h-full">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <h2 className="text-[#013626] font-semibold text-sm truncate">{activeFile}</h2>
            <span className="text-xs text-[#4B635B] bg-[#f7f3e9] px-2.5 py-1 rounded-md border border-[#c0c9c2]">YouTube</span>
          </div>
          <div className="flex-1 w-full bg-black rounded-lg border border-[#c0c9c2] overflow-hidden shadow-sm flex items-center justify-center min-h-[380px]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={activeFile}
                className="w-full h-full min-h-[380px] border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-gray-300 text-xs text-center p-6">
                Unable to load video. Link: {code}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3E. Code and Documents (Read-Only Document View)
    return (
      <div className="flex-1 min-w-0 flex flex-col bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] p-4 overflow-hidden h-full">
        <div className="w-full flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[#013626] font-semibold text-sm truncate">{activeFile || 'Document'}</h2>
            <span className="text-[11px] text-[#4B635B] bg-[#f7f3e9] px-2 py-0.5 rounded border border-[#c0c9c2] uppercase">
              {language || activeFileType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onToggleSplitView && (
              <button
                onClick={onToggleSplitView}
                className={`text-xs px-3 py-1 rounded-md transition-colors shadow-sm flex items-center gap-1.5 ${isSplitView ? 'bg-[#013626] text-white hover:bg-[#001f14]' : 'bg-white border border-[#c0c9c2] text-[#013626] hover:bg-[#f7f3e9]'}`}
                title="Toggle Split View"
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                {isSplitView ? 'Close Split' : 'Split View'}
              </button>
            )}
            {activeFileType === 'code' && (
              <button
                onClick={() => {
                  setMode('editor');
                  if (onActivitySelect) onActivitySelect('code');
                }}
                className="text-xs bg-[#013626] text-white px-3 py-1 rounded-md hover:bg-[#001f14] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                Open in Editor <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 w-full bg-white rounded-lg border border-[#c0c9c2] shadow-sm p-5 overflow-y-auto font-mono text-xs md:text-sm text-[#1c1c16] whitespace-pre-wrap leading-relaxed">
          {code || '// No content available in this file'}
        </div>
      </div>
    );
  }


  // ==========================================
  // 4. PRACTICE MODE ('practice') - 10 QUESTION QUIZ
  // ==========================================
  if (mode === 'practice') {
    return (
      <div className="flex-1 min-w-0 flex flex-col bg-[#FDF9EF] rounded-xl border border-[#c0c9c2] p-5 lg:p-7 overflow-y-auto h-full">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">

          {/* Top Scope Pill & Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#c0c9c2]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f7f3e9] border border-[#c0c9c2] rounded-full flex items-center justify-center shadow-sm shrink-0">
                <Brain className="text-[#013626] w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-lg lg:text-xl font-bold text-[#013626]">Practice Arena</h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-[#013626] text-[#FDF9EF] rounded-full">
                    {answeredCount}/{totalQuestions} Completed
                  </span>
                </div>
                <p className="text-xs text-[#4B635B] mt-0.5">
                  {practiceScope === 'file' ? (
                    <>Grounded on File: <strong className="text-[#013626]">{activeFile || 'Active Source'}</strong></>
                  ) : (
                    <>Grounded on Session: <strong className="text-[#013626]">{subject} &middot; {topic}</strong></>
                  )}
                </p>
              </div>
            </div>

            {/* Scope Switcher Selector */}
            <div className="flex items-center bg-white border border-[#c0c9c2] p-1 rounded-lg shadow-sm">
              <button
                onClick={() => handleScopeChange('file')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${practiceScope === 'file'
                  ? 'bg-[#013626] text-[#FDF9EF] shadow-xs'
                  : 'text-[#4B635B] hover:text-[#013626] hover:bg-[#f7f3e9]'
                  }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                Focused File (10 Qs)
              </button>
              <button
                onClick={() => handleScopeChange('subject')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${practiceScope === 'subject'
                  ? 'bg-[#013626] text-[#FDF9EF] shadow-xs'
                  : 'text-[#4B635B] hover:text-[#013626] hover:bg-[#f7f3e9]'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Entire Subject (10 Qs)
              </button>
            </div>
          </div>

          {/* Progress Bar (0/10 to 10/10) */}
          <div className="w-full bg-[#f7f3e9] rounded-full h-2 overflow-hidden border border-[#c0c9c2]/60">
            <div
              className="bg-[#013626] h-full transition-all duration-300 ease-out"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Results Card if Quiz is Finished */}
          {isQuizComplete ? (
            <div className="w-full bg-white border border-[#c0c9c2] rounded-xl p-8 shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#013626]">Quiz Completed!</h2>
              <p className="text-sm text-[#4B635B] max-w-md">
                You completed all 10 practice questions for{' '}
                <strong>{practiceScope === 'file' ? activeFile : `${subject} · ${topic}`}</strong>.
              </p>
              <div className="text-xl font-bold text-[#013626] bg-[#f7f3e9] px-6 py-2 rounded-full border border-[#c0c9c2]">
                Final Score: {correctCount} / {totalQuestions}
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="bg-[#013626] text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-[#001f14] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
                </button>
                <button
                  onClick={() => {
                    setMode('editor');
                    if (onActivitySelect) onActivitySelect('code');
                  }}
                  className="border border-[#013626] text-[#013626] text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-[#f7f3e9] transition-all flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" /> Back to Editor
                </button>
              </div>
            </div>
          ) : (
            /* Active Question Card */
            <div className="w-full bg-white border border-[#c0c9c2] rounded-xl p-6 shadow-sm flex flex-col gap-4">
              {/* Question Meta Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#013626] bg-[#f7f3e9] border border-[#c0c9c2] px-2.5 py-0.5 rounded-md">
                    Question {activeQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {activeQuestion.title}
                  </span>
                </div>
                <span className="text-xs text-[#4B635B] font-mono capitalize">
                  {activeQuestion.type === 'mcq' ? 'Multiple Choice' : activeQuestion.type === 'fix' ? 'Syntax Fix' : 'Output Trace'}
                </span>
              </div>

              {/* Prompt Text */}
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                {activeQuestion.prompt}
              </p>

              {/* Snippet Block (if present) */}
              {activeQuestion.codeSnippet && (
                <div className="relative rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a]">
                  <div className="bg-[#121212] px-3 py-1.5 flex items-center justify-between border-b border-[#2a2a2a]">
                    <span className="text-[11px] font-mono text-emerald-400">code_reference.py</span>
                    <button
                      onClick={() => handleLoadSnippetInEditor(activeQuestion.codeSnippet!)}
                      className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      Open in Editor <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs text-gray-200 overflow-x-auto whitespace-pre leading-relaxed">
                    {activeQuestion.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Question Input Area */}
              {activeQuestion.type === 'mcq' && activeQuestion.options ? (
                <div className="grid grid-cols-1 gap-2 mt-1">
                  {activeQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`text-left text-xs p-3 rounded-lg border transition-all flex items-start gap-3 ${isSelected
                          ? 'bg-[#f7f3e9] border-[#013626] text-[#013626] font-semibold ring-1 ring-[#013626]'
                          : 'bg-white border-[#c0c9c2]/70 text-gray-700 hover:bg-[#FDF9EF]/60 hover:border-[#013626]'
                          }`}
                      >
                        <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#013626] text-white border-[#013626]' : 'border-[#c0c9c2] text-gray-500'
                          }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="mt-0.5 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-1">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder={
                      activeQuestion.type === 'fix'
                        ? 'Type the corrected keyword or code statement here...'
                        : 'Type the exact string or value printed to console...'
                    }
                    rows={3}
                    className="w-full text-xs font-mono p-3 bg-[#FDF9EF]/40 border border-[#c0c9c2] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#013626] resize-none"
                  />
                </div>
              )}

              {/* Hints and Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#c0c9c2]/40">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHintLevel(prev => (prev === 0 ? 1 : prev === 1 ? 2 : 0))}
                    className="text-xs text-[#4B635B] hover:text-[#013626] flex items-center gap-1 font-medium transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    {hintLevel === 0 ? 'Show Hint (1/2)' : hintLevel === 1 ? 'Show Hint (2/2)' : 'Hide Hints'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${hintLevel > 0 ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIndex === 0}
                    className="text-xs text-[#4B635B] hover:text-[#013626] px-3 py-1.5 rounded-lg border border-[#c0c9c2] hover:bg-[#f7f3e9] transition-colors disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleVerifyAnswer}
                    disabled={activeQuestion.type === 'mcq' ? selectedOption === null : !textAnswer.trim()}
                    className="bg-[#013626] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[#001f14] transition-all disabled:opacity-50 shadow-sm"
                  >
                    Check Answer
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="text-xs bg-[#f7f3e9] border border-[#013626] text-[#013626] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#e6e0d3] transition-colors flex items-center gap-1"
                  >
                    {activeQuestionIndex + 1 === totalQuestions ? 'Finish Quiz' : 'Next'} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Progressive Hint Box */}
              {hintLevel >= 1 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-950 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p><strong className="font-semibold text-amber-900">Hint 1:</strong> {activeQuestion.hint1}</p>
                    {hintLevel === 2 && (
                      <p className="pt-1 border-t border-amber-200/60">
                        <strong className="font-semibold text-amber-900">Hint 2:</strong> {activeQuestion.hint2}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Banner */}
              {questionFeedback.status && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${questionFeedback.status === 'correct'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border border-red-300 text-red-900'
                    }`}
                >
                  {questionFeedback.status === 'correct' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{questionFeedback.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions: DevSarthi Tutor & Switch to Code */}
          {!isQuizComplete && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={() => onAnalyze({
                  fileName: activeFile,
                  snippet: `Question ${activeQuestionIndex + 1}/${totalQuestions}: ${activeQuestion.prompt}\n${activeQuestion.codeSnippet ? `Code:\n${activeQuestion.codeSnippet}` : ''}`
                })}
                disabled={isAnalyzing}
                className="bg-[#013626] text-white font-medium text-xs rounded-lg py-2.5 px-4 hover:bg-[#001f14] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Discuss in DevSarthi Tutor
              </button>

              <button
                onClick={() => {
                  setMode('editor');
                  if (onActivitySelect) onActivitySelect('code');
                }}
                className="border border-[#013626] text-[#013626] font-medium text-xs rounded-lg py-2.5 px-4 hover:bg-[#f7f3e9] transition-all flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                Switch to Code Editor
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // 5. CODE EDITOR MODE ('editor')
  // ==========================================
  const isMediaContext = ['image', 'pdf', 'video', 'youtube'].includes(activeFileType);

  return (
    <div className="flex-1 min-w-0 flex flex-col z-10 relative overflow-hidden rounded-xl shadow-lg border border-[#1a1a1a] h-full bg-[#1e1e1e]">
      {/* Context banner if non-code file is active */}
      {isMediaContext && (
        <div className="bg-[#18261e] border-b border-[#2d4737] px-4 py-2 flex items-center justify-between text-xs text-[#a0d1ba] shrink-0">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              Attached Context: <strong>{activeFile}</strong> (DevSarthi Tutor has active reference)
            </span>
          </div>
          <button
            onClick={() => setMode('viewer')}
            className="text-xs underline hover:text-white shrink-0 ml-2"
          >
            View File
          </button>
        </div>
      )}

      {/* Code Editor Header */}
      <div className="bg-[#121212] px-4 py-2.5 flex justify-between items-center border-b border-[#2a2a2a] shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-gray-200 font-medium text-xs truncate max-w-[200px]">
            {isMediaContext ? 'scratchpad.py' : activeFile || 'untitled.py'}
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 uppercase">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onToggleSplitView && (
            <button
              onClick={onToggleSplitView}
              className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 shadow-sm ${isSplitView ? 'bg-[#013626] text-white hover:bg-[#001f14]' : 'border border-[#333] text-gray-200 hover:bg-[#2a2a2a]'}`}
              title="Toggle Split View"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              {isSplitView ? 'Close Split' : 'Split View'}
            </button>
          )}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3 py-1 bg-[#013626] text-white rounded text-xs hover:bg-[#001f14] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleAskDevSarthi}
            disabled={isAnalyzing}
            className="px-3 py-1 border border-[#333] text-gray-200 rounded text-xs hover:bg-[#2a2a2a] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Brain className="w-3.5 h-3.5" /> Ask DevSarthi
          </button>
        </div>
      </div>

      {/* Monaco Container (Splits height dynamically when terminal opens) */}
      <div
        className="relative min-h-0 transition-all duration-200 ease-in-out"
        style={{ height: isTerminalOpen ? '65%' : '100%' }}
      >
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          value={isMediaContext ? '// Write your solution while reviewing: ' + activeFile + '\n\n' : code}
          onChange={(value) => setCode(value || '')}
          onMount={(editor) => {
            editorRef.current = editor;
            editor.onDidChangeCursorSelection((e: any) => {
              const selection = editor.getSelection();
              if (selection && !selection.isEmpty()) {
                const model = editor.getModel();
                if (!model) return;
                const selectedText = model.getValueInRange(selection);
                
                // Show floating menu only if enough text is selected
                if (selectedText.length > 2) {
                  const position = editor.getScrolledVisiblePosition(selection.getEndPosition());
                  if (position) {
                    setInlineMenuPos({ top: position.top + 30, left: position.left });
                    setSelectedSnippet(selectedText);
                    return;
                  }
                }
              }
              setInlineMenuPos(null);
              setSelectedSnippet('');
            });
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            lineHeight: 22,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            formatOnPaste: true,
          }}
        />

        {inlineMenuPos && selectedSnippet && (
          <div 
            className="absolute z-30 flex items-center gap-1 bg-[#1e1e1e] border border-[#333] shadow-2xl rounded-lg p-1.5 pointer-events-auto"
            style={{ top: inlineMenuPos.top, left: inlineMenuPos.left }}
          >
            <button 
              onClick={() => {
                onAnalyze({ snippet: selectedSnippet, fileName: activeFile });
                setInlineMenuPos(null);
              }}
              className="px-2 py-1 flex items-center gap-1.5 text-xs font-semibold bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#a0d1ba] rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Explain
            </button>
            <div className="w-[1px] h-4 bg-[#333] mx-1"></div>
            <button 
              onClick={() => {
                onAnalyze({ snippet: selectedSnippet + "\n\nCan you help me fix or debug this?", fileName: activeFile });
                setInlineMenuPos(null);
              }}
              className="px-2 py-1 flex items-center gap-1.5 text-xs text-gray-300 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" /> Debug
            </button>
            <button 
              onClick={() => {
                onAnalyze({ snippet: selectedSnippet + "\n\nHow can I optimize this code?", fileName: activeFile });
                setInlineMenuPos(null);
              }}
              className="px-2 py-1 flex items-center gap-1.5 text-xs text-gray-300 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Optimize
            </button>
          </div>
        )}

        {code.includes('factorial') && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#333] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xl backdrop-blur-md z-20">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs text-gray-300">Runtime Issue on line 3</span>
            <button
              onClick={() => onAnalyze()}
              className="text-[#a0d1ba] text-xs hover:text-white transition-colors flex items-center gap-1 ml-1"
            >
              Get hint <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Terminal Drawer */}
      {isTerminalOpen ? (
        <div className="h-[35%] bg-[#0d0d0d] border-t border-[#2a2a2a] flex flex-col z-20 shrink-0">
          {/* Terminal Title Bar */}
          <div className="bg-[#161616] px-3 py-1.5 border-b border-[#242424] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300 font-mono">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terminal Output</span>
              {isRunning && <span className="text-[10px] text-amber-400 animate-pulse">(running...)</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTerminalOutput([])}
                className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
                title="Clear Output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
                title="Close Terminal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="flex-1 p-3 font-mono text-xs text-gray-300 overflow-y-auto space-y-1">
            {terminalOutput.length === 0 ? (
              <span className="text-gray-500 italic">No output yet. Click 'Run' to execute.</span>
            ) : (
              terminalOutput.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${line.includes('SyntaxError') || line.includes('Traceback')
                    ? 'text-red-400 font-semibold'
                    : line.includes('Output:')
                      ? 'text-emerald-400 font-semibold'
                      : 'text-gray-300'
                    }`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Reopen Terminal Toggle Bar (Minimized) */
        <button
          onClick={() => setIsTerminalOpen(true)}
          className="bg-[#121212] hover:bg-[#181818] border-t border-[#242424] px-3 py-1 flex items-center gap-2 text-[11px] text-gray-400 hover:text-gray-200 transition-colors shrink-0"
        >
          <TerminalIcon className="w-3 h-3 text-emerald-400" />
          <span>Terminal</span>
          <ChevronUp className="w-3 h-3 ml-auto" />
        </button>
      )}
    </div>
  );
}