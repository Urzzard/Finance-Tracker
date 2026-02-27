'use client';

import { useState } from 'react';
import { AccountGroupsTabs } from './account-groups-tabs';
import { AccountSortableList } from './account-draggable-list';
import { CreateAccountDialog } from './create-account-dialog';
import { CollapsibleSection } from './collapsible-section';
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

interface AccountGroupsManagerProps {
  accounts: Account[];
  groups: Group[];
  accountBalances: Record<number, AccountBalance>;
}

export function AccountGroupsManager({ accounts, groups, accountBalances }: AccountGroupsManagerProps) {
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

  const filteredAccounts = activeGroupId
    ? accounts.filter(account => 
        groups.find(g => g.id === activeGroupId)?.accounts.some(a => a.id === account.id)
      )
    : accounts;

  return (
    <>
      <CollapsibleSection 
        title="Mis Cuentas" 
        sectionKey="accounts" 
        defaultExpanded={true}
        actions={<CreateAccountDialog groups={groups} />}
        className="text-xs px-3 sm:text-sm sm:px-4"
      >
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
      </CollapsibleSection>
    </>
  );
}
