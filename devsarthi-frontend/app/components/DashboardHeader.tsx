'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  Bell,
  ChevronDown,
  LogOut,
  Target,
  LineChart,
  Menu,
} from 'lucide-react';

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

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  profile: {
    fullName: string;
    course: string;
    semester: string;
    initials: string;
  };
  upcomingEventsList: AcademicEvent[];
  recentActivities: { id: string; action_type: string; details: string; created_at: string }[];
}

export default function DashboardHeader({
  isSidebarOpen,
  toggleSidebar,
  profile,
  upcomingEventsList,
  recentActivities,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
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

  // Close dropdowns on route change
  useEffect(() => {
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  return (
    <header 
      className={`hidden md:flex fixed top-0 right-0 h-16 justify-end items-center px-8 z-40 bg-surface/60 dark:bg-surface-dim/60 backdrop-blur-xl border-b border-outline-variant/20 transition-all duration-300 ${
        isSidebarOpen ? 'w-[calc(100%-16rem)]' : 'w-[calc(100%-4rem)]'
      }`}
    >

      {/* Actions & Profile */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileMenuOpen(false);
            }}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all hover:text-primary relative group focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {(upcomingEventsList.length > 0 || recentActivities.length > 0) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface glass-panel rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden z-50">
              <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low">
                <h3 className="font-title-md text-sm font-semibold text-on-surface">Notifications</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {upcomingEventsList.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors border-b border-outline-variant/10 last:border-0 flex flex-col">
                    <span className="text-sm font-medium text-on-surface">Event: {event.title}</span>
                    <span className="text-xs text-on-surface-variant mt-1">Upcoming on {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
                {recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="p-3 hover:bg-surface-container-high rounded-lg cursor-pointer transition-colors border-b border-outline-variant/10 last:border-0 flex flex-col">
                    <span className="text-sm font-medium text-on-surface">{activity.action_type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-on-surface-variant mt-1">{activity.details}</span>
                  </div>
                ))}
                {upcomingEventsList.length === 0 && recentActivities.length === 0 && (
                  <p className="text-sm text-on-surface-variant p-4 text-center">No new notifications</p>
                )}
              </div>
              <Link href="/calendar" className="block w-full text-center p-3 text-sm text-primary hover:bg-primary-container/10 font-medium border-t border-outline-variant/30 transition-colors">
                View All Events
              </Link>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-outline-variant/30 mx-1"></div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 hover:bg-surface-container-high p-1 pr-3 rounded-full transition-all border border-transparent hover:border-outline-variant/30 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-semibold flex items-center justify-center text-sm">
              {profile.initials}
            </div>
            <span className="text-sm font-medium text-on-surface">{profile.fullName}</span>
            <ChevronDown className="w-4 h-4 text-on-surface-variant" />
          </button>
          
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface glass-panel rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden z-50 py-1">
              <div className="px-4 py-3 border-b border-outline-variant/30">
                <p className="text-sm font-semibold text-on-surface truncate">{profile.fullName}</p>
                <p className="text-xs text-on-surface-variant truncate">{profile.course} - Sem {profile.semester}</p>
              </div>
              <div className="py-1">
                <Link href="/goals" className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors">
                  <Target className="w-4 h-4" /> Study Goals
                </Link>
                <Link href="/progress" className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors">
                  <LineChart className="w-4 h-4" /> Analytics
                </Link>
              </div>
              <div className="border-t border-outline-variant/30 py-1">
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
