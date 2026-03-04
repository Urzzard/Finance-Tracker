'use client';

import { useState } from 'react';
import { createMonthlySummary } from '../app/actions';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface MonthOption {
  year: number;
  month: number;
}

interface CloseMonthButtonProps {
  pendingMonths: MonthOption[];
  closedMonths: { year: number; month: number }[];
  canCloseNow: boolean;
  currentYear: number;
  currentMonth: number;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function isMonthClosed(month: MonthOption, closedMonths: { year: number; month: number }[]): boolean {
  return closedMonths.some(c => c.year === month.year && c.month === month.month);
}

function canCloseMonthOption(month: MonthOption, canCloseNow: boolean, currentYear: number, currentMonth: number): boolean {
  if (month.year < currentYear || (month.year === currentYear && month.month < currentMonth)) {
    return true;
  }
  if (month.year === currentYear && month.month === currentMonth) {
    return canCloseNow;
  }
  return false;
}

export function CloseMonthButton({ pendingMonths, closedMonths, canCloseNow, currentYear, currentMonth }: CloseMonthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthOption | null>(null);
  const [closed, setClosed] = useState(false);

  const availableMonths = pendingMonths.filter(
    m => !isMonthClosed(m, closedMonths) && canCloseMonthOption(m, canCloseNow, currentYear, currentMonth)
  );

  async function handleClose() {
    if (!selectedMonth) return;
    setLoading(true);
    const result = await createMonthlySummary(selectedMonth.year, selectedMonth.month);
    if (result.success) {
      setClosed(true);
      window.location.reload();
    }
    setLoading(false);
  }

  if (closed || (selectedMonth && isMonthClosed(selectedMonth, closedMonths))) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <CheckCircle className="w-5 h-5" />
        <span>Mes cerrado</span>
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        No hay meses pendientes de cierre
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950">
            {selectedMonth 
              ? `Cerrar ${monthNames[selectedMonth.month - 1]} ${selectedMonth.year}`
              : 'Seleccionar mes'}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenu.Trigger>
        
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[180px] bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 p-1 z-50">
            <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Meses pendientes de cierre
            </DropdownMenu.Label>
            {availableMonths.map(m => (
              <DropdownMenu.Item
                key={`${m.year}-${m.month}`}
                className="px-2 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded outline-none"
                onSelect={() => setSelectedMonth(m)}
              >
                {monthNames[m.month - 1]} {m.year}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {selectedMonth && (
        <Button 
          onClick={handleClose} 
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Cerrando...
            </>
          ) : (
            'Confirmar'
          )}
        </Button>
      )}
    </div>
  );
}
