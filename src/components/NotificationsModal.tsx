import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Calendar, 
  Smartphone, 
  Mail,
  Clock,
  Sparkles
} from 'lucide-react';
import { NotificationMessage } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationMessage[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'sms' | 'email'>('feed');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900">
              Automated Notifications Dispatcher
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 p-2 bg-neutral-100 border-b border-neutral-200 text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'feed' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            System Activity Feed ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'sms' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS Simulation</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'email' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Dispatch</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          
          {activeTab === 'feed' && (
            <>
              <div className="flex items-center justify-between text-xs text-neutral-500 pb-1">
                <span>Real-time dispatch log</span>
                <div className="flex items-center gap-2">
                  <button onClick={onMarkAllAsRead} className="hover:text-neutral-900 hover:underline">
                    Mark all read
                  </button>
                  <span>·</span>
                  <button onClick={onClearNotifications} className="hover:text-rose-600 hover:underline">
                    Clear all
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No notifications currently logged.
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                      notif.severity === 'critical'
                        ? 'bg-rose-50/60 border-rose-200'
                        : notif.severity === 'success'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                        {notif.severity === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                        {notif.severity === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {notif.severity === 'info' && <Bell className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
                        <span>{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-neutral-700 text-[11px] leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-2">
                  <span>SMS Gateway: +65 8920 4421</span>
                  <span>Direct API</span>
                </div>

                <div className="p-3 bg-neutral-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">To: Store Management</span>
                  <p className="text-neutral-200 text-xs">
                    [ShiftFlow ALERT]: Shortage of 3.25 man-days detected for Sunday, Oct 18 at Orchard Central Flagship. 72h lead-time remaining to secure temporary staff. Tap to broadcast: https://shiftflow.app/s/oct18
                  </p>
                </div>

                <div className="p-3 bg-neutral-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">To: Hired Temp (Benjamin Toh)</span>
                  <p className="text-neutral-200 text-xs">
                    [ShiftFlow RETAIL]: Hi Benjamin, you have been confirmed for Sunday Morning Opening (08:00 - 14:30) at Orchard Central Flagship #02-14. Agreed rate: $18.00/hr. Uniform: Black polo & covered shoes.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 text-center">
                Automated SMS alerts are dispatched immediately upon leave submission, advance shortage detection, and shift booking.
              </p>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border border-neutral-200 shadow-xs space-y-2 text-xs">
                <div className="border-b border-neutral-200 pb-2 space-y-0.5">
                  <div className="text-neutral-500 text-[11px]">Subject: <strong className="text-neutral-900">[Weekly Schedule] Roster Published: Week 42 (Oct 12 – Oct 18)</strong></div>
                  <div className="text-neutral-500 text-[11px]">From: scheduler@retailshift.com · To: all-orchard-team@retailshift.com</div>
                </div>
                <p className="text-neutral-700 leading-relaxed text-[11px]">
                  Dear Retail Team,<br /><br />
                  Your weekly work schedule for Orchard Central Flagship has been published. Please verify your assigned shifts, break hours, and clock-in guidelines via your staff portal.<br /><br />
                  Reminder: If you need to request a shift swap, please submit your request at least 48 hours prior to shift commencement.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-neutral-200 shadow-xs space-y-2 text-xs">
                <div className="border-b border-neutral-200 pb-2 space-y-0.5">
                  <div className="text-neutral-500 text-[11px]">Subject: <strong className="text-rose-700">[Urgent 3-Day Notice] Manpower Shortage Escalation</strong></div>
                  <div className="text-neutral-500 text-[11px]">To: marcus.lim@retailshift.com (Store Director)</div>
                </div>
                <p className="text-neutral-700 leading-relaxed text-[11px]">
                  Marcus,<br /><br />
                  Our automated surveillance detected 4 open shifts (3.25 man-days) on Sunday, Oct 18 due to staff medical & educational leaves. 5 partner portals have been queued for temporary labor dispatch.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
