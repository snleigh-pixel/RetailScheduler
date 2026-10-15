import React, { useState, useMemo } from 'react';
import { Header, NavTab } from './components/Header';
import { ShortageNoticeBanner } from './components/ShortageNoticeBanner';
import { RosterScheduler } from './components/RosterScheduler';
import { StaffAvailability } from './components/StaffAvailability';
import { ShortageAlertsView } from './components/ShortageAlertsView';
import { JobseekerNetworkView } from './components/JobseekerNetworkView';
import { WeeklyPayroll } from './components/WeeklyPayroll';
import { NotificationsModal } from './components/NotificationsModal';
import { BusinessModelCanvasModal } from './components/BusinessModelCanvasModal';

import { 
  OUTLETS, 
  INITIAL_STAFF, 
  SHIFT_TEMPLATES, 
  INITIAL_SHIFTS, 
  CONNECTED_JOB_PORTALS, 
  SAMPLE_APPLICANTS_POOL,
  INITIAL_NOTIFICATIONS 
} from './data/initialData';

import { 
  detectShortages, 
  autoScheduleRoster, 
  calculateWeeklyPayroll 
} from './services/schedulerEngine';

import { 
  StaffMember, 
  Shift, 
  JobApplicant, 
  NotificationMessage, 
  AvailabilityStatus,
  ShortageAlert
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('roster');
  const [selectedOutletId, setSelectedOutletId] = useState<string>('out-1');
  
  // Primary application state
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [portals] = useState(CONNECTED_JOB_PORTALS);
  const [applicants, setApplicants] = useState<JobApplicant[]>(SAMPLE_APPLICANTS_POOL);
  const [notifications, setNotifications] = useState<NotificationMessage[]>(INITIAL_NOTIFICATIONS);

  // Modals state
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const currentOutlet = OUTLETS.find(o => o.id === selectedOutletId) || OUTLETS[0];

  // Dynamic calculations
  const shortageAlerts = useMemo(() => {
    return detectShortages(shifts, selectedOutletId, '2026-10-15');
  }, [shifts, selectedOutletId]);

  const payrollSummary = useMemo(() => {
    return calculateWeeklyPayroll(shifts, staff, applicants, '2026-10-12', '2026-10-18');
  }, [shifts, staff, applicants]);

  const unreadNotifsCount = notifications.filter(n => n.unread).length;

  const openShiftsForOutlet = useMemo(() => {
    return shifts.filter(s => s.outletId === selectedOutletId && (!s.assignedStaffId || s.status === 'critical' || s.status === 'open' || s.status === 'broadcasted'));
  }, [shifts, selectedOutletId]);

  // Handlers
  const handleUpdateShift = (updated: Shift) => {
    setShifts(prev => prev.map(s => s.id === updated.id ? updated : s));
    showToast(`Updated shift: ${updated.title}`);
  };

  const handleAddShift = (newShiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...newShiftData,
      id: `shift-${Date.now()}`,
    };
    setShifts(prev => [...prev, newShift]);
    showToast(`Created new shift on ${newShift.date}`);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
    showToast('Shift removed from roster');
  };

  // Auto-schedule in-house staff
  const handleAutoSchedule = () => {
    const result = autoScheduleRoster(shifts, staff, selectedOutletId);
    setShifts(result.updatedShifts);

    const newNotif: NotificationMessage = {
      id: `notif-${Date.now()}`,
      type: 'shift_assigned',
      title: 'Auto-Roster Run Completed',
      message: `Assigned ${result.assignedCount} in-house shifts. ${result.remainingOpenCount} shifts remain unfulfilled and need temporary replacement staff.`,
      timestamp: 'Just now',
      unread: true,
      outletId: selectedOutletId,
      severity: result.remainingOpenCount > 0 ? 'critical' : 'success',
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(`Auto-Roster: ${result.assignedCount} assigned, ${result.remainingOpenCount} unfulfilled`);
  };

  // Staff availability update
  const handleUpdateStaffAvailability = (
    staffId: string, 
    date: string, 
    status: AvailabilityStatus, 
    note?: string
  ) => {
    setStaff(prev => prev.map(p => {
      if (p.id !== staffId) return p;
      return {
        ...p,
        availability: {
          ...p.availability,
          [date]: { date, status, note },
        },
      };
    }));

    const member = staff.find(s => s.id === staffId);
    if (status === 'unavailable') {
      // If staff was assigned to a shift on that date, unassign them
      setShifts(prev => prev.map(s => {
        if (s.date === date && s.assignedStaffId === staffId) {
          return {
            ...s,
            assignedStaffId: undefined,
            status: 'critical',
            notes: `Auto-unassigned: ${member?.name} marked unavailable (${note || 'Leave'})`,
          };
        }
        return s;
      }));

      // Add notification
      const notif: NotificationMessage = {
        id: `notif-${Date.now()}`,
        type: 'availability_update',
        title: 'Staff Leave Recorded',
        message: `${member?.name} declared unavailable on ${date}. Automated shortage alert surveillance active.`,
        timestamp: 'Just now',
        unread: true,
        outletId: selectedOutletId,
        severity: 'critical',
      };
      setNotifications(prev => [notif, ...prev]);
      showToast(`Leave recorded for ${member?.name} on ${date}`);
    } else {
      showToast(`Availability updated for ${member?.name}`);
    }
  };

  const handleUpdateStaffStatus = (staffId: string, status: 'available' | 'on-shift' | 'off-duty' | 'leave') => {
    setStaff(prev => prev.map(p => p.id === staffId ? { ...p, currentStatus: status } : p));
  };

  const handleAddStaff = (newPerson: StaffMember) => {
    setStaff(prev => [...prev, newPerson]);
    showToast(`Added ${newPerson.name} to in-house retail staff`);
  };

  // Job Portals Broadcast
  const handleBroadcastShifts = (shiftIds: string[], portalIds: string[], hourlyWage: number) => {
    setShifts(prev => prev.map(s => {
      if (shiftIds.includes(s.id)) {
        return {
          ...s,
          status: 'broadcasted',
          jobPortalSource: 'FastJobs & GrabJobs Linked',
        };
      }
      return s;
    }));

    const notif: NotificationMessage = {
      id: `notif-${Date.now()}`,
      type: 'shift_broadcast',
      title: 'Vacancies Broadcasted to Jobseeker Databases',
      message: `Advertised ${shiftIds.length} shift vacancies across ${portalIds.length} portals at $${hourlyWage.toFixed(2)}/hr rate offer.`,
      timestamp: 'Just now',
      unread: true,
      outletId: selectedOutletId,
      severity: 'info',
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`Broadcasted ${shiftIds.length} shifts to ${portalIds.length} portals`);
  };

  // Hire Applicant
  const handleHireApplicant = (applicantId: string, shiftId: string) => {
    const applicant = applicants.find(a => a.id === applicantId);
    if (!applicant) return;

    // Update applicant status
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: 'hired' } : a));

    // Update shift with temp worker
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          assignedStaffId: undefined,
          isTemporaryHire: true,
          tempApplicantName: applicant.name,
          jobPortalSource: applicant.portalSource,
          status: 'filled',
          notes: `Confirmed via ${applicant.portalSource} ($${applicant.hourlyRateQuote.toFixed(2)}/h)`,
        };
      }
      return s;
    }));

    const notif: NotificationMessage = {
      id: `notif-${Date.now()}`,
      type: 'temp_hired',
      title: 'Temporary Replacement Staff Secured',
      message: `${applicant.name} confirmed for shift via ${applicant.portalSource}. Automated SMS confirmation dispatched.`,
      timestamp: 'Just now',
      unread: true,
      outletId: selectedOutletId,
      severity: 'success',
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`Hired ${applicant.name} from ${applicant.portalSource}!`);
  };

  const handleDeclineApplicant = (applicantId: string) => {
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: 'declined' } : a));
    showToast('Applicant declined');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        shortageAlerts={shortageAlerts}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setShowNotifModal(true)}
        onOpenBusinessModel={() => setShowCanvasModal(true)}
        onAutoSchedule={handleAutoSchedule}
      />

      {/* 3-Man-Day Advance Notice Shortage Alert Banner */}
      <ShortageNoticeBanner
        alerts={shortageAlerts}
        onBroadcastClick={(alert) => {
          setCurrentTab('jobseekers');
        }}
        onViewShortagesTab={() => setCurrentTab('shortages')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'roster' && (
          <RosterScheduler
            outlets={OUTLETS}
            selectedOutletId={selectedOutletId}
            onSelectOutlet={setSelectedOutletId}
            shifts={shifts}
            staff={staff}
            templates={SHIFT_TEMPLATES}
            onUpdateShift={handleUpdateShift}
            onAddShift={handleAddShift}
            onDeleteShift={handleDeleteShift}
            onAutoSchedule={handleAutoSchedule}
            onBroadcastShift={(shift) => {
              setCurrentTab('jobseekers');
            }}
          />
        )}

        {currentTab === 'availability' && (
          <StaffAvailability
            staff={staff}
            onUpdateStaffAvailability={handleUpdateStaffAvailability}
            onAddStaff={handleAddStaff}
            onUpdateStaffStatus={handleUpdateStaffStatus}
          />
        )}

        {currentTab === 'shortages' && (
          <ShortageAlertsView
            alerts={shortageAlerts}
            shifts={shifts}
            outlets={OUTLETS}
            onBroadcastAlert={(alert) => {
              setCurrentTab('jobseekers');
            }}
            onOpenApplicantsForShift={(shiftId) => {
              setCurrentTab('jobseekers');
            }}
            onAutoSchedule={handleAutoSchedule}
          />
        )}

        {currentTab === 'jobseekers' && (
          <JobseekerNetworkView
            portals={portals}
            applicants={applicants}
            openShifts={openShiftsForOutlet}
            onBroadcastShifts={handleBroadcastShifts}
            onHireApplicant={handleHireApplicant}
            onDeclineApplicant={handleDeclineApplicant}
          />
        )}

        {currentTab === 'payroll' && (
          <WeeklyPayroll
            payrollRecords={payrollSummary.records}
            totalGrossPay={payrollSummary.totalGrossPay}
            totalHoursWorked={payrollSummary.totalHoursWorked}
            totalStaffPaid={payrollSummary.totalStaffPaid}
            currentOutlet={currentOutlet}
          />
        )}

      </main>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-neutral-800 animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Modals */}
      <NotificationsModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        }}
        onClearNotifications={() => {
          setNotifications([]);
        }}
      />

      <BusinessModelCanvasModal
        isOpen={showCanvasModal}
        onClose={() => setShowCanvasModal(false)}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
        }}
      />

    </div>
  );
}
