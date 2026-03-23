'use client';

import { MonthlyHistory } from './monthly-history'

interface MonthlySummary {
  id: number;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  createdAt: Date;
}

interface MonthOption {
  year: number;
  month: number;
}

interface HistoryViewProps {
  summaries: MonthlySummary[];
  pendingMonths: MonthOption[];
  canCloseNow: boolean;
  currentYear: number;
  currentMonth: number;
}

export function HistoryView({ summaries, pendingMonths, canCloseNow, currentYear, currentMonth }: HistoryViewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Historial de Cierres</h1>
      </div>
      <MonthlyHistory
        summaries={summaries}
        pendingMonths={pendingMonths}
        canCloseNow={canCloseNow}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </div>
  );
}
