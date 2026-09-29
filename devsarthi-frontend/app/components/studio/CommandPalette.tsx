import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, FileText, Code2, PenTool, X, BookOpen, Brain, Terminal } from 'lucide-react';

type Action = {
    id: string;
    title: string;
    icon: React.FC<any>;
    onAction: () => void;
};

type CommandPaletteProps = {
    isOpen: boolean;
    onClose: () => void;
    onAskDevSarthi: (prompt: string) => void;
    onSwitchMode: (mode: string) => void;
};

export default function CommandPalette({ isOpen, onClose, onAskDevSarthi, onSwitchMode }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    const actions: Action[] = [
        { id: 'explain', title: 'Explain this concept (AI)', icon: Sparkles, onAction: () => onAskDevSarthi('Explain the current code/document context in simple terms.') },
        { id: 'summarize', title: 'Summarize file (AI)', icon: FileText, onAction: () => onAskDevSarthi('Provide a brief summary of the active file.') },
        { id: 'practice', title: 'Generate Quiz (AI)', icon: Brain, onAction: () => onSwitchMode('practice') },
        { id: 'mode_read', title: 'Switch to Read Mode', icon: BookOpen, onAction: () => onSwitchMode('viewer') },
        { id: 'mode_code', title: 'Switch to Code Editor', icon: Code2, onAction: () => onSwitchMode('editor') },
    ];

    const filteredActions = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-4 border-b border-gray-200/60">
                    <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Type a command or ask AI (e.g. Generate practice quiz)..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 placeholder-gray-400 font-sans"
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                if (filteredActions.length > 0) {
                                    filteredActions[0].onAction();
                                    onClose();
                                } else if (query.trim()) {
                                    onAskDevSarthi(query);
                                    onClose();
                                }
                            }
                            if (e.key === 'Escape') onClose();
                        }}
                    />
                    <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredActions.length > 0 ? (
                        <>
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Actions</div>
                            <div className="space-y-1">
                                {filteredActions.map((action, idx) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={() => {
                                                action.onAction();
                                                onClose();
                                            }}
                                            className={`w-full text-left flex items-center px-4 py-3 rounded-xl transition-all ${idx === 0 ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${idx === 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            <span className="font-medium text-sm">{action.title}</span>
                                            {idx === 0 && <span className="ml-auto text-xs text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded">Enter to select</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                            Press Enter to ask DevSarthi: "{query}"
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                    <span>Use <strong>Cmd+K</strong> or <strong>Ctrl+K</strong> to open</span>
                    <span>Use arrows to navigate</span>
                </div>
            </div>
        </div>
    );
}
