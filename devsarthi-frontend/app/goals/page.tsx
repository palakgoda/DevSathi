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
    Target as TargetIcon,
    Timer,
    Activity,
    LogOut,
    Bell,
    ChevronDown,
    CheckCircle2,
    Plus,
    Flame,
    Award
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GoalsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState({ fullName: 'Student', initials: 'ST' });
    const [weeklyGoal, setWeeklyGoal] = useState(5);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadGoalsData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Fetch User Profile and Goals Data
            const { data: userData } = await supabase
                .from('users')
                .select('full_name, weekly_goal_sessions, total_sessions, focus_sessions_this_week')
                .eq('id', user.id)
                .single();

            if (userData) {
                const nameParts = userData.full_name?.trim().split(' ') || [];
                const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                    : (userData.full_name?.slice(0, 2).toUpperCase() || 'ST');
                setProfile({ fullName: userData.full_name, initials });

                if (userData.weekly_goal_sessions) setWeeklyGoal(userData.weekly_goal_sessions);
                setCompletedSessions(userData.focus_sessions_this_week || 0);
            }

            setLoading(false);
        }

        loadGoalsData();
    }, [router]);

    const handleUpdateGoal = async (newTarget: number) => {
        setWeeklyGoal(newTarget);
        setSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('users')
            .update({ weekly_goal_sessions: newTarget })
            .eq('id', user.id);

        setSaving(false);
    };

    const percentage = Math.min(100, Math.round((completedSessions / (weeklyGoal || 1)) * 100));

    return (
        <DashboardLayout>
                <div className="max-w-[1280px] mx-auto space-y-8">

                    {/* Header */}
                    <div className="border-b border-outline-variant/30 pb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-primary font-serif tracking-tight">Weekly Learning Goals</h2>
                            <p className="text-on-surface-variant mt-1">Set targets, manage habits, and keep your academic momentum strong.</p>
                        </div>
                        {saving && <span className="text-xs text-primary font-semibold">Saving changes...</span>}
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-on-surface-variant">Loading your goals...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Main Goal Card */}
                            <div className="lg:col-span-2 glass-panel p-8 rounded-xl border border-outline-variant/30 bg-white/40 shadow-sm space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-on-surface font-serif">Weekly Session Target</h3>
                                    <span className="text-sm font-bold text-primary bg-primary-container/30 px-3 py-1 rounded-full">
                                        {percentage}% Completed
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-on-surface-variant">Progress ({completedSessions} / {weeklyGoal} sessions)</span>
                                        <span className="font-bold text-primary">{percentage}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-outline-variant/20 space-y-3">
                                    <p className="text-xs font-label-caps text-on-surface-variant">Adjust Weekly Goal Target</p>
                                    <div className="flex gap-3">
                                        {[3, 5, 7, 10].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => handleUpdateGoal(num)}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${weeklyGoal === num
                                                    ? 'bg-primary text-on-primary shadow-sm'
                                                    : 'bg-surface hover:bg-surface-container border border-outline-variant/40 text-on-surface'
                                                    }`}
                                            >
                                                {num} Sessions
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Side Achievement Card */}
                            <div className="glass-panel p-6 rounded-xl border border-outline-variant/30 bg-white/40 shadow-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                                        <Flame className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface">Streak Active</h4>
                                        <p className="text-xs text-on-surface-variant">Consistent study routine</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-surface rounded-lg border border-outline-variant/20 space-y-2">
                                    <p className="text-sm font-medium text-on-surface flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-secondary" /> Goal Status
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        {completedSessions >= weeklyGoal
                                            ? 'Fantastic job! You have achieved your weekly learning goal.'
                                            : `Keep going! Only ${weeklyGoal - completedSessions} more session(s) left to hit your weekly target.`}
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}

                </div>
            
        </DashboardLayout>
    );
}