'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
    Component,
    Search,
    LayoutDashboard,
    Sparkles,
    BookOpen,
    LineChart,
    Calendar,
    Target,
    Timer as TimerIcon,
    Activity,
    LogOut,
    Bell,
    ChevronDown,
    Play,
    Pause,
    RotateCcw,
    CheckCircle,
    Flame
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FocusPage() {
    const router = useRouter();
    const [profile, setProfile] = useState({ fullName: 'Student', initials: 'ST' });
    const [loading, setLoading] = useState(true);

    // Timer States (25 mins work default)
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
    const [completedCount, setCompletedCount] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        async function loadFocusData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch Profile & Current Stats
            const { data: userData } = await supabase
                .from('users')
                .select('full_name, focus_sessions_this_week')
                .eq('id', user.id)
                .single();

            if (userData) {
                const nameParts = userData.full_name?.trim().split(' ') || [];
                const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                    : (userData.full_name?.slice(0, 2).toUpperCase() || 'ST');
                setProfile({ fullName: userData.full_name, initials });
                setCompletedCount(userData.focus_sessions_this_week || 4);
            }

            setLoading(false);
        }

        loadFocusData();
    }, [router]);

    // Timer Countdown Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            handleSessionComplete();
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const handleSessionComplete = async () => {
        if (sessionType === 'work') {
            const newCount = completedCount + 1;
            setCompletedCount(newCount);
            setStatusMessage('Focus session completed! Great job.');

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('users')
                    .update({ focus_sessions_this_week: newCount })
                    .eq('id', user.id);
            }
        } else {
            setStatusMessage('Break finished. Ready for the next focus session?');
        }
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = (type: 'work' | 'break') => {
        setIsRunning(false);
        setSessionType(type);
        setTimeLeft(type === 'work' ? 25 * 60 : 5 * 60);
        setStatusMessage('');
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <DashboardLayout>
                <div className="max-w-[1280px] mx-auto space-y-8">

                    {/* Header */}
                    <div className="border-b border-outline-variant/30 pb-6">
                        <h2 className="text-3xl font-bold text-primary font-serif tracking-tight">Focus Mode (Pomodoro)</h2>
                        <p className="text-on-surface-variant mt-1">Eliminate distractions and log continuous focus sessions into your student profile.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-on-surface-variant">Loading focus workspace...</div>
                    ) : (
                        <div className="max-w-xl mx-auto glass-panel p-8 rounded-2xl border border-outline-variant/30 bg-white/40 shadow-sm text-center space-y-8">

                            {/* Mode switch tabs */}
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => resetTimer('work')}
                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${sessionType === 'work' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                                        }`}
                                >
                                    Focus (25m)
                                </button>
                                <button
                                    onClick={() => resetTimer('break')}
                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${sessionType === 'break' ? 'bg-secondary text-on-secondary shadow-sm' : 'bg-surface text-on-surface-variant hover:bg-surface-container'
                                        }`}
                                >
                                    Break (5m)
                                </button>
                            </div>

                            {/* Timer Display */}
                            <div className="py-8">
                                <p className="text-7xl font-bold text-primary font-serif tracking-tight">{formattedTime}</p>
                                <p className="text-xs uppercase font-label-caps text-on-surface-variant mt-2">
                                    {sessionType === 'work' ? 'Deep Work Session' : 'Relaxation Break'}
                                </p>
                                {statusMessage && <p className="text-sm font-semibold text-secondary mt-4">{statusMessage}</p>}
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center gap-4">
                                {timeLeft === 0 ? (
                                    <>
                                        <button
                                            onClick={() => resetTimer('work')}
                                            className="px-6 py-3 bg-primary text-on-primary hover:bg-primary/90 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-colors"
                                        >
                                            <Play className="w-4 h-4" /> Continue Studying
                                        </button>
                                        <button
                                            onClick={() => resetTimer('break')}
                                            className="px-6 py-3 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-colors"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Take a Break
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={toggleTimer}
                                            className="px-8 py-3 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl font-bold text-base shadow-md flex items-center gap-2 transition-colors"
                                        >
                                            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                            <span>{isRunning ? 'Pause Session' : 'Start Session'}</span>
                                        </button>
                                        <button
                                            onClick={() => resetTimer(sessionType)}
                                            className="p-3 bg-surface hover:bg-surface-container text-on-surface-variant rounded-xl border border-outline-variant/40 transition-colors"
                                            title="Reset Timer"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Session counter badge */}
                            <div className="pt-4 border-t border-outline-variant/20 flex justify-center items-center gap-2 text-xs text-on-surface-variant">
                                <Flame className="w-4 h-4 text-primary" />
                                <span>Completed <strong className="text-on-surface">{completedCount}</strong> focus sessions this week</span>
                            </div>

                        </div>
                    )}

                </div>
            
        </DashboardLayout>
    );
}