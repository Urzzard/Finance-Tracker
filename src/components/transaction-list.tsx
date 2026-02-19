'use client'

import { ArrowUpDown, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { TransactionActions } from "./transaction-actions"
import { CreateTransactionDialog } from "./create-transaction-dialog"

interface Transaction {
  id: number
  amount: number
  description: string | null
  date: Date
  type: 'income' | 'expense' | 'transfer'
  account: {
    id: number
    name: string
    currency: string
  }
  category?: {
    id: number
    name: string
    type: 'income' | 'expense' | 'transfer'
    icon?: string | null
  } | null
}

interface Account {
  id: number
  name: string
  currency: string
}

interface Category {
  id: number
  name: string
  type: 'income' | 'expense' | 'transfer'
  icon?: string | null
}

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
}

export function TransactionList({ transactions, accounts, categories }: TransactionListProps) {
  const formatAmount = (amount: number, currency: string) => {
    const prefix = currency === 'USD' ? '$' : 'S/'
    const formattedAmount = Math.abs(amount / 100).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return `${prefix} ${formattedAmount}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      case 'expense':
        return <ArrowDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
      default:
        return <ArrowUpDown className="w-4 h-4 text-slate-500" />
    }
  }

  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const transferTransactions = transactions.filter(t => t.type === 'transfer')

  const renderTransaction = (transaction: Transaction) => (
    <div
      key={transaction.id}
      className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors gap-2 sm:gap-3"
    >
      <div className="flex items-start gap-3 pr-8 sm:pr-0">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
          transaction.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
          transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30' :
          'bg-slate-200 dark:bg-slate-700'
        }`}>
          {getTransactionIcon(transaction.type)}
        </div>
        
        <div className="space-y-0.5 min-w-0">
          <p className="font-medium text-sm text-slate-900 dark:text-slate-50 truncate pr-2">
            {transaction.description || 'Sin descripción'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">{transaction.account.name}</span>
            {transaction.category && (
              <>
                <span>•</span>
                <span>{transaction.category?.icon} {transaction.category?.name}</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {formatDate(transaction.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 pl-11 sm:pl-0">
        <div className="text-right">
          <p className={`font-semibold text-sm ${
            transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 
            transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
          }`}>
            {transaction.type === 'expense' ? '-' : '+'}
            {formatAmount(transaction.amount, transaction.account.currency)}
          </p>
        </div>

        <div className="absolute top-2 right-2 sm:static">
          <TransactionActions 
            transaction={transaction}
            accounts={accounts}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )

  const renderEmptyState = () => (
    <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl mx-auto mb-3 flex items-center justify-center">
        <span className="text-xl">💸</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Sin transacciones registradas</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">Comienza registrando tu primera transacción</p>
    </div>
  )

  const renderColumn = (title: string, transactionsList: Transaction[], color: string, icon: React.ReactNode) => (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {transactionsList.length}
        </span>
      </div>
      {transactionsList.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
          <p className="text-xs text-slate-400 dark:text-slate-500">Sin {title.toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactionsList.map(renderTransaction)}
        </div>
      )}
    </div>
  )

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-slate-600 dark:bg-slate-400 rounded-full"></div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Transacciones</h2>
          </div>
          <CreateTransactionDialog 
            accounts={accounts} 
            categories={categories} 
          />
        </div>
        {renderEmptyState()}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-slate-600 dark:bg-slate-400 rounded-full"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Transacciones</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {transactions.length}
          </span>
        </div>
        <CreateTransactionDialog 
          accounts={accounts} 
          categories={categories} 
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {renderColumn(
          'Ingresos', 
          incomeTransactions, 
          'emerald',
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <ArrowUpIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700"></div>
        {renderColumn(
          'Gastos', 
          expenseTransactions, 
          'red',
          <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ArrowDownIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
          </div>
        )}
      </div>

      {transferTransactions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <ArrowUpDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Transferencias</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {transferTransactions.length}
            </span>
          </div>
          <div className="space-y-2">
            {transferTransactions.map(renderTransaction)}
          </div>
        </div>
      )}
    </div>
  )
}