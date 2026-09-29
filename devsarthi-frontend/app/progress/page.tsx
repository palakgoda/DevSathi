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
    Timer,
    Activity,
    LogOut,
    Bell,
    ChevronDown,
    TrendingUp,
    CheckCircle2,
    Clock,
    Award
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Notebook = {
    id: string;
    title: string;
    subject: string;
    coverage: number;
};

export default function ProgressPage() {
    const router = useRouter();
    const [profile, setProfile] = useState({ fullName: 'Student', initials: 'ST' });
    const [stats, setStats] = useState({
        totalNotebooks: 0,
        avgCoverage: 0,
        focusSessions: 0,
        completedGoals: 4
    });
    const [subjectProgress, setSubjectProgress] = useState<{ subject: string; coverage: number; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProgressData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Fetch User Profile
            const { data: userData } = await supabase
                .from('users')
                .select('full_name, focus_sessions_this_week, total_sessions')
                .eq('id', user.id)
                .single();

            if (userData) {
                const nameParts = userData.full_name?.trim().split(' ') || [];
                const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                    : (userData.full_name?.slice(0, 2).toUpperCase() || 'ST');
                setProfile({ fullName: userData.full_name, initials });
            }

            // 2. Fetch Notebooks for Coverage & Stats
            const { data: notebooksData, error: nbError } = await supabase
                .from('notebooks')
                .select('id, title, subject, coverage')
                .eq('user_id', user.id);

            if (nbError) {
                console.error("Supabase Error [progress notebooks]:", nbError.message);
            }

            if (notebooksData) {
                const totalNbs = notebooksData.length;
                const totalCov = notebooksData.reduce((acc, curr) => acc + (curr.coverage || 0), 0);
                const avgCov = totalNbs > 0 ? Math.round(totalCov / totalNbs) : 0;

                setStats({
                    totalNotebooks: totalNbs,
                    avgCoverage: avgCov,
                    focusSessions: userData?.focus_sessions_this_week || 5,
                    completedGoals: userData?.total_sessions || 4
                });

                // Group by subject for breakdown
                const map: Record<string, { totalCov: number; count: number }> = {};
                notebooksData.forEach((nb) => {
                    const sub = nb.subject || 'General Studies';
                    if (!map[sub]) map[sub] = { totalCov: 0, count: 0 };
                    map[sub].totalCov += (nb.coverage || 0);
                    map[sub].count += 1;
                });

                const subjectBreakdown = Object.keys(map).map((sub) => ({
                    subject: sub,
                    coverage: Math.round(map[sub].totalCov / map[sub].count),
                    count: map[sub].count,
                }));

                setSubjectProgress(subjectBreakdown);
            }

            setLoading(false);
        }

        loadProgressData();
    }, [router]);
    return (
        <DashboardLayout>
            <div className="max-w-[1280px] mx-auto space-y-8">

                    {/* Header */}
                    <div className="border-b border-outline-variant/30 pb-6">
                        <h2 className="text-3xl font-bold text-primary font-serif tracking-tight">Academic Analytics & Growth</h2>
                        <p className="text-on-surface-variant mt-1">Deep-dive metrics tracking your syllabus completion, focus consistency, and subject mastery.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-on-surface-variant">Loading analytics data...</div>
                    ) : (
                        <>
                            {/* Stat Summary Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="glass-panel p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-label-caps text-on-surface-variant">Avg Syllabus Coverage</span>
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-3xl font-bold text-on-surface font-serif">{stats.avgCoverage}%</p>
                                    <p className="text-xs text-secondary mt-1">Across all registered notebooks</p>
                                </div>

                                <div className="glass-panel p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-label-caps text-on-surface-variant">Total Notebooks</span>
                                        <BookOpen className="w-5 h-5 text-secondary" />
                                    </div>
                                    <p className="text-3xl font-bold text-on-surface font-serif">{stats.totalNotebooks}</p>
                                    <p className="text-xs text-on-surface-variant mt-1">Active study units</p>
                                </div>

                                <div className="glass-panel p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-label-caps text-on-surface-variant">Focus Sessions</span>
                                        <Timer className="w-5 h-5 text-tertiary" />
                                    </div>
                                    <p className="text-3xl font-bold text-on-surface font-serif">{stats.focusSessions}</p>
                                    <p className="text-xs text-tertiary mt-1">Completed this week</p>
                                </div>

                                <div className="glass-panel p-6 rounded-xl border border-outline-variant/30 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-label-caps text-on-surface-variant">Milestones Met</span>
                                        <Award className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-3xl font-bold text-on-surface font-serif">100%</p>
                                    <p className="text-xs text-secondary mt-1">Target consistency rate</p>
                                </div>
                            </div>

                            {/* Subject Breakdown Progress Bars */}
                            <div className="glass-panel rounded-xl p-8 border border-outline-variant/30 shadow-sm bg-white/40 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-on-surface font-serif">Subject Mastery Breakdown</h3>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Real-time coverage progress for each academic course.</p>
                                </div>

                                {subjectProgress.length > 0 ? (
                                    <div className="space-y-5">
                                        {subjectProgress.map((item) => (
                                            <div key={item.subject} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-semibold text-on-surface">{item.subject}</span>
                                                    <span className="text-primary font-bold">{item.coverage}%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, item.coverage)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-on-surface-variant py-8 text-center">No subject analytics available yet. Create notebooks in AI Studio to populate charts.</p>
                                )}
                            </div>
                        </>
                    )}

                </div>        </DashboardLayout>
    );
}