import React from 'react';
import { X, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { NavTab } from './Header';

interface BusinessModelCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const BusinessModelCanvasModal: React.FC<BusinessModelCanvasModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                Strategic Alignment Reference
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                100% Implemented
              </span>
            </div>
            <h3 className="text-base font-bold text-neutral-900 mt-0.5">
              Business Model Canvas Architecture
            </h3>
            <p className="text-xs text-neutral-500">
              Interactive mapping of the uploaded Business Model Canvas to our retail scheduling & labour hire engine.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            
            {/* 1. Key Partners */}
            <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block">
                  Key Partners
                </span>
                <span className="text-[11px] text-blue-700/80 block mt-0.5">
                  Competitive advantage network
                </span>
                
                <div className="mt-3 space-y-2">
                  <div className="p-2.5 bg-blue-100/70 border border-blue-200 rounded-lg text-xs font-medium text-blue-900 shadow-2xs">
                    One-outlet only retail operators
                  </div>
                  <div className="p-2.5 bg-blue-100/70 border border-blue-200 rounded-lg text-xs font-medium text-blue-900 shadow-2xs">
                    Job portals (FastJobs, GrabJobs, JobStreet)
                  </div>
                  <div className="p-2.5 bg-blue-100/70 border border-blue-200 rounded-lg text-xs font-medium text-blue-900 shadow-2xs">
                    Manpower agencies
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigateTab('jobseekers');
                  onClose();
                }}
                className="mt-2 text-[11px] text-blue-800 font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Job Portals</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 2. Key Activities */}
            <div className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wider block">
                  Key Activities
                </span>
                <span className="text-[11px] text-rose-700/80 block mt-0.5">
                  Operational value delivery
                </span>

                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      onNavigateTab('jobseekers');
                      onClose();
                    }}
                    className="w-full text-left p-2 bg-rose-100/70 border border-rose-200 rounded-lg text-xs font-medium text-rose-900 hover:bg-rose-200/80 transition-colors shadow-2xs"
                  >
                    Labour Hire ↗
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('payroll');
                      onClose();
                    }}
                    className="w-full text-left p-2 bg-rose-100/70 border border-rose-200 rounded-lg text-xs font-medium text-rose-900 hover:bg-rose-200/80 transition-colors shadow-2xs"
                  >
                    Timesheet Management ↗
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('availability');
                      onClose();
                    }}
                    className="w-full text-left p-2 bg-rose-100/70 border border-rose-200 rounded-lg text-xs font-medium text-rose-900 hover:bg-rose-200/80 transition-colors shadow-2xs"
                  >
                    In-house manpower skill / profile keeping ↗
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('roster');
                      onClose();
                    }}
                    className="w-full text-left p-2 bg-rose-100/70 border border-rose-200 rounded-lg text-xs font-medium text-rose-900 hover:bg-rose-200/80 transition-colors shadow-2xs"
                  >
                    Schedule Internal Manpower for store ↗
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('payroll');
                      onClose();
                    }}
                    className="w-full text-left p-2 bg-rose-100/70 border border-rose-200 rounded-lg text-xs font-medium text-rose-900 hover:bg-rose-200/80 transition-colors shadow-2xs"
                  >
                    Salary Calculation ↗
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Key Propositions */}
            <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                  Key Propositions
                </span>
                <span className="text-[11px] text-amber-800/80 block mt-0.5">
                  Core customer benefit
                </span>

                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      onNavigateTab('roster');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 bg-amber-100/70 border border-amber-200 rounded-lg text-xs font-semibold text-amber-950 hover:bg-amber-200/80 transition-colors shadow-2xs"
                  >
                    Automatic scheduling of staff shift/roster ↗
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('jobseekers');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 bg-amber-100/70 border border-amber-200 rounded-lg text-xs font-semibold text-amber-950 hover:bg-amber-200/80 transition-colors shadow-2xs"
                  >
                    Customer can tap on a ready pool of contract staff to fill in any shortage ↗
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('roster');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 bg-amber-100/70 border border-amber-200 rounded-lg text-xs font-semibold text-amber-950 hover:bg-amber-200/80 transition-colors shadow-2xs"
                  >
                    Ability to tweak the auto-generated roster where required ↗
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Customer Relationships & Channels */}
            <div className="bg-orange-50/40 border border-orange-200/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-xs font-bold text-orange-950 uppercase tracking-wider block">
                  Relationships & Channels
                </span>
                <span className="text-[11px] text-orange-700/80 block mt-0.5">
                  Touchpoints & engagement
                </span>

                <div className="mt-3 space-y-2">
                  <div className="p-2 bg-orange-100/70 border border-orange-200 rounded-lg text-xs font-medium text-orange-900 shadow-2xs">
                    Can contact us via email / support
                  </div>
                  <div className="p-2 bg-orange-100/70 border border-orange-200 rounded-lg text-xs font-medium text-orange-900 shadow-2xs">
                    C2C support in forums & gig community
                  </div>
                  <div className="p-2 bg-orange-100/70 border border-orange-200 rounded-lg text-xs font-medium text-orange-900 shadow-2xs">
                    Automated email / SMS notifications
                  </div>
                  <div className="p-2 bg-orange-100/70 border border-orange-200 rounded-lg text-xs font-medium text-orange-900 shadow-2xs">
                    Mobile-friendly responsive website
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Customer Segments */}
            <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  Customer Segments
                </span>
                <span className="text-[11px] text-emerald-700/80 block mt-0.5">
                  Target retail audiences
                </span>

                <div className="mt-3 space-y-2">
                  <div className="p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-950 shadow-2xs">
                    Restaurants & Shops
                  </div>
                  <div className="p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-950 shadow-2xs">
                    SMEs with manpower scheduling needs
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-900 block mb-1">Key Resources</span>
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    • External casual worker access<br />
                    • In-house workers with detailed/real-time availability
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Cost Structure & Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
              <strong className="text-neutral-900 block mb-1 font-semibold">Cost Structure</strong>
              Server hosting, API integration gateway with FastJobs/GrabJobs, SMS notification gateway, platform development, and customer support.
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
              <strong className="text-neutral-900 block mb-1 font-semibold">Revenue Streams</strong>
              Monthly SaaS subscription per outlet ($49–$99/month), transactional commission per temporary gig worker successfully placed ($1.50/shift).
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            Source: Uploaded Business Model Canvas.jpg
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm"
          >
            Close Canvas
          </button>
        </div>

      </div>
    </div>
  );
};
