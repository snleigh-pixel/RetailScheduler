export type StaffRole = 
  | 'Store Lead'
  | 'Cashier'
  | 'Barista'
  | 'Floor Associate'
  | 'Stockroom Specialist'
  | 'Contract Casual';

export type EmploymentType = 'in-house-fulltime' | 'in-house-parttime' | 'contract-casual';

export type AvailabilityStatus = 'available' | 'preferred' | 'unavailable' | 'call-in-only';

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  note?: string;
  preferredShiftIds?: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  avatar: string;
  role: StaffRole;
  employmentType: EmploymentType;
  hourlyRate: number;
  weeklyTargetHours: number;
  phone: string;
  email: string;
  outletId: string;
  skills: string[];
  certifications: string[];
  currentStatus: 'available' | 'on-shift' | 'off-duty' | 'leave';
  availability: Record<string, DayAvailability>; // keyed by YYYY-MM-DD
  experienceYears: number;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string; // "08:00"
  endTime: string;   // "14:00"
  hours: number;
  badgeColor: string;
  requiredRole: StaffRole;
  minHeadcount: number;
}

export interface Shift {
  id: string;
  outletId: string;
  date: string; // YYYY-MM-DD
  templateId: string;
  title: string;
  startTime: string;
  endTime: string;
  hours: number;
  roleRequired: StaffRole;
  skillsRequired: string[];
  assignedStaffId?: string;
  isTemporaryHire?: boolean;
  jobPortalSource?: string;
  tempApplicantName?: string;
  status: 'filled' | 'open' | 'critical' | 'broadcasted';
  notes?: string;
}

export interface Outlet {
  id: string;
  name: string;
  shortCode: string;
  location: string;
  operatingHours: string;
  managerName: string;
  dailyManDayBaseline: number; // e.g., 4.5 man-days required daily
}

export interface ShortageAlert {
  id: string;
  outletId: string;
  date: string;
  advanceNoticeDays: number;
  manDaysShort: number;
  openShiftsCount: number;
  rolesNeeded: StaffRole[];
  urgency: 'critical' | 'warning' | 'normal';
  broadcastStatus: 'not_broadcasted' | 'broadcasting' | 'broadcasted' | 'partially_filled' | 'resolved';
  broadcastedPortals: string[];
}

export interface JobPortal {
  id: string;
  name: string;
  category: 'Job Board' | 'Instant Gig App' | 'Agency Network';
  activeCandidatePool: number;
  avgFillTimeHours: number;
  connected: boolean;
  description: string;
  logoColor: string;
}

export interface JobApplicant {
  id: string;
  shiftId: string;
  name: string;
  avatar: string;
  portalSource: string;
  rating: number;
  completedGigsCount: number;
  hourlyRateQuote: number;
  skills: string[];
  certifications: string[];
  appliedTimeAgo: string;
  status: 'pending' | 'hired' | 'declined';
  phone: string;
}

export interface PayrollRecord {
  staffId: string;
  staffName: string;
  role: StaffRole;
  employmentType: EmploymentType;
  hourlyRate: number;
  regularHours: number;
  otHours: number;
  weekendBonusHours: number;
  basePay: number;
  otPay: number;
  allowances: number;
  grossPay: number;
  statutoryDeduction: number; // e.g. CPF employee contribution
  employerContribution: number;
  netPay: number;
  shiftsWorkedCount: number;
  shifts: {
    shiftId: string;
    date: string;
    hours: number;
    title: string;
    isWeekend: boolean;
  }[];
}

export interface NotificationMessage {
  id: string;
  type: 'shortage_alert' | 'shift_assigned' | 'shift_broadcast' | 'temp_hired' | 'payroll_generated' | 'availability_update';
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  outletId?: string;
  severity: 'critical' | 'info' | 'success';
}
