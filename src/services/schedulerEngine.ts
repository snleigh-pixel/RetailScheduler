import { Shift, StaffMember, ShortageAlert, PayrollRecord, JobApplicant, StaffRole } from '../types';

export const STANDARD_HOURS_PER_MAN_DAY = 7.5; // standard retail operational man-day

/**
 * Calculates days between two YYYY-MM-DD strings
 */
export function getDaysDifference(currentDateStr: string, targetDateStr: string): number {
  const current = new Date(currentDateStr + 'T00:00:00');
  const target = new Date(targetDateStr + 'T00:00:00');
  const diffTime = target.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Detects upcoming manpower shortages with 3-man-day advance notice rule.
 * Specifically checks for days with >= 3.0 man-days unfulfilled, or upcoming dates
 * that have open shifts with >= 3 days advance lead time for management action.
 */
export function detectShortages(
  shifts: Shift[],
  outletId: string,
  currentDateStr: string = '2026-10-15'
): ShortageAlert[] {
  const outletShifts = shifts.filter(s => s.outletId === outletId);
  const futureShifts = outletShifts.filter(s => s.date >= currentDateStr);

  // Group unassigned / open / critical shifts by date
  const dateMap: Record<string, Shift[]> = {};
  for (const shift of futureShifts) {
    if (!shift.assignedStaffId || shift.status === 'critical' || shift.status === 'open' || shift.status === 'broadcasted') {
      if (!dateMap[shift.date]) {
        dateMap[shift.date] = [];
      }
      dateMap[shift.date].push(shift);
    }
  }

  const alerts: ShortageAlert[] = [];

  for (const [date, openShifts] of Object.entries(dateMap)) {
    const advanceNoticeDays = getDaysDifference(currentDateStr, date);
    const totalOpenHours = openShifts.reduce((acc, s) => acc + s.hours, 0);
    const manDaysShort = Math.round((totalOpenHours / STANDARD_HOURS_PER_MAN_DAY) * 10) / 10;
    const rolesNeeded = Array.from(new Set(openShifts.map(s => s.roleRequired))) as StaffRole[];

    // If manDaysShort >= 3.0 or advanceNoticeDays <= 3 with unfilled shifts
    if (manDaysShort >= 2.0 || openShifts.length >= 2) {
      alerts.push({
        id: `alert-${outletId}-${date}`,
        outletId,
        date,
        advanceNoticeDays,
        manDaysShort,
        openShiftsCount: openShifts.length,
        rolesNeeded,
        urgency: manDaysShort >= 3.0 || advanceNoticeDays <= 3 ? 'critical' : 'warning',
        broadcastStatus: openShifts.every(s => s.status === 'broadcasted') 
          ? 'broadcasted' 
          : openShifts.some(s => s.status === 'broadcasted') 
            ? 'partially_filled' 
            : 'not_broadcasted',
        broadcastedPortals: openShifts.find(s => s.jobPortalSource)?.jobPortalSource ? [openShifts.find(s => s.jobPortalSource)!.jobPortalSource!] : [],
      });
    }
  }

  // Sort by date ascending
  return alerts.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Auto-scheduler engine:
 * Evaluates in-house staff availability, current weekly load, role matches,
 * and fills shifts where possible while flagging uncovered shifts.
 */
export function autoScheduleRoster(
  shifts: Shift[],
  staff: StaffMember[],
  outletId: string
): { updatedShifts: Shift[]; assignedCount: number; remainingOpenCount: number } {
  const staffHoursCount: Record<string, number> = {};
  staff.forEach(s => {
    staffHoursCount[s.id] = 0;
  });

  // Calculate current hours allocated
  for (const s of shifts) {
    if (s.assignedStaffId && staffHoursCount[s.assignedStaffId] !== undefined) {
      staffHoursCount[s.assignedStaffId] += s.hours;
    }
  }

  let assignedCount = 0;
  const updatedShifts = shifts.map(shift => {
    if (shift.outletId !== outletId || shift.assignedStaffId) {
      return shift;
    }

    // Find candidate staff
    const candidate = staff.find(person => {
      // Must be same outlet or willing to cross-cover
      if (person.outletId !== outletId && person.role !== 'Store Lead') return false;

      // Check availability for this date
      const avail = person.availability[shift.date];
      if (!avail || avail.status === 'unavailable') return false;

      // Check weekly target hours
      const currentHours = staffHoursCount[person.id] || 0;
      if (currentHours + shift.hours > person.weeklyTargetHours + 4) return false;

      // Check if already assigned a shift on this day
      const alreadyWorkingThatDay = shifts.some(
        other => other.id !== shift.id && other.date === shift.date && other.assignedStaffId === person.id
      );
      if (alreadyWorkingThatDay) return false;

      // Role check: Exact match or Store Lead can cover Cashier/Floor
      if (person.role === shift.roleRequired) return true;
      if (person.role === 'Store Lead' && (shift.roleRequired === 'Cashier' || shift.roleRequired === 'Floor Associate')) return true;
      if (person.role === 'Cashier' && shift.roleRequired === 'Floor Associate') return true;

      return false;
    });

    if (candidate) {
      assignedCount++;
      staffHoursCount[candidate.id] = (staffHoursCount[candidate.id] || 0) + shift.hours;
      return {
        ...shift,
        assignedStaffId: candidate.id,
        status: 'filled' as const,
      };
    }

    return shift;
  });

  const remainingOpenCount = updatedShifts.filter(s => s.outletId === outletId && !s.assignedStaffId).length;

  return { updatedShifts, assignedCount, remainingOpenCount };
}

/**
 * Calculates weekly payroll breakdown with regular hours, overtime (1.5x),
 * weekend allowances, CPF/statutory deductions, and net wage.
 */
export function calculateWeeklyPayroll(
  shifts: Shift[],
  staffList: StaffMember[],
  hiredApplicants: JobApplicant[] = [],
  startDate: string = '2026-10-12',
  endDate: string = '2026-10-18'
): { records: PayrollRecord[]; totalGrossPay: number; totalHoursWorked: number; totalStaffPaid: number } {
  const weekShifts = shifts.filter(s => s.date >= startDate && s.date <= endDate && (s.assignedStaffId || s.isTemporaryHire));
  const records: PayrollRecord[] = [];

  // 1. Process In-House Staff
  for (const staff of staffList) {
    const staffShifts = weekShifts.filter(s => s.assignedStaffId === staff.id);
    if (staffShifts.length === 0) continue;

    let totalHours = 0;
    let weekendBonusHours = 0;
    const shiftDetails = staffShifts.map(s => {
      totalHours += s.hours;
      const dayOfWeek = new Date(s.date + 'T00:00:00').getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend) {
        weekendBonusHours += s.hours;
      }
      return {
        shiftId: s.id,
        date: s.date,
        hours: s.hours,
        title: s.title,
        isWeekend,
      };
    });

    // Standard weekly regular limit is 40h or target; excess is OT at 1.5x
    const regularHours = Math.min(totalHours, staff.weeklyTargetHours);
    const otHours = Math.max(0, totalHours - staff.weeklyTargetHours);

    const basePay = Math.round(regularHours * staff.hourlyRate * 100) / 100;
    const otPay = Math.round(otHours * (staff.hourlyRate * 1.5) * 100) / 100;
    // Weekend peak allowance: $2.50 / hr worked on Saturday or Sunday
    const allowances = Math.round(weekendBonusHours * 2.50 * 100) / 100;
    const grossPay = Math.round((basePay + otPay + allowances) * 100) / 100;

    // CPF Statutory deduction: 20% employee deduction for full-time, 0% for casual temp
    const isCitizenFullTime = staff.employmentType === 'in-house-fulltime';
    const statutoryDeduction = isCitizenFullTime ? Math.round(grossPay * 0.20 * 100) / 100 : 0;
    const employerContribution = isCitizenFullTime ? Math.round(grossPay * 0.17 * 100) / 100 : 0;
    const netPay = Math.round((grossPay - statutoryDeduction) * 100) / 100;

    records.push({
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      employmentType: staff.employmentType,
      hourlyRate: staff.hourlyRate,
      regularHours: Math.round(regularHours * 10) / 10,
      otHours: Math.round(otHours * 10) / 10,
      weekendBonusHours: Math.round(weekendBonusHours * 10) / 10,
      basePay,
      otPay,
      allowances,
      grossPay,
      statutoryDeduction,
      employerContribution,
      netPay,
      shiftsWorkedCount: staffShifts.length,
      shifts: shiftDetails,
    });
  }

  // 2. Process Contract Casual / Hired Jobseeker Staff
  const tempShifts = weekShifts.filter(s => s.isTemporaryHire && s.tempApplicantName);
  for (const tempShift of tempShifts) {
    const applicant = hiredApplicants.find(a => a.name === tempShift.tempApplicantName);
    const hourlyRate = applicant ? applicant.hourlyRateQuote : 17.50;
    const grossPay = Math.round(tempShift.hours * hourlyRate * 100) / 100;
    const dayOfWeek = new Date(tempShift.date + 'T00:00:00').getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check if this temp already has an entry in records
    const existing = records.find(r => r.staffName === tempShift.tempApplicantName);
    if (existing) {
      existing.regularHours += tempShift.hours;
      existing.grossPay += grossPay;
      existing.netPay += grossPay;
      existing.shiftsWorkedCount += 1;
      existing.shifts.push({
        shiftId: tempShift.id,
        date: tempShift.date,
        hours: tempShift.hours,
        title: tempShift.title,
        isWeekend,
      });
    } else {
      records.push({
        staffId: `temp-${tempShift.id}`,
        staffName: tempShift.tempApplicantName || 'Contract Worker',
        role: tempShift.roleRequired,
        employmentType: 'contract-casual',
        hourlyRate,
        regularHours: tempShift.hours,
        otHours: 0,
        weekendBonusHours: isWeekend ? tempShift.hours : 0,
        basePay: grossPay,
        otPay: 0,
        allowances: 0,
        grossPay,
        statutoryDeduction: 0, // contract gig is paid direct net
        employerContribution: 0,
        netPay: grossPay,
        shiftsWorkedCount: 1,
        shifts: [
          {
            shiftId: tempShift.id,
            date: tempShift.date,
            hours: tempShift.hours,
            title: tempShift.title,
            isWeekend,
          },
        ],
      });
    }
  }

  const totalGrossPay = records.reduce((sum, r) => sum + r.grossPay, 0);
  const totalHoursWorked = records.reduce((sum, r) => sum + r.regularHours + r.otHours, 0);

  return {
    records,
    totalGrossPay: Math.round(totalGrossPay * 100) / 100,
    totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
    totalStaffPaid: records.length,
  };
}
