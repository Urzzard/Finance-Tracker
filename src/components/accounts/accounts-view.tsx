'use client';

import { useState } from 'react';
import { AccountGroupsTabs } from './account-groups-tabs';
import { AccountSortableList } from './account-sortable-list';
import { CreateAccountDialog } from './create-account-dialog';
import { GroupBalanceCard } from './group-balance-card';

interface Account {
  id: number;
  name: string;
  currency: string;
  isCredit: boolean | null;
  createdAt: Date;
  sortOrder: number | null;
}

interface Group {
  id: number;
  name: string;
  includeInTotal: boolean;
  createdAt: Date;
  accounts: Account[];
}

interface AccountBalance {
  income: number;
  expense: number;
  net: number;
  currency: string;
}

interface AccountsViewProps {
  accounts: Account[];
  groups: Group[];
  accountBalances: Record<number, AccountBalance>;
}

export function AccountsView({ accounts, groups, accountBalances }: AccountsViewProps) {
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  const filteredAccounts = activeGroupId
    ? accounts.filter(account => 
        groups.find(g => g.id === activeGroupId)?.accounts.some(a => a.id === account.id)
      )
    : accounts;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Mis Cuentas</h1>
        </div>
        <CreateAccountDialog groups={groups} />
      </div>

      <div className="mb-6">
        <AccountGroupsTabs 
          groups={groups} 
          allAccounts={accounts}
          activeGroup={activeGroupId}
          onGroupChange={setActiveGroupId}
        />
      </div>

      {activeGroupId && filteredAccounts.length > 0 && (
        <GroupBalanceCard 
          accounts={filteredAccounts} 
          accountBalances={accountBalances} 
        />
      )}

      {filteredAccounts.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">💳</span>
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            {activeGroupId ? 'No hay cuentas en este grupo' : 'Sin cuentas registradas'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {activeGroupId ? 'Agrega cuentas a este grupo desde editar grupo' : 'Comienza creando tu primera cuenta para organizar tus finanzas'}
          </p>
        </div>
      ) : (
        <AccountSortableList 
          accounts={filteredAccounts} 
          accountBalances={accountBalances} 
        />
      )}
    </div>
  );
}
