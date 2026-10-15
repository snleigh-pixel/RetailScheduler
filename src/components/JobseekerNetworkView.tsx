import React, { useState } from 'react';
import { 
  Briefcase, 
  Send, 
  CheckCircle2, 
  Star, 
  ExternalLink, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Filter,
  DollarSign,
  UserCheck,
  Radio
} from 'lucide-react';
import { JobPortal, JobApplicant, Shift } from '../types';

interface JobseekerNetworkViewProps {
  portals: JobPortal[];
  applicants: JobApplicant[];
  openShifts: Shift[];
  onBroadcastShifts: (shiftIds: string[], portalIds: string[], hourlyWage: number) => void;
  onHireApplicant: (applicantId: string, shiftId: string) => void;
  onDeclineApplicant: (applicantId: string) => void;
}

export const JobseekerNetworkView: React.FC<JobseekerNetworkViewProps> = ({
  portals,
  applicants,
  openShifts,
  onBroadcastShifts,
  onHireApplicant,
  onDeclineApplicant,
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string>('all');
  const [selectedPortals, setSelectedPortals] = useState<string[]>(portals.map(p => p.id));
  const [wageOffer, setWageOffer] = useState<number>(18.00);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const filteredApplicants = applicants.filter(a => {
    if (selectedShiftId === 'all') return true;
    return a.shiftId === selectedShiftId;
  });

  const handleTogglePortal = (portalId: string) => {
    setSelectedPortals(prev => 
      prev.includes(portalId) ? prev.filter(p => p !== portalId) : [...prev, portalId]
    );
  };

  const handleRunBroadcast = () => {
    if (openShifts.length === 0) return;
    setIsBroadcasting(true);
    setBroadcastSuccess(false);

    setTimeout(() => {
      const shiftIds = openShifts.map(s => s.id);
      onBroadcastShifts(shiftIds, selectedPortals, wageOffer);
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    }, 900);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section: Connected Job Portals & Candidate Pool */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Multi-Jobseeker Database Linkage & Labour Hire Network
            </h2>
            <p className="text-xs text-neutral-500">
              Direct API gateways to regional gig portals & licensed manpower agencies for on-demand contract retail staff.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {portals.filter(p => p.connected).length} Portals Connected
            </span>
          </div>
        </div>

        {/* Portals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {portals.map(portal => {
            const isChecked = selectedPortals.includes(portal.id);
            return (
              <div
                key={portal.id}
                onClick={() => handleTogglePortal(portal.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isChecked 
                    ? 'border-neutral-900 bg-neutral-50/70 shadow-xs' 
                    : 'border-neutral-200 bg-white opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase">
                    {portal.category}
                  </span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div
                    className="rounded text-neutral-900"
                  />
                </div>
                <div className="font-bold text-xs text-neutral-900 mt-1 truncate" title={portal.name}>
                  {portal.name}
                </div>
                <div className="mt-2 text-[11px] text-neutral-600 font-mono tabular-nums flex items-center justify-between">
                  <span>Pool: {portal.activeCandidatePool.toLocaleString()}</span>
                  <span className="text-neutral-400">~{portal.avgFillTimeHours}h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Composer */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              1-Click Vacancy Broadcast to Active Jobseeker Databases
            </h3>
            <p className="text-xs text-neutral-500">
              Advertise open retail shifts instantly across all selected networks.
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-600 tabular-nums">
            {openShifts.length} open shift vacancies eligible
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2">
          
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-semibold text-neutral-700">
              Offered Hourly Rate ($/hr)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-neutral-400 text-xs">$</span>
              <input
                type="number"
                step="0.50"
                min="14"
                max="30"
                value={wageOffer}
                onChange={e => setWageOffer(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg font-mono tabular-nums"
              />
            </div>
            <span className="text-[10px] text-neutral-500">Market median retail rate: $16.50 – $19.00/hr</span>
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="block text-xs font-semibold text-neutral-700">
              Target Candidates
            </label>
            <div className="text-xs text-neutral-800 py-1.5 px-3 bg-neutral-50 rounded-lg border border-neutral-200">
              Verified POS Cashiers, Store Leads & Sales Floor
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              onClick={handleRunBroadcast}
              disabled={openShifts.length === 0 || isBroadcasting}
              className={`w-full py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm ${
                openShifts.length === 0 
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {isBroadcasting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast {openShifts.length} Vacancies</span>
                </>
              )}
            </button>
          </div>

        </div>

        {broadcastSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Shift vacancies successfully pushed to {selectedPortals.length} job portals! Applicants arriving in queue.</span>
          </div>
        )}
      </div>

      {/* Incoming Applicants & Bids Queue */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Candidate Applications & Instant Bids ({filteredApplicants.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Pre-vetted casual retail candidates ready for immediate shift confirmation.
            </p>
          </div>

          {/* Filter by Shift */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedShiftId}
              onChange={e => setSelectedShiftId(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md focus:outline-neutral-900"
            >
              <option value="all">All Vacant Shifts</option>
              {openShifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.date} · {s.title} ({s.roleRequired})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applicants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredApplicants.map(applicant => {
            const isHired = applicant.status === 'hired';
            const matchedShift = openShifts.find(s => s.id === applicant.shiftId);

            return (
              <div
                key={applicant.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isHired 
                    ? 'bg-emerald-50/50 border-emerald-200' 
                    : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                }`}
              >
                <div>
                  
                  {/* Top Bar: Source Portal & Time */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-semibold text-neutral-800">
                      {applicant.portalSource}
                    </span>
                    <span className="font-mono text-neutral-400">
                      {applicant.appliedTimeAgo}
                    </span>
                  </div>

                  {/* Candidate Info */}
                  <div className="mt-2.5 flex items-start gap-3">
                    <img
                      src={applicant.avatar}
                      alt={applicant.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-neutral-900 truncate">
                          {applicant.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{applicant.rating}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {applicant.completedGigsCount} completed retail shifts
                      </div>
                    </div>
                  </div>

                  {/* Wage & Target Shift */}
                  <div className="mt-3 p-2 bg-neutral-50 rounded-lg text-xs space-y-1 border border-neutral-200">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-neutral-500 text-[11px]">Quote Rate:</span>
                      <strong className="text-neutral-900 tabular-nums">${applicant.hourlyRateQuote.toFixed(2)}/hr</strong>
                    </div>
                    {matchedShift && (
                      <div className="text-[11px] text-neutral-600 truncate">
                        Applied for: <strong>{matchedShift.title}</strong> ({matchedShift.date})
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {applicant.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="mt-2 space-y-0.5">
                    {applicant.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-1 text-[10px] text-emerald-700">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  {isHired ? (
                    <span className="w-full py-1.5 text-center text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-lg flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Hired & Assigned to Shift
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => onDeclineApplicant(applicant.id)}
                        className="py-1.5 px-3 text-xs text-neutral-500 hover:text-neutral-800 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onHireApplicant(applicant.id, applicant.shiftId)}
                        className="py-1.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Hire for Shift</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
