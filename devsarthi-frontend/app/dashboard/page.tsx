'use client';
import { useState, useEffect, useRef } from 'react';
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
  Library,
  LineChart,
  Calendar,
  Target,
  Timer,
  Activity,
  LogOut,
  Bell,
  ChevronDown,
  History,
  ArrowRight,
  Play,
  GraduationCap,
  Bug,
  Flame,
  PieChart,
  FileText,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  CheckCircle2,
  Code2,
  MessageSquare
} from 'lucide-react';

import { supabase } from '../../utils/supabase';





type Notebook = {
  id: string;
  title: string;
  subject: string;
  topic: string | null;
  coverage: number;
  updated_at: string;
};

type AcademicEvent = {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
};

type ActivityItem = {
  id: string;
  title: string;
  activity_type: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    sessions: 0,
    bugsResolved: 0,
    streak: 1,
    syllabusProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: 'Student',
    course: 'IT',
    semester: 'V',
    initials: 'ST',
  });

  const [continueNotebook, setContinueNotebook] = useState<Notebook | null>(null);
  const [upcomingEventsList, setUpcomingEventsList] = useState<AcademicEvent[]>([]);
  // Goals, Focus, & Activity States
  const [weeklyGoal, setWeeklyGoal] = useState({ target: 5, completed: 0 });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [selectedFocusTime, setSelectedFocusTime] = useState<number>(45);
  const [focusSessionsCount, setFocusSessionsCount] = useState<number>(0);
  const [recommendedNotebook, setRecommendedNotebook] = useState<{
    title: string;
    subject: string;
    reason: string;
    notebookId?: string;
  } | null>(null);
  const [recentNotebookSources, setRecentNotebookSources] = useState<Notebook[]>([]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function formatRelativeTime(dateString: string) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
  }

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('full_name, course, semester, total_sessions, bugs_resolved, streak_days, weekly_goal_sessions, focus_sessions_this_week')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        const nameParts = data.full_name?.trim().split(' ') || [];
        const initials = nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : (data.full_name?.slice(0, 2).toUpperCase() || 'ST');

        setProfile({
          fullName: data.full_name || 'Student',
          course: data.course || 'IT',
          semester: data.semester || 'V',
          initials,
        });
      }

      const today = new Date().toISOString().split('T')[0];

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, event_date, event_type')
        .eq('user_id', user.id)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(3);

      if (eventsData && !eventsError) {
        setUpcomingEventsList(eventsData);
      }

      // 1. Fetch real recent activities
      const { data: activityData } = await supabase
        .from('activity_log')
        .select('id, title, activity_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activityData && activityData.length > 0) {
        const validActivities = activityData.filter((act: any) => act.title && act.title.trim() !== '').slice(0, 3);
        setRecentActivities(validActivities);
      }
      // Fetch user's active notebooks sorted by latest activity
      const { data: notebooks, error: nbError } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (nbError) {
        console.error("Supabase Error [dashboard notebooks]:", nbError.message);
      }

      if (notebooks && !nbError && notebooks.length > 0) {
        // 1. Continue Learning: Most recently updated/opened notebook
        setContinueNotebook(notebooks[0]);

        // 2. Recent Sources: Notebooks active in the last 24h, or fallback to the latest 3
        const now = new Date().getTime();
        const past24h = notebooks.filter(
          (n: any) => now - new Date(n.updated_at).getTime() <= 24 * 60 * 60 * 1000
        );
        setRecentNotebookSources(past24h.length > 0 ? past24h.slice(0, 3) : notebooks.slice(0, 3));

        // 3. Recommended: A subject with lowest coverage, or alternate topic
        const lowestCoverage = [...notebooks].sort((a, b) => a.coverage - b.coverage)[0];
        setRecommendedNotebook({
          title: lowestCoverage.topic ? `Review ${lowestCoverage.topic}` : `Practice ${lowestCoverage.subject}`,
          subject: lowestCoverage.subject,
          reason: `Based on your ${lowestCoverage.coverage}% syllabus coverage.`,
          notebookId: lowestCoverage.id,
        });
      } else {
        // Fallbacks if student hasn't created any notebooks yet
        setRecommendedNotebook({
          title: 'Explore Syllabus',
          subject: data?.course || 'General Engineering',
          reason: 'Start your first notebook to get tailored recommendations.',
        });
      }

      // Calculate average syllabus coverage across all notebooks
      let avgProgress = 0;
      if (notebooks && notebooks.length > 0) {
        const totalCoverage = notebooks.reduce((acc: any, curr: any) => acc + (curr.coverage || 0), 0);
        avgProgress = Math.round(totalCoverage / notebooks.length);
      }

      setStats({
        // Use notebooks count or fallback to total_sessions column
        sessions: notebooks?.length || data?.total_sessions || 0,
        bugsResolved: data?.bugs_resolved || 0,
        streak: data?.streak_days || 1,
        syllabusProgress: avgProgress,
      });

      // Compute weekly goals & focus counts
      const targetGoal = data?.weekly_goal_sessions || 5;
      const completedSessions = data?.focus_sessions_this_week || 0;
      setWeeklyGoal({
        target: targetGoal,
        completed: completedSessions,
      });
      setFocusSessionsCount(data?.focus_sessions_this_week || 0);
      setIsLoading(false);
    }

    loadUserData();
  }, [router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
        <div className="max-w-[1280px] mx-auto space-y-12">
          {/* Header Section */}
          <section className="space-y-1 animate-fade-in-up">
            <h2 className="font-headline-lg text-display-lg text-primary tracking-tight">
              Welcome back, {profile.fullName} <span className="inline-block animate-wave">👋</span>
            </h2>
            <p className="font-title-md text-title-md text-on-surface-variant font-normal">
              Semester {profile.semester} ({profile.course}) · Mumbai University
            </p>
          </section>

          {/* Hero Row (High Priority) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Continue Learning Card */}
            <div className="glass-panel rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-secondary" />
                  <span className="font-label-caps text-label-caps text-secondary">Continue Learning</span>
                </div>
                <h3 className="font-title-md text-title-md mb-1">
                  {continueNotebook ? continueNotebook.subject : 'No Active Session'}
                </h3>
                <p className="text-on-surface-variant mb-6 text-sm">
                  {continueNotebook
                    ? `Topic: ${continueNotebook.topic || continueNotebook.title}`
                    : 'Create a notebook to resume learning'}
                </p>
                <div className="space-y-2 mb-8">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-on-surface">Syllabus Coverage</span>
                    <span className="text-primary">{continueNotebook ? `${continueNotebook.coverage}%` : '0%'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full relative overflow-hidden transition-all duration-500"
                      style={{ width: `${continueNotebook ? continueNotebook.coverage : 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 -translate-x-[100%] animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto relative z-10">
                <button
                  onClick={() => router.push(continueNotebook ? `/studio?notebookId=${continueNotebook.id}` : '/studio')}
                  className="bg-primary-container text-on-primary-container hover:bg-primary px-6 py-2.5 rounded-lg font-title-md text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Recommended for You Card */}
            <div className="glass-panel rounded-xl p-6 md:p-8 flex flex-col justify-between border-l-4 border-l-secondary relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="font-label-caps text-label-caps text-secondary">Recommended for You</span>
                </div>
                <h3 className="font-title-md text-title-md mb-1">
                  {recommendedNotebook?.title || 'Practice Core Concepts'}
                </h3>
                <p className="text-on-surface-variant mb-4 text-sm">
                  {recommendedNotebook?.subject || 'Curriculum'}
                </p>
                <p className="text-sm text-on-surface-variant/80 bg-surface-container/50 inline-block px-3 py-1.5 rounded-md border border-outline-variant/20">
                  {recommendedNotebook?.reason || 'Select a topic to start.'}
                </p>
              </div>
              <div className="mt-8 relative z-10">
                <button
                  onClick={() => router.push(recommendedNotebook?.notebookId ? `/studio?notebookId=${recommendedNotebook.notebookId}` : '/studio')}
                  className="border border-primary-container text-primary-container hover:bg-primary-container hover:text-on-primary-container px-6 py-2.5 rounded-lg font-title-md text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <span>Start Practice</span>
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </section>

          {/* Learning Statistics Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Sessions */}
            <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-title-md text-lg font-semibold text-on-surface">{stats.sessions}</p>
                <p className="text-sm text-on-surface-variant">Sessions</p>
              </div>
            </div>

            {/* Bugs Resolved */}
            <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <Bug className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-title-md text-lg font-semibold text-on-surface">{stats.bugsResolved}</p>
                <p className="text-sm text-on-surface-variant">Bugs Resolved</p>
              </div>
            </div>

            {/* Streak */}
            <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-on-tertiary-container" />
              </div>
              <div>
                <p className="font-title-md text-lg font-semibold text-on-surface">{stats.streak} Day</p>
                <p className="text-sm text-on-surface-variant">Streak</p>
              </div>
            </div>

            {/* Syllabus Progress */}
            <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container/50 flex items-center justify-center shrink-0">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-title-md text-lg font-semibold text-on-surface">{stats.syllabusProgress}%</p>
                <p className="text-sm text-on-surface-variant">Syllabus Progress</p>
              </div>
            </div>
          </section>

          {/* Sources and Upcoming Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sources */}
            <div className="glass-panel rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-title-md text-lg font-semibold text-on-surface">Recent Sources</h3>
                <Link href="/subjects" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3 flex-1">
                {recentNotebookSources.length > 0 ? (
                  recentNotebookSources.map((source) => (
                    <Link
                      key={source.id}
                      href={`/studio?notebookId=${source.id}`}
                      className="flex items-center gap-3 p-3 bg-surface hover:bg-surface-container-high rounded-lg border border-outline-variant/30 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-secondary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface font-medium truncate">{source.title}</p>
                        <p className="text-xs text-on-surface-variant">{source.subject}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-on-surface-variant p-3">No recent notebooks accessed.</p>
                )}
              </div>
            </div>
            {/* Upcoming */}
            <div className="glass-panel rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-title-md text-lg font-semibold text-on-surface">Upcoming</h3>
                <Link href="/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View Calendar <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3 flex-1">
                {upcomingEventsList.length > 0 ? (
                  upcomingEventsList.map((event) => {
                    // Pick an icon based on event_type
                    const IconComponent =
                      event.event_type === 'exam'
                        ? CalendarDays
                        : event.event_type === 'assignment'
                          ? ClipboardList
                          : ClipboardCheck;

                    // Format ISO date (e.g. 2026-09-20 -> Sep 20)
                    const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-surface rounded-lg border border-outline-variant/30"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-secondary" />
                          <span className="text-sm text-on-surface font-medium">{event.title}</span>
                        </div>
                        <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-2 py-1 rounded">
                          {formattedDate}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-on-surface-variant p-3">No upcoming deadlines scheduled.</p>
                )}
              </div>
            </div>

            {/* Goals and Activity Row */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Goals */}
              <div className="glass-panel rounded-xl p-6 flex flex-col justify-center">
                <h3 className="font-title-md text-lg font-semibold text-on-surface mb-4">Goals</h3>
                <div className="bg-surface p-4 rounded-lg border border-outline-variant/30">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-medium text-on-surface">Weekly Learning Goal</p>
                      <p className="text-xs text-on-surface-variant">
                        {weeklyGoal.completed}/{weeklyGoal.target} sessions completed
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {Math.min(100, Math.round((weeklyGoal.completed / (weeklyGoal.target || 1)) * 100))}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((weeklyGoal.completed / (weeklyGoal.target || 1)) * 100))}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                    {weeklyGoal.completed >= weeklyGoal.target
                      ? 'Weekly goal achieved! Great work.'
                      : `${weeklyGoal.target - weeklyGoal.completed} more session${weeklyGoal.target - weeklyGoal.completed > 1 ? 's' : ''} to complete your goal.`}
                  </p>
                </div>
              </div>
              {/* Recent Activity */}
              <div className="glass-panel rounded-xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-title-md text-lg font-semibold text-on-surface">Recent Activity</h3>
                  <Link href="/activity" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => {
                      const Icon = act.activity_type === 'code' ? Code2 : act.activity_type === 'chat' ? MessageSquare : BookOpen;
                      return (
                        <div key={act.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center mt-0.5 shrink-0">
                            <Icon className="w-4 h-4 text-on-surface-variant" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{act.title}</p>
                            <p className="text-xs text-on-surface-variant">{formatRelativeTime(act.created_at)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-on-surface-variant p-3">No recent activities logged.</p>
                  )}
                </div>
              </div>
            </section>
            {/* Focus Mode */}
            <section className="glass-panel rounded-xl p-6 bg-gradient-to-r from-surface to-primary/5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="w-5 h-5 text-primary" />
                    <h3 className="font-title-md text-lg font-semibold text-on-surface">Focus Mode</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">Ready to focus?</p>
                  <div className="flex gap-2">
                    {[25, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setSelectedFocusTime(mins)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedFocusTime === mins
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'border border-outline-variant/50 hover:bg-surface-container text-on-surface'
                          }`}
                      >
                        {mins}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const custom = prompt('Enter focus minutes:');
                        if (custom && !isNaN(Number(custom))) setSelectedFocusTime(Number(custom));
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${![25, 45, 60].includes(selectedFocusTime)
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'border border-outline-variant/50 hover:bg-surface-container text-on-surface'
                        }`}
                    >
                      {![25, 45, 60].includes(selectedFocusTime) ? `${selectedFocusTime}m` : 'Custom'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => router.push(`/focus?duration=${selectedFocusTime}`)}
                    className="bg-primary text-on-primary px-8 py-3 rounded-lg font-title-md text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md"
                  >
                    Start Focus Session ({selectedFocusTime}m)
                  </button>
                  <span className="text-xs font-medium bg-tertiary-container/10 text-tertiary px-3 py-1 rounded-full flex items-center gap-1">
                    🔥 {focusSessionsCount} focus sessions this week
                  </span>
                </div>
              </div>
            </section>
          </section>
        </div>
      

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-container-lowest border-t border-outline-variant/20 md:ml-64 mt-auto">
        <div className="w-full py-8 px-4 md:px-[64px] flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1280px] mx-auto">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="font-headline-lg-mobile text-base font-bold text-primary dark:text-primary-fixed">
              DevSarthi
            </div>
            <p className="font-body-md text-xs text-on-surface-variant dark:text-on-surface-variant text-center md:text-left">
              © 2024 DevSarthi. Built for Mumbai University Engineering.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="font-body-md text-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="font-body-md text-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors">
              Terms
            </Link>
            <Link href="/support" className="font-body-md text-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors">
              MU Support
            </Link>
          </div>
        </div>
      </footer>

      {/* Inline styles for custom animations that might not be in tailwind yet */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
        }
        .animate-wave {
            animation: wave 2s infinite ease-in-out;
            transform-origin: 70% 70%;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
      `}} />
    </DashboardLayout>
  );
}
