import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import dynamic from "next/dynamic";
import { ModeToggle } from "../components/mod-toggle";

const CreateAccountDialog = dynamic(() => 
  import("../components/create-account-dialog").then(mod => mod.CreateAccountDialog)
);
const CreateTransactionDialog = dynamic(() => 
  import("../components/create-transaction-dialog").then(mod => mod.CreateTransactionDialog)
);
const TransactionList = dynamic(() =>
  import("../components/transaction-list").then(mod => mod.TransactionList)
);
const ProfileDropdown = dynamic(() => 
  import("../components/profile-dropdown").then(mod => mod.ProfileDropdown)
);
const AccountSortableList = dynamic(() =>
  import("../components/account-draggable-list").then(mod => mod.AccountSortableList)
);
const AccountGroupsManager = dynamic(() =>
  import("../components/account-groups-manager").then(mod => mod.AccountGroupsManager)
);
const CollapsibleSection = dynamic(() =>
  import("../components/collapsible-section").then(mod => mod.CollapsibleSection)
);

import { db } from "../db";
import { accounts } from "../db/schema";
import { getTransactions, getCategories, getAccountBalances, getGroupsWithAccounts } from "./actions";

const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

// Función para formatear moneda con separador de miles
const formatCurrency = (amount: number, currency: string) => {
  const prefix = currency === 'USD' ? '$' : 'S/'
  const absoluteAmount = Math.abs(amount / 100)
  const sign = amount >= 0 ? '' : '-'
  const formatted = absoluteAmount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${prefix} ${sign}${formatted}`
};

export default async function Dashboard() {
  // 1. Verificamos quién eres (con cache para deduplicar)
  const { user, error } = await getCurrentUser();

  // 2. Si no hay usuario, fuera de aquí (al login)
  if (error || !user) {
    redirect('/login');
  }

  // --- CONSULTA A BASE DE DATOS ---
  // Obtenemos las cuentas del usuario logueado
  const userAccounts = await db.query.accounts.findMany({
    where: (accounts, { eq }) => eq(accounts.userId, user.id),
    orderBy: (accounts, { asc }) => [asc(accounts.sortOrder), asc(accounts.createdAt)],
  });

  // Obtenemos las transacciones, categorías, balances y grupos en paralelo
  const [userTransactions, userCategories, accountBalances, userGroups] = await Promise.all([
    getTransactions(),
    getCategories(),
    getAccountBalances(),
    getGroupsWithAccounts()
  ]);

  // Calculamos balance general por moneda
  // Solo incluimos cuentas que tienen includeInTotal = true en sus grupos
  const accountsIncludedInTotal = new Set<number>()
  
  userGroups.forEach(group => {
    if (group.includeInTotal) {
      group.accounts.forEach(account => {
        accountsIncludedInTotal.add(account.id)
      })
    }
  })

  const generalBalances = userAccounts
    .filter(account => {
      const accountInAnyGroup = userGroups.some(g => g.accounts.some(a => a.id === account.id))
      if (!accountInAnyGroup) return true
      return accountsIncludedInTotal.has(account.id)
    })
    .reduce((acc, account) => {
      const balance = accountBalances[account.id]
      if (!balance) return acc
      
      if (!acc[balance.currency]) {
        acc[balance.currency] = { income: 0, expense: 0, net: 0, currency: balance.currency }
      }
      
      acc[balance.currency].income += balance.income
      acc[balance.currency].expense += balance.expense
      acc[balance.currency].net += balance.net
      
      return acc
    }, {} as Record<string, { income: number; expense: number; net: number; currency: string }>)

  // 3. Si hay usuario, mostramos el Dashboard básico
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Mis Finanzas
          </h1>
          
          <div className="flex gap-2 items-center">
              <ModeToggle />
              <ProfileDropdown 
                userEmail={user.email || ''}
                accountCount={userAccounts.length}
              />
          </div>
        </div>

        {/* BALANCE GENERAL - STATEMENT CARDS */}
        {Object.keys(generalBalances).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Balance General</h2>
            </div>
            <div className={`grid gap-6 ${
              Object.keys(generalBalances).length === 1 
                ? 'grid-cols-1' 
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {Object.values(generalBalances).map((balance, index) => {
                const expenseRatio = balance.income > 0 
                  ? Math.round((balance.expense / balance.income) * 100) 
                  : 0
                const isHealthy = expenseRatio <= 80
                
                return (
                  <div key={index} className="group relative">
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg shadow-amber-500/10 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-amber-500/15 transition-all duration-300">
                      <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full opacity-60"></div>
                      
                      <div className="pt-4 space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {balance.currency === 'USD' ? 'Dólares Americanos' : 'Soles Peruanos'}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <span className="text-lg font-semibold">
                              {balance.currency === 'USD' ? '$' : 'S/'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className={`text-4xl font-bold ${
                            balance.net >= 0 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(balance.net, balance.currency)}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Balance total</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Ingresos</span>
                            </div>
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(balance.income, balance.currency)}
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Gastos</span>
                            </div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(balance.expense, balance.currency)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Ratio de gastos</span>
                            <span className={`font-semibold ${isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {expenseRatio}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isHealthy ? 'bg-emerald-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isHealthy 
                              ? 'Estás manteniendo un buen control de gastos' 
                              : 'Los gastos superan el 80% de tus ingresos'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}



        {/* SECCIÓN DE CUENTAS */}
        <AccountGroupsManager 
          accounts={userAccounts}
          groups={userGroups}
          accountBalances={accountBalances}
        />

        {/* SECCIÓN DE TRANSACCIONES */}
        <CollapsibleSection 
          title="Transacciones" 
          sectionKey="transactions" 
          defaultExpanded={true}
          count={userTransactions.length}
          actions={
            <CreateTransactionDialog 
              accounts={userAccounts} 
              categories={userCategories} 
            />
          }
          className="text-xs px-3 sm:text-sm sm:px-4"
        >
          <TransactionList 
            transactions={userTransactions} 
            accounts={userAccounts}
            categories={userCategories}
            embedded={true}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}