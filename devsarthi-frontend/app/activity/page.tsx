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
    Activity as ActivityIcon,
    LogOut,
    Bell,
    ChevronDown,
    Clock,
    CheckCircle2,
    FileText
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ActivityLogItem = {
    id: string;
    action: string;
    title?: string;
    created_at: string;
};

export default function ActivityPage() {
    const router = useRouter();
    const [profile, setProfile] = useState({ fullName: 'Student', initials: 'ST' });
    const [activities, setActivities] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadActivityData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Fetch Profile
            const { data: userData } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', user.id)
                .single();

            if (userData) {
                const nameParts = userData.full_name?.trim().split(' ') || [];
                const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                    : (userData.full_name?.slice(0, 2).toUpperCase() || 'ST');
                setProfile({ fullName: userData.full_name, initials });
            }

            // 2. Fetch Activity Log from Supabase
            const { data: logData, error } = await supabase
                .from('activity_log')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (logData && !error) {
                const validLogs = logData.filter((item: any) => 
                    (item.action && item.action.trim() !== '') || 
                    (item.title && item.title.trim() !== '')
                );
                setActivities(validLogs);
            }
            setLoading(false);
        }

        loadActivityData();
    }, [router]);

    return (
        <DashboardLayout>
                <div className="max-w-[1280px] mx-auto space-y-8">

                    {/* Header */}
                    <div className="border-b border-outline-variant/30 pb-6">
                        <h2 className="text-3xl font-bold text-primary font-serif tracking-tight">Activity Log</h2>
                        <p className="text-on-surface-variant mt-1">Complete historical audit trail of your academic actions across DevSarthi.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-on-surface-variant">Loading activity records...</div>
                    ) : activities.length > 0 ? (
                        <div className="glass-panel rounded-xl p-6 border border-outline-variant/30 bg-white/40 shadow-sm space-y-4">
                            <div className="space-y-3">
                                {activities.map((item) => (
                                    <div key={item.id} className="p-4 bg-surface rounded-lg border border-outline-variant/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-container/40 flex items-center justify-center text-primary shrink-0">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm font-medium text-on-surface">{item.title || item.action}</p>
                                        </div>
                                        <span className="text-xs text-on-surface-variant">
                                            {new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-24 glass-panel rounded-2xl p-12">
                            <ActivityIcon className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-on-surface">No activity recorded yet</h3>
                            <p className="text-sm text-on-surface-variant">Actions like creating notebooks or completing focus sessions will appear here.</p>
                        </div>
                    )}

                </div>
            
        </DashboardLayout>
    );
}