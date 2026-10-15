import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Store, 
  Clock, 
  AlertCircle, 
  Check, 
  X, 
  Send,
  UserCheck,
  Building
} from 'lucide-react';
import { Outlet, Shift, StaffMember, ShiftTemplate, StaffRole } from '../types';

interface RosterSchedulerProps {
  outlets: Outlet[];
  selectedOutletId: string;
  onSelectOutlet: (id: string) => void;
  shifts: Shift[];
  staff: StaffMember[];
  templates: ShiftTemplate[];
  onUpdateShift: (shift: Shift) => void;
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onDeleteShift: (id: string) => void;
  onAutoSchedule: () => void;
  onBroadcastShift: (shift: Shift) => void;
}

export const RosterScheduler: React.FC<RosterSchedulerProps> = ({
  outlets,
  selectedOutletId,
  onSelectOutlet,
  shifts,
  staff,
  templates,
  onUpdateShift,
  onAddShift,
  onDeleteShift,
  onAutoSchedule,
  onBroadcastShift,
}) => {
  // Current active week dates: Oct 12 to Oct 18, 2026 (Week 42)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addDayDate, setAddDayDate] = useState<string>('2026-10-18');

  const currentOutlet = outlets.find(o => o.id === selectedOutletId) || outlets[0];

  // Calculate week dates based on weekOffset
  const baseDate = new Date('2026-10-12T00:00:00');
  baseDate.setDate(baseDate.getDate() + (weekOffset * 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      dateStr,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      monthName: monthNames[d.getMonth()],
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isToday: dateStr === '2026-10-15',
    };
  });

  const outletShifts = shifts.filter(s => s.outletId === selectedOutletId);

  // Form state for creating a new shift
  const [newShiftForm, setNewShiftForm] = useState<{
    templateId: string;
    date: string;
    title: string;
    startTime: string;
    endTime: string;
    hours: number;
    roleRequired: StaffRole;
    assignedStaffId?: string;
  }>({
    templateId: 'tmpl-open',
    date: '2026-10-18',
    title: 'Morning Opening',
    startTime: '08:00',
    endTime: '14:30',
    hours: 6.5,
    roleRequired: 'Store Lead',
  });

  const handleTemplateSelect = (templateId: string) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return;
    setNewShiftForm(prev => ({
      ...prev,
      templateId,
      title: tmpl.name,
      startTime: tmpl.startTime,
      endTime: tmpl.endTime,
      hours: tmpl.hours,
      roleRequired: tmpl.requiredRole,
    }));
  };

  const handleSaveNewShift = (e: React.FormEvent) => {
    e.preventDefault();
    onAddShift({
      outletId: selectedOutletId,
      date: newShiftForm.date,
      templateId: newShiftForm.templateId,
      title: newShiftForm.title,
      startTime: newShiftForm.startTime,
      endTime: newShiftForm.endTime,
      hours: newShiftForm.hours,
      roleRequired: newShiftForm.roleRequired,
      skillsRequired: ['Customer Assistance'],
      assignedStaffId: newShiftForm.assignedStaffId || undefined,
      status: newShiftForm.assignedStaffId ? 'filled' : 'open',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200">
        
        {/* Outlet Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Store className="w-4 h-4 text-neutral-500" />
            <span className="font-medium text-neutral-800">Outlet:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-lg">
            {outlets.map(outlet => (
              <button
                key={outlet.id}
                onClick={() => onSelectOutlet(outlet.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedOutletId === outlet.id
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {outlet.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Week Range Navigator & Actions */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1.5 hover:bg-white rounded text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-3 text-neutral-800 whitespace-nowrap font-mono tabular-nums">
              {weekDays[0].monthName} {weekDays[0].dayNumber} – {weekDays[6].monthName} {weekDays[6].dayNumber}, 2026
            </span>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-1.5 hover:bg-white rounded text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setNewShiftForm(prev => ({ ...prev, date: weekDays[0].dateStr }));
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shift</span>
          </button>

          <button
            onClick={onAutoSchedule}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Auto-Fill</span>
          </button>
        </div>

      </div>

      {/* Store Info Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-neutral-100/70 rounded-lg text-xs text-neutral-600 border border-neutral-200">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-neutral-900">{currentOutlet.name}</span>
          <span>·</span>
          <span>Hours: {currentOutlet.operatingHours}</span>
          <span>·</span>
          <span>Manager: {currentOutlet.managerName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Daily Baseline Target: <strong className="font-semibold text-neutral-900">{currentOutlet.dailyManDayBaseline} Man-Days</strong> (~{currentOutlet.dailyManDayBaseline * 8}h)</span>
        </div>
      </div>

      {/* Week Grid Roster */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
          
          {weekDays.map(day => {
            const dayShifts = outletShifts.filter(s => s.date === day.dateStr);
            const openShifts = dayShifts.filter(s => !s.assignedStaffId || s.status === 'critical' || s.status === 'open');
            const totalHours = dayShifts.reduce((sum, s) => sum + s.hours, 0);

            return (
              <div 
                key={day.dateStr} 
                className={`min-h-[520px] flex flex-col ${day.isWeekend ? 'bg-neutral-50/40' : 'bg-white'}`}
              >
                
                {/* Day Header */}
                <div className={`p-3 border-b border-neutral-200 ${day.isToday ? 'bg-amber-50/60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${day.isToday ? 'text-amber-900' : 'text-neutral-500'}`}>
                        {day.dayName}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-neutral-900 font-mono tabular-nums">
                          {day.dayNumber}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {day.monthName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setAddDayDate(day.dateStr);
                        setNewShiftForm(prev => ({ ...prev, date: day.dateStr }));
                        setShowAddModal(true);
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
                      title={`Add Shift for ${day.dayName} ${day.dayNumber}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
                    <span>{dayShifts.length} shifts ({totalHours}h)</span>
                    {openShifts.length > 0 && (
                      <span className="text-rose-700 font-medium">
                        {openShifts.length} open
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Shifts Stack */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                  {dayShifts.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-neutral-400">
                      <p className="text-xs">No shifts scheduled</p>
                      <button
                        onClick={() => {
                          setAddDayDate(day.dateStr);
                          setNewShiftForm(prev => ({ ...prev, date: day.dateStr }));
                          setShowAddModal(true);
                        }}
                        className="mt-1.5 text-[11px] text-neutral-700 hover:underline"
                      >
                        + Create shift
                      </button>
                    </div>
                  ) : (
                    dayShifts.map(shift => {
                      const assignedPerson = staff.find(p => p.id === shift.assignedStaffId);
                      const isCritical = shift.status === 'critical' || (!shift.assignedStaffId && !shift.isTemporaryHire);
                      const isTemp = shift.isTemporaryHire;

                      return (
                        <div
                          key={shift.id}
                          className={`p-2.5 rounded-lg border transition-all text-xs relative group ${
                            isCritical 
                              ? 'bg-rose-50/70 border-rose-200' 
                              : isTemp
                                ? 'bg-purple-50/70 border-purple-200'
                                : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                          }`}
                        >
                          {/* Time & Role */}
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-neutral-900 leading-tight">
                              {shift.title}
                            </span>
                            <span className="text-[11px] font-mono tabular-nums text-neutral-500 shrink-0">
                              {shift.hours}h
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-neutral-600 mt-1 font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span>{shift.startTime} – {shift.endTime}</span>
                          </div>

                          <div className="mt-1.5 flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">
                              {shift.roleRequired}
                            </span>
                          </div>

                          {/* Assignee / Status Banner */}
                          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                            {assignedPerson ? (
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={assignedPerson.avatar}
                                  alt={assignedPerson.name}
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-5 rounded-full object-cover border border-neutral-200"
                                />
                                <span className="font-medium text-neutral-800 truncate max-w-[100px]">
                                  {assignedPerson.name}
                                </span>
                              </div>
                            ) : isTemp ? (
                              <div className="flex items-center gap-1 text-purple-800">
                                <Building className="w-3.5 h-3.5 text-purple-600" />
                                <span className="font-medium truncate max-w-[110px]" title={shift.tempApplicantName}>
                                  {shift.tempApplicantName || 'Contract Hired'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-rose-700">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="font-semibold text-[11px]">Uncovered</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1">
                              {isCritical && (
                                <button
                                  onClick={() => onBroadcastShift(shift)}
                                  title="Broadcast to Job Portals"
                                  className="p-1 text-amber-700 hover:bg-amber-100 rounded transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setEditingShift(shift)}
                                className="text-[11px] text-neutral-500 hover:text-neutral-900 hover:underline px-1"
                              >
                                Edit
                              </button>
                            </div>
                          </div>

                          {shift.jobPortalSource && (
                            <div className="mt-1 text-[10px] text-purple-700">
                              Source: {shift.jobPortalSource}
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* Edit Shift Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Edit Shift Details</h3>
                <p className="text-xs text-neutral-500">{editingShift.title} · {editingShift.date}</p>
              </div>
              <button
                onClick={() => setEditingShift(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Assign Staff Member
                </label>
                <select
                  value={editingShift.assignedStaffId || ''}
                  onChange={e => {
                    const newStaffId = e.target.value || undefined;
                    setEditingShift({
                      ...editingShift,
                      assignedStaffId: newStaffId,
                      isTemporaryHire: false,
                      status: newStaffId ? 'filled' : 'open',
                    });
                  }}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg focus:outline-neutral-900"
                >
                  <option value="">-- No In-House Staff (Mark Open) --</option>
                  {staff.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.role}) · ${person.hourlyRate}/h · Status: {person.currentStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingShift.startTime}
                    onChange={e => setEditingShift({ ...editingShift, startTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingShift.endTime}
                    onChange={e => setEditingShift({ ...editingShift, endTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Role Requirement</label>
                <select
                  value={editingShift.roleRequired}
                  onChange={e => setEditingShift({ ...editingShift, roleRequired: e.target.value as StaffRole })}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option value="Store Lead">Store Lead</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Barista">Barista</option>
                  <option value="Floor Associate">Floor Associate</option>
                  <option value="Stockroom Specialist">Stockroom Specialist</option>
                  <option value="Contract Casual">Contract Casual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Shift Notes</label>
                <textarea
                  value={editingShift.notes || ''}
                  onChange={e => setEditingShift({ ...editingShift, notes: e.target.value })}
                  rows={2}
                  placeholder="Special instructions, leave replacement reason, etc."
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteShift(editingShift.id);
                    setEditingShift(null);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800"
                >
                  Delete Shift
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingShift(null)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateShift(editingShift);
                      setEditingShift(null);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add New Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Create New Retail Shift</h3>
                <p className="text-xs text-neutral-500">{currentOutlet.name}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewShift} className="p-4 space-y-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Choose Shift Template
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleTemplateSelect(tmpl.id)}
                      className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                        newShiftForm.templateId === tmpl.id
                          ? 'border-neutral-900 bg-neutral-50 font-semibold'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="truncate">{tmpl.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {tmpl.startTime} - {tmpl.endTime} ({tmpl.hours}h)
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Shift Date</label>
                <input
                  type="date"
                  value={newShiftForm.date}
                  onChange={e => setNewShiftForm({ ...newShiftForm, date: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newShiftForm.startTime}
                    onChange={e => setNewShiftForm({ ...newShiftForm, startTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newShiftForm.endTime}
                    onChange={e => setNewShiftForm({ ...newShiftForm, endTime: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Role Needed</label>
                <select
                  value={newShiftForm.roleRequired}
                  onChange={e => setNewShiftForm({ ...newShiftForm, roleRequired: e.target.value as StaffRole })}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option value="Store Lead">Store Lead</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Barista">Barista</option>
                  <option value="Floor Associate">Floor Associate</option>
                  <option value="Stockroom Specialist">Stockroom Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Assign Staff (Optional)</label>
                <select
                  value={newShiftForm.assignedStaffId || ''}
                  onChange={e => setNewShiftForm({ ...newShiftForm, assignedStaffId: e.target.value || undefined })}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option value="">Leave unassigned (Open for dispatch)</option>
                  {staff.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name} · {person.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 shadow-sm"
                >
                  Create Shift
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
