import React from 'react';
import { AlertCircle, Clock, Send, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ShortageAlert } from '../types';

interface ShortageNoticeBannerProps {
  alerts: ShortageAlert[];
  onBroadcastClick: (alert: ShortageAlert) => void;
  onViewShortagesTab: () => void;
}

export const ShortageNoticeBanner: React.FC<ShortageNoticeBannerProps> = ({
  alerts,
  onBroadcastClick,
  onViewShortagesTab,
}) => {
  const criticalAlert = alerts.find(a => a.urgency === 'critical');

  if (!criticalAlert) {
    return null;
  }

  const isResolved = criticalAlert.broadcastStatus === 'resolved';

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 rounded-md text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 font-mono">
                  3-Man-Day Advance Notice Alert
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {criticalAlert.advanceNoticeDays} days advance notice ({criticalAlert.date})
                </span>
              </div>
              <p className="text-sm text-neutral-800 mt-0.5">
                Critical shortage of <strong className="font-semibold text-neutral-900">{criticalAlert.manDaysShort} man-days</strong> ({criticalAlert.openShiftsCount} unfulfilled shifts). Management has lead-time to dispatch temporary replacement staff.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {isResolved ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-md font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Replacement Staff Secured
              </span>
            ) : (
              <>
                <button
                  onClick={() => onBroadcastClick(criticalAlert)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-md shadow-sm transition-colors whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to Job Portals</span>
                </button>
                <button
                  onClick={onViewShortagesTab}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors whitespace-nowrap"
                >
                  <span>Review Deficit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
