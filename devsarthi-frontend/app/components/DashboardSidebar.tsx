'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function DashboardSidebar({ isSidebarOpen, toggleSidebar }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className={`hidden md:flex fixed left-0 top-0 h-screen flex-col py-8 bg-surface/60 backdrop-blur-md border-r border-outline-variant/30 shadow-sm z-50 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand Header */}
      <div className={`px-4 mb-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'flex-col gap-4'} overflow-hidden`}>
        <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <Component className="w-5 h-5 text-on-primary-container" />
          </div>
          {isSidebarOpen && (
            <div className="whitespace-nowrap transition-opacity duration-300">
              <h1 className="font-headline-lg text-title-md font-bold text-primary dark:text-primary-fixed leading-tight tracking-tight">
                DevSarthi
              </h1>
              <p className="font-label-caps text-label-caps text-on-surface-variant">
                Academic Architect
              </p>
            </div>
          )}
        </div>
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all focus:outline-none shrink-0"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          {isSidebarOpen && (
            <p className="px-4 py-2 font-label-caps text-label-caps text-on-surface-variant opacity-70">
              Main
            </p>
          )}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group ${
              pathname === '/dashboard'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Dashboard' : ''}
          >
            <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${pathname === '/dashboard' ? 'fill-primary/20' : ''}`} />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link
            href="/studio"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group relative overflow-hidden ${
              pathname === '/studio'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'AI Studio' : ''}
          >
            {isSidebarOpen && (
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
            <Sparkles className="w-5 h-5 text-secondary relative z-10 transition-transform duration-200 group-hover:rotate-12" />
            {isSidebarOpen && <span className="font-medium relative z-10">AI Studio</span>}
          </Link>
        </div>

        {/* Learning Section */}
        <div className="space-y-1">
          {isSidebarOpen && (
            <p className="px-4 py-2 font-label-caps text-label-caps text-on-surface-variant opacity-70">
              Learning
            </p>
          )}
          <Link
            href="/subjects"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group ${
              pathname === '/subjects'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Subjects' : ''}
          >
            <BookOpen className={`w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 ${pathname === '/subjects' ? 'fill-primary/20' : ''}`} />
            {isSidebarOpen && <span>Subjects</span>}
          </Link>
          <Link
            href="/progress"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group ${
              pathname === '/progress'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Progress' : ''}
          >
            <LineChart className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            {isSidebarOpen && <span>Progress</span>}
          </Link>
        </div>

        {/* Planning Section */}
        <div className="space-y-1">
          {isSidebarOpen && (
            <p className="px-4 py-2 font-label-caps text-label-caps text-on-surface-variant opacity-70">
              Planning
            </p>
          )}
          <Link
            href="/calendar"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group ${
              pathname === '/calendar'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Calendar' : ''}
          >
            <Calendar className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            {isSidebarOpen && <span>Calendar</span>}
          </Link>
          <Link
            href="/goals"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group ${
              pathname === '/goals'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Goals' : ''}
          >
            <Target className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            {isSidebarOpen && <span>Goals</span>}
          </Link>
        </div>

        {/* Productivity Section */}
        <div className="space-y-1">
          {isSidebarOpen && (
            <p className="px-4 py-2 font-label-caps text-label-caps text-on-surface-variant opacity-70">
              Productivity
            </p>
          )}
          <Link
            href="/focus"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group ${
              pathname === '/focus'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Focus Mode' : ''}
          >
            <Timer className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            {isSidebarOpen && <span>Focus Mode</span>}
          </Link>
          <Link
            href="/activity"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg group ${
              pathname === '/activity'
                ? 'text-primary dark:text-primary-fixed font-bold bg-primary-container/5 border-r-4 border-primary rounded-r-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-colors duration-200'
            } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title={!isSidebarOpen ? 'Activity' : ''}
          >
            <Activity className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            {isSidebarOpen && <span>Activity</span>}
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className={`mt-auto pt-6 px-2 space-y-1 border-t border-outline-variant/20 mx-4`}>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className={`w-full flex items-center gap-3 py-2 text-on-surface-variant hover:text-error hover:bg-error-container/10 transition-colors duration-200 rounded-lg group text-sm ${
            isSidebarOpen ? 'px-2' : 'justify-center'
          }`}
          title={!isSidebarOpen ? 'Logout' : ''}
        >
          <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
}
