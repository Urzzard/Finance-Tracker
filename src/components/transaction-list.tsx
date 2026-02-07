'use client'

import { ArrowUpDown, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionActions } from "./transaction-actions"

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
    const formattedAmount = (amount / 100).toFixed(2)
    const prefix = currency === 'USD' ? '$' : 'S/'
    return `${prefix} ${formattedAmount}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpIcon className="w-4 h-4 text-green-600" />
      case 'expense':
        return <ArrowDownIcon className="w-4 h-4 text-red-600" />
      default:
        return <ArrowUpDown className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'expense':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>No tienes transacciones registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border-2 border-dashed rounded-lg border-muted-foreground/25">
            <p className="text-muted-foreground mb-4">Comienza registrando tu primera transacción</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transacciones
          <span className="text-sm font-normal text-muted-foreground">
            {transactions.length} transacciones
          </span>
        </CardTitle>
        <CardDescription>Tus ingresos y gastos más recientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Left side - Icon and info */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium leading-none">
                    {transaction.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{transaction.account.name}</span>
                    {transaction.category && (
                      <>
                    <span>•</span>
                    <span>{transaction.category?.icon} {transaction.category?.name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>

              {/* Right side - Amount and actions */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 
                    transaction.type === 'expense' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatAmount(transaction.amount, transaction.account.currency)}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={getTransactionBadgeColor(transaction.type)}
                  >
                    {transaction.type === 'income' ? 'Ingreso' : 
                     transaction.type === 'expense' ? 'Gasto' : 'Transferencia'}
                  </Badge>
                </div>

                <TransactionActions 
                  transaction={transaction}
                  accounts={accounts}
                  categories={categories}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}