'use client'

import { TransactionList } from './transaction-list'
import { CreateTransactionDialog } from './create-transaction-dialog'

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

interface TransactionsViewProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
}

export function TransactionsView({ transactions, accounts, categories }: TransactionsViewProps) {
  const totalTransactions = transactions.length
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Transacciones</h1>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {totalTransactions}
          </span>
        </div>
        <CreateTransactionDialog accounts={accounts} categories={categories} />
      </div>
      <TransactionList 
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        embedded={false}
      />
    </div>
  );
}
