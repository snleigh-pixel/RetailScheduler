import React from 'react';
import { Calendar, Users, AlertTriangle, Briefcase, DollarSign, Bell, HelpCircle } from 'lucide-react';
import { ShortageAlert } from '../types';

export type NavTab = 'roster' | 'availability' | 'shortages' | 'jobseekers' | 'payroll';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  shortageAlerts: ShortageAlert[];
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenBusinessModel: () => void;
  onAutoSchedule: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  shortageAlerts,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenBusinessModel,
  onAutoSchedule,
}) => {
  const criticalCount = shortageAlerts.filter(a => a.urgency === 'critical').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onSelectTab('roster')} 
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                SF
              </div>
              <div>
                <span className="text-base font-bold text-neutral-900 tracking-tight block">
                  ShiftFlow Retail
                </span>
                <span className="text-[11px] text-neutral-500 block -mt-1 font-normal">
                  Manpower & Labour Dispatch
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 5 single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-neutral-600">
            <button
              onClick={() => onSelectTab('roster')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'roster'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span>Roster Scheduler</span>
            </button>

            <button
              onClick={() => onSelectTab('availability')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'availability'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Users className="w-4 h-4 text-neutral-500" />
              <span>Staff Availability</span>
            </button>

            <button
              onClick={() => onSelectTab('shortages')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'shortages'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${criticalCount > 0 ? 'text-amber-600' : 'text-neutral-500'}`} />
              <span>Shortage Alerts</span>
              {criticalCount > 0 && (
                <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold">
                  {criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('jobseekers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'jobseekers'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Briefcase className="w-4 h-4 text-neutral-500" />
              <span>Jobseeker Network</span>
            </button>

            <button
              onClick={() => onSelectTab('payroll')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'payroll'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <DollarSign className="w-4 h-4 text-neutral-500" />
              <span>Weekly Payroll</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Notifications */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBusinessModel}
              title="View Business Model Canvas"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Business Model</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600" />
              )}
            </button>

            <button
              onClick={onAutoSchedule}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shadow-sm"
            >
              Auto-Schedule
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
