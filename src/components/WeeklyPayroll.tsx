import React, { useState } from 'react';
import { 
  DollarSign, 
  Download, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Printer, 
  X, 
  Building, 
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import { PayrollRecord, Outlet } from '../types';

interface WeeklyPayrollProps {
  payrollRecords: PayrollRecord[];
  totalGrossPay: number;
  totalHoursWorked: number;
  totalStaffPaid: number;
  currentOutlet: Outlet;
}

export const WeeklyPayroll: React.FC<WeeklyPayrollProps> = ({
  payrollRecords,
  totalGrossPay,
  totalHoursWorked,
  totalStaffPaid,
  currentOutlet,
}) => {
  const [selectedWeek, setSelectedWeek] = useState('2026-W42');
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecord | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<'pending' | 'approved'>('pending');

  const inHouseCount = payrollRecords.filter(r => r.employmentType !== 'contract-casual').length;
  const casualCount = payrollRecords.filter(r => r.employmentType === 'contract-casual').length;
  const totalNetPay = payrollRecords.reduce((sum, r) => sum + r.netPay, 0);
  const totalDeductions = payrollRecords.reduce((sum, r) => sum + r.statutoryDeduction, 0);

  // Generate and download CSV
  const handleExportCSV = () => {
    const headers = [
      'Staff Name',
      'Role',
      'Employment Type',
      'Hourly Rate ($)',
      'Regular Hours',
      'Overtime Hours',
      'Weekend Hours',
      'Base Pay ($)',
      'OT Pay ($)',
      'Allowances ($)',
      'Gross Pay ($)',
      'CPF Employee Deduction ($)',
      'Net Pay ($)'
    ];

    const rows = payrollRecords.map(r => [
      `"${r.staffName}"`,
      `"${r.role}"`,
      `"${r.employmentType}"`,
      r.hourlyRate.toFixed(2),
      r.regularHours.toFixed(1),
      r.otHours.toFixed(1),
      r.weekendBonusHours.toFixed(1),
      r.basePay.toFixed(2),
      r.otPay.toFixed(2),
      r.allowances.toFixed(2),
      r.grossPay.toFixed(2),
      r.statutoryDeduction.toFixed(2),
      r.netPay.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Retail_Weekly_Payroll_${selectedWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Week Selector & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-mono">
              Weekly Automated Payroll Engine
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-medium">
              Week 42 (Oct 12 – Oct 18, 2026)
            </span>
          </div>
          <h2 className="text-base font-bold text-neutral-900 mt-1">
            Retail Shift Wages & Statutory Calculation
          </h2>
          <p className="text-xs text-neutral-500">
            Computed once weekly based on validated shift schedules, 1.5x overtime thresholds, and weekend peak allowances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setPayoutStatus('approved')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap ${
              payoutStatus === 'approved'
                ? 'bg-emerald-700 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{payoutStatus === 'approved' ? 'Payroll Approved' : 'Approve Weekly Run'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Total Gross Payroll</span>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            ${totalGrossPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Net disbursement: ${totalNetPay.toFixed(2)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Total Hours Logged</span>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {totalHoursWorked.toFixed(1)} hrs
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Across {payrollRecords.reduce((sum, r) => sum + r.shiftsWorkedCount, 0)} shifts
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Personnel Headcount</span>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            {totalStaffPaid} Staff
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            {inHouseCount} in-house · {casualCount} casual temp
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Statutory CPF Withheld</span>
          <div className="text-xl font-bold text-neutral-900 font-mono tabular-nums mt-1">
            ${totalDeductions.toFixed(2)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Citizen & PR statutory compliance
          </span>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">
            Weekly Shift Wages Breakdown · Week 42
          </h3>
          <span className="text-xs text-neutral-500 font-mono">
            Rates compliant with Tripartite Retail Standards
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-600 font-medium">
                <th className="py-2.5 px-4 whitespace-nowrap">Staff Name & Role</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                <th className="py-2.5 px-3 text-right font-mono whitespace-nowrap">Base Rate</th>
                <th className="py-2.5 px-3 text-right font-mono whitespace-nowrap">Reg Hrs</th>
                <th className="py-2.5 px-3 text-right font-mono whitespace-nowrap">OT Hrs (1.5x)</th>
                <th className="py-2.5 px-3 text-right font-mono whitespace-nowrap">Weekend Prem</th>
                <th className="py-2.5 px-3 text-right font-mono whitespace-nowrap font-semibold text-neutral-900">Gross Pay</th>
                <th className="py-2.5 px-3 text-right font-mono whitespace-nowrap text-rose-700">CPF (20%)</th>
                <th className="py-2.5 px-4 text-right font-mono whitespace-nowrap font-bold text-neutral-900">Net Wage</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {payrollRecords.map(record => (
                <tr key={record.staffId} className="hover:bg-neutral-50/60 transition-colors">
                  
                  {/* Name & Role */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-neutral-900">{record.staffName}</div>
                    <div className="text-[11px] text-neutral-500">{record.role}</div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                      record.employmentType === 'in-house-fulltime'
                        ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        : record.employmentType === 'in-house-parttime'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {record.employmentType === 'in-house-fulltime' ? 'Full-Time' : record.employmentType === 'in-house-parttime' ? 'Part-Time' : 'Casual Gig'}
                    </span>
                  </td>

                  {/* Base rate */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                    ${record.hourlyRate.toFixed(2)}/h
                  </td>

                  {/* Regular hours */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                    {record.regularHours.toFixed(1)}h
                  </td>

                  {/* OT hours */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                    {record.otHours > 0 ? (
                      <span className="text-amber-800 font-semibold">{record.otHours.toFixed(1)}h</span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Weekend allowances */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                    {record.allowances > 0 ? (
                      <span>${record.allowances.toFixed(2)}</span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Gross */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                    ${record.grossPay.toFixed(2)}
                  </td>

                  {/* Deductions */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-700">
                    {record.statutoryDeduction > 0 ? `-$${record.statutoryDeduction.toFixed(2)}` : '$0.00'}
                  </td>

                  {/* Net */}
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-neutral-900">
                    ${record.netPay.toFixed(2)}
                  </td>

                  {/* Payslip */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPayslipRecord(record)}
                      className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Payslip</span>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table summary row */}
        <div className="p-4 bg-neutral-50/80 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-neutral-600 gap-2">
          <span>Formula: (Reg Hrs × Rate) + (OT Hrs × 1.5 Rate) + (Weekend Hrs × $2.50) − Statutory CPF = Net Wage</span>
          <span className="font-semibold text-neutral-900 font-mono">
            Weekly Net Disbursement: ${totalNetPay.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Individual Payslip Modal */}
      {selectedPayslipRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-neutral-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-bold text-neutral-900">Weekly Retail Itemized Payslip</h3>
              </div>
              <button
                onClick={() => setSelectedPayslipRecord(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payslip Content */}
            <div className="p-6 space-y-5 text-xs text-neutral-800">
              
              {/* Employer / Employee info */}
              <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">ShiftFlow Retail Pte Ltd</h4>
                  <p className="text-neutral-500 text-[11px] mt-0.5">{currentOutlet.name}</p>
                  <p className="text-neutral-500 text-[11px]">{currentOutlet.location}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-neutral-500 text-[11px]">Period: Oct 12 – Oct 18, 2026</span>
                  <div className="text-xs font-semibold text-neutral-800 mt-0.5">Pay Date: Oct 19, 2026</div>
                </div>
              </div>

              <div>
                <span className="text-xs text-neutral-500 font-medium block">Employee Name</span>
                <span className="text-sm font-bold text-neutral-900">{selectedPayslipRecord.staffName}</span>
                <span className="text-xs text-neutral-600 block mt-0.5">
                  Role: {selectedPayslipRecord.role} · Base: ${selectedPayslipRecord.hourlyRate.toFixed(2)}/hr
                </span>
              </div>

              {/* Shifts worked breakdown */}
              <div>
                <span className="font-semibold text-neutral-900 text-xs block mb-2">
                  Shift Timesheets Logged ({selectedPayslipRecord.shiftsWorkedCount} shifts):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedPayslipRecord.shifts.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-200 text-[11px]">
                      <div>
                        <span className="font-semibold text-neutral-800">{s.title}</span>
                        <span className="text-neutral-500 block font-mono">{s.date} {s.isWeekend ? '(Weekend Peak)' : ''}</span>
                      </div>
                      <span className="font-mono tabular-nums text-neutral-700">{s.hours} hours</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings & Deductions breakdown table */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="p-2.5 bg-neutral-50 border-b border-neutral-200 font-semibold text-[11px] text-neutral-700">
                  Itemized Earnings & Deductions
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Regular Wages ({selectedPayslipRecord.regularHours}h @ ${selectedPayslipRecord.hourlyRate}/h)</span>
                    <span className="font-mono tabular-nums text-neutral-900">${selectedPayslipRecord.basePay.toFixed(2)}</span>
                  </div>
                  {selectedPayslipRecord.otHours > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Overtime Wages (1.5x) ({selectedPayslipRecord.otHours}h)</span>
                      <span className="font-mono tabular-nums text-neutral-900">${selectedPayslipRecord.otPay.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedPayslipRecord.allowances > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Weekend Peak Allowances ({selectedPayslipRecord.weekendBonusHours}h @ $2.50/h)</span>
                      <span className="font-mono tabular-nums text-neutral-900">${selectedPayslipRecord.allowances.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-neutral-100 font-semibold text-neutral-900">
                    <span>Total Gross Wages</span>
                    <span className="font-mono tabular-nums">${selectedPayslipRecord.grossPay.toFixed(2)}</span>
                  </div>
                  {selectedPayslipRecord.statutoryDeduction > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>Employee CPF Contribution (20%)</span>
                      <span className="font-mono tabular-nums">-${selectedPayslipRecord.statutoryDeduction.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-sm text-neutral-900">
                    <span>Net Wage Payable</span>
                    <span className="font-mono tabular-nums">${selectedPayslipRecord.netPay.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Computer generated payslip. No signature required.</span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Payslip</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
