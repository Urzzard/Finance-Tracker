'use client';

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface Account {
  id: number;
  name: string;
  currency: string;
}

interface AccountBalance {
  income: number;
  expense: number;
  net: number;
  currency: string;
}

interface GroupBalanceCardProps {
  accounts: Account[];
  accountBalances: Record<number, AccountBalance>;
}

export function GroupBalanceCard({ accounts, accountBalances }: GroupBalanceCardProps) {
  const formatAmount = (amount: number, currency: string) => {
    const prefix = currency === 'USD' ? '$' : 'S/';
    const formatted = Math.abs(amount / 100).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${prefix} ${formatted}`;
  };

  const totalBalance = accounts.reduce((sum, account) => {
    const balance = accountBalances[account.id];
    return sum + (balance?.net || 0);
  }, 0);

  const totalIncome = accounts.reduce((sum, account) => {
    const balance = accountBalances[account.id];
    return sum + (balance?.income || 0);
  }, 0);

  const totalExpense = accounts.reduce((sum, account) => {
    const balance = accountBalances[account.id];
    return sum + (balance?.expense || 0);
  }, 0);

  const net = totalIncome - totalExpense;
  const primaryCurrency = accounts[0]?.currency || 'PEN';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Balance</p>
          <p className={`text-lg font-bold ${totalBalance >= 0 ? 'text-slate-900 dark:text-slate-50' : 'text-red-600 dark:text-red-400'}`}>
            {totalBalance >= 0 ? '' : '-'}{formatAmount(totalBalance, primaryCurrency)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Ingresos</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <ArrowUpIcon className="w-4 h-4" />
            {formatAmount(totalIncome, primaryCurrency)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <p className="text-xs text-red-600 dark:text-red-400 mb-1">Gastos</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
            <ArrowDownIcon className="w-4 h-4" />
            {formatAmount(totalExpense, primaryCurrency)}
          </p>
        </div>
        
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Neto</p>
          <p className={`text-lg font-bold ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {net >= 0 ? '+' : '-'}{formatAmount(net, primaryCurrency)}
          </p>
        </div>
      </div>
    </div>
  );
}
