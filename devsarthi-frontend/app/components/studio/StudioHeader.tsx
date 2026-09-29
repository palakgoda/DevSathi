'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Bell,
  BookOpen,
  Brain,
  Code2,
  X,
  ChevronDown,
  LogOut,
  Target,
  LineChart,
  Save,
  Loader2
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type StudioHeaderProps = {
  subject?: string;
  topic?: string;
  activity?: 'read' | 'practice' | 'code' | null;
  onActivityChange?: (activity: 'read' | 'practice' | 'code') => void;
  profile?: {
    fullName: string;
    course: string;
    semester: string;
    initials: string;
  };
  upcomingEventsList?: { id: string; title: string; event_date: string; event_type: string; }[];
  recentActivities?: { id: string; title: string; activity_type: string; created_at: string; }[];
  onSave?: () => void;
  isSaving?: boolean;
};

export default function StudioHeader({
  subject,
  topic,
  activity = 'code',
  onActivityChange,
  profile = { fullName: 'Student', course: 'IT', semester: 'V', initials: 'ST' },
  upcomingEventsList = [],
  recentActivities = [],
  onSave,
  isSaving = false
}: StudioHeaderProps) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('13px');
  const [wordWrap, setWordWrap] = useState(true);

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#FDF9EF]/90 backdrop-blur-md border-b border-[#c0c9c2]/50 z-30 flex items-center justify-between px-6">
        {/* Brand & Active Topic */}
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="font-serif text-xl font-bold text-[#013626] tracking-tight hover:opacity-90">
            DevSarthi Studio
          </Link>

          {subject && topic && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#c0c9c2]/60 text-xs text-[#4B635B]">
              <span>Session:</span>
              <strong className="text-[#013626] font-medium">{subject} &middot; {topic}</strong>
            </div>
          )}
        </div>

        {/* Center: Integrated Workspace Activity Switcher */}
        {onActivityChange && (
          <div className="flex items-center bg-[#f7f3e9] border border-[#c0c9c2] p-1 rounded-lg shadow-xs">
            <button
              onClick={() => onActivityChange('read')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${activity === 'read'
                ? 'bg-[#013626] text-[#FDF9EF] shadow-xs'
                : 'text-[#4B635B] hover:text-[#013626]'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Read
            </button>
            <button
              onClick={() => onActivityChange('practice')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${activity === 'practice'
                ? 'bg-[#013626] text-[#FDF9EF] shadow-xs'
                : 'text-[#4B635B] hover:text-[#013626]'
                }`}
            >
              <Brain className="w-3.5 h-3.5" />
              Practice
            </button>
            <button
              onClick={() => onActivityChange('code')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${activity === 'code'
                ? 'bg-[#013626] text-[#FDF9EF] shadow-xs'
                : 'text-[#4B635B] hover:text-[#013626]'
                }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code
            </button>
          </div>
        )}

        {/* Top-Right Utility Actions */}
        <div className="flex items-center gap-2.5">
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#013626] text-[#FDF9EF] rounded-md text-xs font-semibold hover:bg-[#013626]/90 transition-colors disabled:opacity-50 mr-2"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Notebook
            </button>
          )}

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileMenuOpen(false);
              }}
              title="Notifications"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#4B635B] hover:text-[#013626] hover:bg-[#f7f3e9] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {(upcomingEventsList.length > 0 || recentActivities.length > 0) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FDF9EF]"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-serif text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {upcomingEventsList.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-100 last:border-0 flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Event: {event.title}</span>
                      <span className="text-xs text-gray-500 mt-1">Upcoming on {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  ))}
                  {recentActivities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-100 last:border-0 flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{activity.title || activity.activity_type}</span>
                      <span className="text-xs text-gray-500 mt-1">{activity.activity_type}</span>
                    </div>
                  ))}
                  {upcomingEventsList.length === 0 && recentActivities.length === 0 && (
                    <p className="text-sm text-gray-500 p-4 text-center">No new notifications</p>
                  )}
                </div>
                <Link href="/calendar" className="block w-full text-center p-3 text-sm text-[#013626] hover:bg-emerald-50 font-medium border-t border-gray-100 transition-colors">
                  View All Events
                </Link>
              </div>
            )}
          </div>



          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-1.5 hover:bg-[#f7f3e9] p-1 pr-2 ml-1 rounded-full transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#013626] text-[#FDF9EF] text-xs font-semibold flex items-center justify-center shadow-xs">
                {profile.initials}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#4B635B]" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{profile.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{profile.course} - Sem {profile.semester}</p>
                </div>
                <div className="py-1">
                  <Link href="/goals" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#013626] transition-colors">
                    <Target className="w-4 h-4" /> Study Goals
                  </Link>
                  <Link href="/progress" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#013626] transition-colors">
                    <LineChart className="w-4 h-4" /> Analytics
                  </Link>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>


    </>
  );
}