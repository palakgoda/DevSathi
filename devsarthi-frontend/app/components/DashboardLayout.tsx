'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AcademicEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState({
    fullName: 'Student',
    course: 'IT',
    semester: 'V',
    initials: 'ST',
  });
  const [upcomingEventsList, setUpcomingEventsList] = useState<AcademicEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string; action_type: string; details: string; created_at: string }[]>([]);

  useEffect(() => {
    // Load sidebar state from local storage on initial render
    const savedState = localStorage.getItem('isSidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('isSidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    async function loadHeaderData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('full_name, course, semester')
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

      // Fetch recent activities
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('id, action_type, details, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (activityData && !activityError) {
        setRecentActivities(activityData);
      }
    }
    loadHeaderData();
  }, [router]);

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased overflow-x-hidden min-h-screen selection:bg-primary-container selection:text-on-primary-container flex flex-col">
      <DashboardSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <DashboardHeader
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        profile={profile}
        upcomingEventsList={upcomingEventsList}
        recentActivities={recentActivities}
      />
      
      {/* Main Content Canvas */}
      <main className={`pt-20 md:pt-24 px-4 pb-[64px] flex-1 transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64 md:px-[64px]' : 'md:ml-16 md:px-8'
      }`}>
        {children}
      </main>
    </div>
  );
}
