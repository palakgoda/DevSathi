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
    Calendar as CalendarIcon,
    Target,
    Timer,
    Activity,
    LogOut,
    Bell,
    ChevronDown,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Clock,
    AlertCircle
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type EventItem = {
    id: string;
    title: string;
    event_date: string;
    event_type: string; // 'exam', 'submission', 'meeting', 'study'
};

export default function CalendarPage() {
    const router = useRouter();
    const [profile, setProfile] = useState({ fullName: 'Student', initials: 'ST' });
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State for Adding Event
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newType, setNewType] = useState('exam');

    // Month navigation state
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        async function loadCalendarData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Fetch User Profile
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

            // 2. Fetch Events from Supabase
            const { data: eventsData, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id)
                .order('event_date', { ascending: true });

            if (eventsData && !error) {
                setEvents(eventsData);
            }
            setLoading(false);
        }

        loadCalendarData();
    }, [router]);

    // Handle Adding Event
    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newDate) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('events')
            .insert([
                {
                    user_id: user.id,
                    title: newTitle,
                    event_date: newDate,
                    event_type: newType,
                }
            ])
            .select();

        if (data && !error) {
            setEvents([...events, data[0]]);
            setNewTitle('');
            setNewDate('');
            setIsModalOpen(false);
        } else {
            alert('Error adding event: ' + error?.message);
        }
    };

    // Handle Deleting Event
    const handleDeleteEvent = async (id: string) => {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (!error) {
            setEvents(events.filter((ev) => ev.id !== id));
        } else {
            alert('Error deleting event');
        }
    };

    // Calendar calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <DashboardLayout>
                <div className="max-w-[1280px] mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-outline-variant/30 pb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-primary font-serif tracking-tight">Academic Calendar</h2>
                            <p className="text-on-surface-variant mt-1">Manage exam dates, project deadlines, and sync your personalized planner.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Deadline</span>
                        </button>
                    </div>

                    {/* Calendar Grid Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left/Main: Month Grid */}
                        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-outline-variant/30 bg-white/40 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-on-surface font-serif">{monthName} {year}</h3>
                                <div className="flex gap-2">
                                    <button onClick={prevMonth} className="p-2 rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/30">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={nextMonth} className="p-2 rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/30">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 text-center text-xs font-label-caps text-on-surface-variant">
                                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>

                            {/* Days Matrix */}
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: firstDayIndex }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-24 bg-surface/30 rounded-lg opacity-40"></div>
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const dayNum = i + 1;
                                    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                    const dayEvents = events.filter((ev) => ev.event_date === formattedDate);

                                    return (
                                        <div key={dayNum} className="h-24 bg-surface rounded-lg p-2 border border-outline-variant/20 flex flex-col justify-between overflow-y-auto">
                                            <span className="text-xs font-bold text-on-surface-variant">{dayNum}</span>
                                            <div className="space-y-1">
                                                {dayEvents.map((ev) => (
                                                    <div key={ev.id} className="text-[10px] bg-primary-container text-primary font-semibold px-1.5 py-0.5 rounded truncate" title={ev.title}>
                                                        {ev.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Upcoming Events List & Quick Delete */}
                        <div className="glass-panel p-6 rounded-xl border border-outline-variant/30 bg-white/40 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-on-surface font-serif mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" /> All Deadlines
                                </h3>
                                {loading ? (
                                    <p className="text-sm text-on-surface-variant">Loading events...</p>
                                ) : events.length > 0 ? (
                                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                        {events.map((ev) => (
                                            <div key={ev.id} className="p-3 bg-surface rounded-lg border border-outline-variant/20 flex justify-between items-center group">
                                                <div>
                                                    <p className="text-sm font-medium text-on-surface">{ev.title}</p>
                                                    <p className="text-xs text-on-surface-variant mt-0.5">{ev.event_date} · <span className="uppercase text-primary font-semibold">{ev.event_type}</span></p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEvent(ev.id)}
                                                    className="text-on-surface-variant hover:text-error p-1.5 rounded-md hover:bg-error-container/10 transition-colors"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-on-surface-variant py-8 text-center">No upcoming deadlines scheduled.</p>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            

            {/* Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel bg-surface p-6 rounded-xl w-full max-w-md border border-outline-variant/30 shadow-xl space-y-4">
                        <h3 className="text-lg font-bold text-on-surface font-serif">Add Academic Deadline</h3>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-label-caps text-on-surface-variant mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Internal Assessment 2"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary px-3 py-2 text-sm rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-label-caps text-on-surface-variant mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary px-3 py-2 text-sm rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-label-caps text-on-surface-variant mb-1">Type</label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary px-3 py-2 text-sm rounded-lg outline-none"
                                >
                                    <option value="exam">Exam</option>
                                    <option value="submission">Submission</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="study">Study Session</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                                >
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}