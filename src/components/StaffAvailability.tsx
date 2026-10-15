import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  Award,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { StaffMember, StaffRole, EmploymentType, AvailabilityStatus } from '../types';

interface StaffAvailabilityProps {
  staff: StaffMember[];
  onUpdateStaffAvailability: (staffId: string, date: string, status: AvailabilityStatus, note?: string) => void;
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateStaffStatus: (staffId: string, status: 'available' | 'on-shift' | 'off-duty' | 'leave') => void;
}

export const StaffAvailability: React.FC<StaffAvailabilityProps> = ({
  staff,
  onUpdateStaffAvailability,
  onAddStaff,
  onUpdateStaffStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Active dates for availability grid (Oct 12 to Oct 21, 2026)
  const inspectionDates = [
    { dateStr: '2026-10-14', label: 'Wed 14' },
    { dateStr: '2026-10-15', label: 'Thu 15 (Today)' },
    { dateStr: '2026-10-16', label: 'Fri 16' },
    { dateStr: '2026-10-17', label: 'Sat 17' },
    { dateStr: '2026-10-18', label: 'Sun 18 (Peak)' },
    { dateStr: '2026-10-19', label: 'Mon 19' },
    { dateStr: '2026-10-20', label: 'Tue 20' },
  ];

  const filteredStaff = staff.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || person.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const selectedPerson = staff.find(s => s.id === selectedStaffId) || staff[0];

  // Quick form for new staff
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: 'Cashier' as StaffRole,
    employmentType: 'in-house-fulltime' as EmploymentType,
    hourlyRate: 18.00,
    weeklyTargetHours: 40,
    phone: '+65 9',
    email: '',
    skills: 'POS Checkout, Customer Service',
    certifications: 'Food Hygiene Level 1',
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const created: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffForm.name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: newStaffForm.role,
      employmentType: newStaffForm.employmentType,
      hourlyRate: Number(newStaffForm.hourlyRate),
      weeklyTargetHours: Number(newStaffForm.weeklyTargetHours),
      phone: newStaffForm.phone,
      email: newStaffForm.email || `${newStaffForm.name.toLowerCase().replace(/\s+/g, '.')}@retailshift.com`,
      outletId: 'out-1',
      skills: newStaffForm.skills.split(',').map(s => s.trim()),
      certifications: newStaffForm.certifications.split(',').map(c => c.trim()),
      currentStatus: 'available',
      experienceYears: 1.5,
      availability: {
        '2026-10-15': { date: '2026-10-15', status: 'available' },
        '2026-10-16': { date: '2026-10-16', status: 'available' },
        '2026-10-17': { date: '2026-10-17', status: 'available' },
        '2026-10-18': { date: '2026-10-18', status: 'available' },
        '2026-10-19': { date: '2026-10-19', status: 'available' },
      },
    };
    onAddStaff(created);
    setShowAddStaffModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            Real-Time Staff Availability & Skill Directory
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track retail worker shifts, daily availability declarations, leaves, and verified certifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard Retail Staff</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Staff Table on Left (2/3), Selected Staff Profile & Self-Service Simulator on Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Staff Availability Matrix */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff, role, or skill..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-neutral-900"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto max-w-full">
              {['all', 'Store Lead', 'Cashier', 'Barista', 'Floor Associate', 'Stockroom Specialist'].map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                    roleFilter === role
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Matrix Table */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-600 font-medium">
                    <th className="py-2.5 px-3 whitespace-nowrap">Staff Member</th>
                    <th className="py-2.5 px-2 whitespace-nowrap">Live Status</th>
                    <th className="py-2.5 px-2 whitespace-nowrap font-mono">Rate/h</th>
                    {inspectionDates.map(d => (
                      <th key={d.dateStr} className="py-2.5 px-1.5 text-center whitespace-nowrap font-mono text-[11px]">
                        {d.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredStaff.map(person => {
                    const isSelected = person.id === selectedStaffId;

                    return (
                      <tr 
                        key={person.id}
                        onClick={() => setSelectedStaffId(person.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-amber-50/40' : 'hover:bg-neutral-50/60'}`}
                      >
                        {/* Member */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={person.avatar}
                              alt={person.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover border border-neutral-200 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                                {person.name}
                                {person.employmentType === 'contract-casual' && (
                                  <span className="text-[10px] text-purple-700 bg-purple-50 px-1 rounded border border-purple-200">
                                    Casual
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                {person.role} · {person.weeklyTargetHours}h/wk target
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Live Status */}
                        <td className="py-2.5 px-2">
                          <select
                            value={person.currentStatus}
                            onClick={e => e.stopPropagation()}
                            onChange={e => onUpdateStaffStatus(person.id, e.target.value as any)}
                            className="text-[11px] font-medium px-2 py-1 rounded border border-neutral-200 bg-white"
                          >
                            <option value="available">Available</option>
                            <option value="on-shift">On Shift</option>
                            <option value="off-duty">Off Duty</option>
                            <option value="leave">On Leave</option>
                          </select>
                        </td>

                        {/* Rate */}
                        <td className="py-2.5 px-2 font-mono tabular-nums text-neutral-700">
                          ${person.hourlyRate.toFixed(2)}
                        </td>

                        {/* Days matrix */}
                        {inspectionDates.map(d => {
                          const avail = person.availability[d.dateStr];
                          const status = avail ? avail.status : 'available';

                          return (
                            <td key={d.dateStr} className="py-2 px-1 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // cycle status: available -> unavailable -> call-in-only -> available
                                  const nextStatus: AvailabilityStatus = 
                                    status === 'available' ? 'unavailable' : 
                                    status === 'unavailable' ? 'call-in-only' : 'available';
                                  onUpdateStaffAvailability(person.id, d.dateStr, nextStatus);
                                }}
                                title={`${d.label}: ${status} ${avail?.note ? `(${avail.note})` : ''} - Click to toggle`}
                                className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-[10px] font-mono transition-transform active:scale-90 ${
                                  status === 'available'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : status === 'unavailable'
                                      ? 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {status === 'available' ? '✓' : status === 'unavailable' ? '✕' : '~'}
                              </button>
                            </td>
                          );
                        })}

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStaffId(person.id);
                            }}
                            className="text-neutral-500 hover:text-neutral-900 font-medium text-[11px]"
                          >
                            Inspect
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footnote */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between text-[11px] text-neutral-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                  Available (✓)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-300 inline-block" />
                  Leave / Blackout (✕)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300 inline-block" />
                  Emergency Call-in (~)
                </span>
              </div>
              <span>Click any day pill to toggle worker availability</span>
            </div>
          </div>

        </div>

        {/* Right Column: Staff Profile & Employee Self-Service Simulation */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Selected Staff Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4 shadow-xs">
            <div className="flex items-start gap-3">
              <img
                src={selectedPerson.avatar}
                alt={selectedPerson.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 truncate">
                  {selectedPerson.name}
                </h3>
                <p className="text-xs text-neutral-600">
                  {selectedPerson.role} · {selectedPerson.experienceYears}y retail experience
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-mono">
                  <span>${selectedPerson.hourlyRate}/hr</span>
                  <span>·</span>
                  <span>{selectedPerson.employmentType === 'in-house-fulltime' ? 'Full-Time (CPF)' : 'Casual'}</span>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-2.5 bg-neutral-50 rounded-lg space-y-1.5 text-xs text-neutral-600 border border-neutral-200">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-mono">{selectedPerson.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span className="truncate">{selectedPerson.email}</span>
              </div>
            </div>

            {/* Skills Keeping (Business Model Canvas: In-house manpower skill/profile keeping) */}
            <div>
              <span className="text-xs font-semibold text-neutral-800 block mb-1.5">
                Verified Retail Skills
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedPerson.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <span className="text-xs font-semibold text-neutral-800 block mb-1.5">
                Accreditations & Hygiene Certs
              </span>
              <div className="space-y-1">
                {selectedPerson.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-neutral-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Self-Service Simulation Widget */}
            <div className="pt-3 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900">
                  Simulate Employee Self-Service
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Mobile Sync</span>
              </div>
              <p className="text-[11px] text-neutral-500 mb-3">
                Test submitting blackout dates or leave on behalf of <strong>{selectedPerson.name}</strong> to trigger advance shortage detection.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Mark Sunday Oct 18 as unavailable
                    onUpdateStaffAvailability(selectedPerson.id, '2026-10-18', 'unavailable', 'Family leave / exam prep');
                  }}
                  className="w-full py-1.5 px-3 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors text-left flex items-center justify-between"
                >
                  <span>Submit Leave for Sunday Oct 18</span>
                  <span className="font-mono text-[10px]">Trigger Alert</span>
                </button>

                <button
                  onClick={() => {
                    // Restore Sunday Oct 18 as available
                    onUpdateStaffAvailability(selectedPerson.id, '2026-10-18', 'available');
                  }}
                  className="w-full py-1.5 px-3 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors text-left flex items-center justify-between"
                >
                  <span>Confirm Available for Sunday Oct 18</span>
                  <span className="font-mono text-[10px]">Resolve Gap</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Onboard New Retail Staff</h3>
                <p className="text-xs text-neutral-500">Add to in-house manpower directory</p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jason Koh"
                  value={newStaffForm.name}
                  onChange={e => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Retail Role</label>
                  <select
                    value={newStaffForm.role}
                    onChange={e => setNewStaffForm({ ...newStaffForm, role: e.target.value as StaffRole })}
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
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Hourly Wage ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={newStaffForm.hourlyRate}
                    onChange={e => setNewStaffForm({ ...newStaffForm, hourlyRate: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Employment</label>
                  <select
                    value={newStaffForm.employmentType}
                    onChange={e => setNewStaffForm({ ...newStaffForm, employmentType: e.target.value as EmploymentType })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="in-house-fulltime">Full-Time (CPF)</option>
                    <option value="in-house-parttime">Part-Time</option>
                    <option value="contract-casual">Casual Gig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Hours/Wk</label>
                  <input
                    type="number"
                    value={newStaffForm.weeklyTargetHours}
                    onChange={e => setNewStaffForm({ ...newStaffForm, weeklyTargetHours: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newStaffForm.phone}
                  onChange={e => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newStaffForm.skills}
                  onChange={e => setNewStaffForm({ ...newStaffForm, skills: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 shadow-sm"
                >
                  Onboard Staff
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
