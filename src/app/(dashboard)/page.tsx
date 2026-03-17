import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import dynamic from "next/dynamic";

const CreateTransactionDialog = dynamic(() => 
  import("../../components/create-transaction-dialog").then(mod => mod.CreateTransactionDialog)
);
const TransactionList = dynamic(() =>
  import("../../components/transaction-list").then(mod => mod.TransactionList)
);
const ProfileDropdown = dynamic(() => 
  import("../../components/profile-dropdown").then(mod => mod.ProfileDropdown)
);
const AccountGroupsManager = dynamic(() =>
  import("../../components/account-groups-manager").then(mod => mod.AccountGroupsManager)
);
const CollapsibleSection = dynamic(() =>
  import("../../components/collapsible-section").then(mod => mod.CollapsibleSection)
);
const CloseMonthButton = dynamic(() =>
  import("../../components/close-month-button").then(mod => mod.CloseMonthButton)
);
const MonthlyHistory = dynamic(() =>
  import("../../components/monthly-history").then(mod => mod.MonthlyHistory)
);

import { db } from "../../db";
import { getTransactions, getCategories, getAccountBalances, getGroupsWithAccounts, getMonthlySummaries, getMonthsWithTransactions } from "./actions";

const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
});

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
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect('/login');
  }

  const userAccounts = await db.query.accounts.findMany({
    where: (accounts, { eq }) => eq(accounts.userId, user.id),
    orderBy: (accounts, { asc }) => [asc(accounts.sortOrder), asc(accounts.createdAt)],
  });

  const [userTransactions, userCategories, accountBalances, userGroups, userSummaries, monthsWithTransactions] = await Promise.all([
    getTransactions(),
    getCategories(),
    getAccountBalances(),
    getGroupsWithAccounts(),
    getMonthlySummaries(),
    getMonthsWithTransactions()
  ]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isEndOfMonth = now.getDate() >= 25;
  
  const closedMonths = userSummaries.map(s => ({ year: s.year, month: s.month }));
  const pendingMonthsList = monthsWithTransactions.filter(
    m => 
      !closedMonths.some(c => c.year === m.year && c.month === m.month) &&
      !(m.year === currentYear && m.month === currentMonth)
  );
  const hasPendingMonths = pendingMonthsList.length > 0;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Mis Finanzas
          </h1>
          
          <div className="flex gap-2 items-center">
              <ProfileDropdown 
                userEmail={user.email || ''}
                accountCount={userAccounts.length}
              />
          </div>
        </div>

        {hasPendingMonths && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  Tienes {pendingMonthsList.length} mes{pendingMonthsList.length > 1 ? 'es' : ''} pendiente{pendingMonthsList.length > 1 ? 's' : ''} de cierre
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Cierra los meses anteriores para mantener un registro histórico de tus finanzas.
                </p>
              </div>
              <CloseMonthButton 
                pendingMonths={pendingMonthsList} 
                closedMonths={closedMonths}
                canCloseNow={true}
                currentYear={currentYear}
                currentMonth={currentMonth}
              />
            </div>
          </div>
        )}

        {isEndOfMonth && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                  Es momento de cerrar el mes de {monthNames[currentMonth - 1]}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ya puedes realizar el cierre mensual. Tus finanzas te lo agradecerán.
                </p>
              </div>
              <CloseMonthButton 
                pendingMonths={[{ year: currentYear, month: currentMonth }]} 
                closedMonths={closedMonths}
                canCloseNow={true}
                currentYear={currentYear}
                currentMonth={currentMonth}
              />
            </div>
          </div>
        )}

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

        <AccountGroupsManager 
          accounts={userAccounts}
          groups={userGroups}
          accountBalances={accountBalances}
        />

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

        <CollapsibleSection 
          title="Historial de Cierres" 
          sectionKey="history" 
          defaultExpanded={false}
          count={userSummaries.length}
          className="text-xs px-3 sm:text-sm sm:px-4"
        >
          <MonthlyHistory 
            summaries={userSummaries} 
            pendingMonths={monthsWithTransactions}
            canCloseNow={isEndOfMonth}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}
