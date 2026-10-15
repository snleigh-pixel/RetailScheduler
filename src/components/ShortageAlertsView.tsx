import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Send, 
  Users, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  Building,
  Sparkles
} from 'lucide-react';
import { ShortageAlert, Shift, Outlet } from '../types';

interface ShortageAlertsViewProps {
  alerts: ShortageAlert[];
  shifts: Shift[];
  outlets: Outlet[];
  onBroadcastAlert: (alert: ShortageAlert) => void;
  onOpenApplicantsForShift: (shiftId: string) => void;
  onAutoSchedule: () => void;
}

export const ShortageAlertsView: React.FC<ShortageAlertsViewProps> = ({
  alerts,
  shifts,
  outlets,
  onBroadcastAlert,
  onOpenApplicantsForShift,
  onAutoSchedule,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Overview Banner explaining 3-Man-Day Rule */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-md text-amber-900">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Manpower Shortage & 3-Man-Day Advance Alert Engine
            </h2>
            <p className="text-xs text-neutral-500">
              Automated algorithmic surveillance detecting retail roster deficits with at least 3 man-days advance notice for management intervention.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="font-semibold text-neutral-900 block mb-1">1. Advance Notice Protocol</span>
            Alerts fire 3 to 14 days before shift execution so store leads have adequate lead-time to tap casual gig networks.
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="font-semibold text-neutral-900 block mb-1">2. Man-Day Equivalence</span>
            Calculated as total unassigned operational hours ÷ 7.5h standard retail shift day. Shortage ≥ 3 man-days triggers Critical escalation.
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="font-semibold text-neutral-900 block mb-1">3. Multi-Portal Dispatch</span>
            Instant 1-click broadcast pushes vacancies into FastJobs, GrabJobs, JobStreet, and Agency pools.
          </div>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">
            Active Deficit Alerts ({alerts.length})
          </h3>
          <button
            onClick={onAutoSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
            <span>Attempt In-House Auto-Fill</span>
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-900">Zero Critical Shortages Detected</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              All upcoming retail shifts over the next 14 days meet baseline man-day requirements. Staff schedules are healthy.
            </p>
          </div>
        ) : (
          alerts.map(alert => {
            const outlet = outlets.find(o => o.id === alert.outletId);
            const openShifts = shifts.filter(s => s.outletId === alert.outletId && s.date === alert.date && (!s.assignedStaffId || s.status === 'critical'));

            return (
              <div 
                key={alert.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs"
              >
                
                {/* Alert Top Bar */}
                <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.urgency === 'critical' 
                    ? 'bg-rose-50/60 border-rose-200' 
                    : 'bg-amber-50/60 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alert.urgency === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-mono">
                          {alert.urgency === 'critical' ? 'Critical Advance Notice Alert' : 'Staffing Advisory'}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-xs font-semibold text-neutral-800">
                          {outlet?.name}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-xs text-neutral-600 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {alert.advanceNoticeDays} Days Notice ({alert.date})
                        </span>
                      </div>
                      <p className="text-sm text-neutral-800 mt-1">
                        Deficit of <strong className="font-bold text-neutral-900">{alert.manDaysShort} Man-Days</strong> ({openShifts.length} open retail shifts).
                        Target roles: {alert.rolesNeeded.join(', ')}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onBroadcastAlert(alert)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast to 5 Job Portals</span>
                    </button>
                  </div>
                </div>

                {/* Affected Shifts breakdown */}
                <div className="p-4 bg-white space-y-3">
                  <span className="text-xs font-semibold text-neutral-700 block">
                    Unfulfilled Shifts on {alert.date} Requiring Temporary Labour:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {openShifts.map(shift => (
                      <div
                        key={shift.id}
                        className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-neutral-900">
                              {shift.title}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              {shift.hours}h ({shift.startTime} - {shift.endTime})
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-600 mt-1">
                            Role: <strong className="text-neutral-800">{shift.roleRequired}</strong>
                          </div>
                          {shift.notes && (
                            <p className="text-[11px] text-rose-700 mt-1 italic">
                              "{shift.notes}"
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                          <span className="text-[11px] text-neutral-500">
                            {shift.status === 'broadcasted' ? 'Broadcasted to Portals' : 'Ready for Dispatch'}
                          </span>
                          <button
                            onClick={() => onOpenApplicantsForShift(shift.id)}
                            className="text-xs text-neutral-900 font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>Find / Hire Temp</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
