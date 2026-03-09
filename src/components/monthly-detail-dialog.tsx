'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getMonthlySummary, getTransactionsByMonth } from '../app/actions';
import { Loader2 } from 'lucide-react';

interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  date: Date;
  type: 'income' | 'expense' | 'transfer';
  account: { id: number; name: string; currency: string };
  category: { id: number; name: string; icon: string | null } | null;
}

interface MonthlySummary {
  id: number;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  balancesByAccount: Record<number, number> | null;
  balancesByGroup: Record<number, number> | null;
}

interface MonthlyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatCurrency = (amount: number, currency: string = 'PEN') => {
  const prefix = currency === 'USD' ? '$' : 'S/'
  const absAmount = Math.abs(amount / 100)
  const sign = amount >= 0 ? '' : '-'
  return `${prefix} ${sign}${absAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

export function MonthlyDetailDialog({ open, onOpenChange, year, month }: MonthlyDetailDialogProps) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(() => {
    if (open) return true
    return false
  })

  useEffect(() => {
    if (!open) return
    
    const controller = new AbortController()
    
    async function fetchData() {
      setLoading(true)
      try {
        const [sum, txns] = await Promise.all([
          getMonthlySummary(year, month),
          getTransactionsByMonth(year, month)
        ])
        setSummary(sum as MonthlySummary | null)
        setTransactions(txns as Transaction[])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    return () => controller.abort()
  }, [open, year, month])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>
            {monthNames[month - 1]} {year}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Totales */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400">Ingresos</div>
                <div className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary.totalIncome)}
                </div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400">Gastos</div>
                <div className="text-sm sm:text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(summary.totalExpense)}
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400">Ahorro</div>
                <div className={`text-sm sm:text-lg font-bold ${summary.netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(summary.netSavings)}
                </div>
              </div>
            </div>

            {/* Transacciones del mes */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                Transacciones ({transactions.length})
              </h3>
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-500">No hay transacciones en este mes</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transactions.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          t.type === 'income' ? 'bg-emerald-500' : 
                          t.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            {t.description || t.category?.name || 'Sin descripción'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {t.account.name} • {new Date(t.date).toLocaleDateString('es-PE')}
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        t.type === 'income' ? 'text-emerald-600' : 
                        t.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount, t.account.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No hay resumen para este mes
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}