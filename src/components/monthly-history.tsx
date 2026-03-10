'use client';

import { useState } from 'react';
import { createMonthlySummary } from '../app/actions';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

const MonthlyDetailDialog = dynamic(() => import('./monthly-detail-dialog').then(mod => mod.MonthlyDetailDialog));

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

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatCurrency = (amount: number) => {
  const absAmount = Math.abs(amount / 100);
  const sign = amount >= 0 ? '' : '-';
  return `${sign}S/ ${absAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
};

interface MonthlyHistoryProps {
  summaries: MonthlySummary[];
  pendingMonths: MonthOption[];
  canCloseNow: boolean;
  currentYear: number;
  currentMonth: number;
}

function canCloseMonth(month: MonthOption, canCloseNow: boolean, currentYear: number, currentMonth: number): boolean {
  // Si es un mes anterior al actual, siempre se puede cerrar
  if (month.year < currentYear || (month.year === currentYear && month.month < currentMonth)) {
    return true;
  }
  // Si es el mes actual, solo se puede cerrar si es día 25+
  if (month.year === currentYear && month.month === currentMonth) {
    return canCloseNow;
  }
  return false;
}

function isMonthClosed(month: MonthOption, summaries: MonthlySummary[]): boolean {
  return summaries.some(s => s.year === month.year && s.month === month.month);
}

interface PendingMonthItemProps {
  month: MonthOption;
  canCloseNow: boolean;
  currentYear: number;
  currentMonth: number;
}

function PendingMonthItem({ month, canCloseNow, currentYear, currentMonth }: PendingMonthItemProps) {
  const canClose = canCloseMonth(month, canCloseNow, currentYear, currentMonth);
  const [loading, setLoading] = useState(false);
  const [closed, setClosed] = useState(false);

  async function handleClose() {
    setLoading(true);
    const result = await createMonthlySummary(month.year, month.month);
    if (result.success) {
      setClosed(true);
      window.location.reload();
    }
    setLoading(false);
  }

  if (closed) {
    return (
      <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            {monthNames[month.month - 1]} {month.year}
          </span>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          Cerrado
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
          {monthNames[month.month - 1]} {month.year}
        </span>
      </div>
      {canClose && (
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-1" />
              Cerrar
            </>
          )}
        </Button>
      )}
      {!canClose && (
        <span className="text-xs text-amber-600 dark:text-amber-400">
          Sin cerrar
        </span>
      )}
    </div>
  );
}

export function MonthlyHistory({ summaries, pendingMonths, canCloseNow, currentYear, currentMonth }: MonthlyHistoryProps) {
  const closedSummaries = summaries;
  // Solo meses pasados (excluir el mes actual)
  const pendingList = pendingMonths.filter(
    m => !isMonthClosed(m, summaries) && !(m.year === currentYear && m.month === currentMonth)
  );
  // Mes actual (si tiene transacciones y es día 25+)
  const currentMonthHasTransactions = pendingMonths.some(
    m => m.year === currentYear && m.month === currentMonth
  );
  const currentMonthIsClosed = isMonthClosed({ year: currentYear, month: currentMonth }, summaries);
  const showCurrentMonth = currentMonthHasTransactions && canCloseNow && !currentMonthIsClosed;
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);

  if (summaries.length === 0 && pendingMonths.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No hay transacciones aún. Registra tu primera transacción para comenzar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedMonth && (
        <MonthlyDetailDialog
          open={!!selectedMonth}
          onOpenChange={(open) => !open && setSelectedMonth(null)}
          year={selectedMonth.year}
          month={selectedMonth.month}
        />
      )}

      {/* Meses pendientes */}
      {pendingList.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Meses pendientes de cierre ({pendingList.length})
          </h3>
          <div className="space-y-2">
            {pendingList.map(m => (
              <PendingMonthItem key={`pending-${m.year}-${m.month}`} month={m} canCloseNow={canCloseNow} currentYear={currentYear} currentMonth={currentMonth} />
            ))}
          </div>
        </div>
      )}

      {/* Mes actual (día 25+) */}
      {showCurrentMonth && (
        <div>
          <h3 className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-2">
            Mes actual - Listo para cerrar
          </h3>
          <div className="space-y-2">
            <PendingMonthItem 
              month={{ year: currentYear, month: currentMonth }} 
              canCloseNow={canCloseNow} 
              currentYear={currentYear} 
              currentMonth={currentMonth} 
            />
          </div>
        </div>
      )}

      {/* Cierres realizados */}
      {closedSummaries.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Cierres realizados ({closedSummaries.length})
          </h3>
          <div className="space-y-2">
            {closedSummaries.map(summary => (
              <div
                key={summary.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex-1 cursor-pointer min-w-0" onClick={() => setSelectedMonth({ year: summary.year, month: summary.month })}>
                  <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                    {monthNames[summary.month - 1]} {summary.year}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="hidden sm:inline">
                      {formatCurrency(summary.totalIncome)} ingresos • {formatCurrency(summary.totalExpense)} gastos
                    </span>
                    <span className="sm:hidden flex flex-col">
                      <span>{formatCurrency(summary.totalIncome)} ingresos</span>
                      <span>{formatCurrency(summary.totalExpense)} gastos</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`text-sm sm:text-lg font-bold ${summary.netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(summary.netSavings)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMonth({ year: summary.year, month: summary.month })}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
