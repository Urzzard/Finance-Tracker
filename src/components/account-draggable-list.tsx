'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { updateAccountOrder } from '../app/actions'
import { AccountActions } from './account-actions'

interface Account {
  id: number
  name: string
  currency: string
  isCredit: boolean | null
  createdAt: Date
}

interface AccountWithBalance extends Account {
  balance: {
    income: number
    expense: number
    net: number
    currency: string
  } | null
}

interface SortableAccountProps {
  account: AccountWithBalance
  formatCurrency: (amount: number, currency: string) => string
}

function SortableAccountCard({ account, formatCurrency }: SortableAccountProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const balance = account.balance

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab z-10 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>
      
      <div className="relative bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 ml-6">
        {/* BOTON DE ACCIONES */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AccountActions account={account} />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">{account.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {account.currency === 'USD' ? 'Dólares' : 'Soles'}
              </p>
            </div>
            {account.isCredit && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                Tarjeta de Crédito
              </span>
            )}
          </div>
          
          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-bold ${
              balance && balance.net < 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-slate-900 dark:text-slate-50'
            }`}>
              {balance ? formatCurrency(balance.net, balance.currency) : formatCurrency(0, account.currency)}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              Balance
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Ingresos</span>
            </div>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {balance ? formatCurrency(balance.income, balance.currency) : formatCurrency(0, account.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Gastos</span>
            </div>
            <span className="font-medium text-red-600 dark:text-red-400">
              {balance ? formatCurrency(balance.expense, balance.currency) : formatCurrency(0, account.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AccountSortableListProps {
  accounts: Account[]
  accountBalances: Record<number, { income: number; expense: number; net: number; currency: string }>
}

export function AccountSortableList({ accounts, accountBalances }: AccountSortableListProps) {
  const [items, setItems] = useState<Account[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setItems(accounts)
  }, [accounts])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)

      setItems(newItems)
      
      setIsSaving(true)
      startTransition(async () => {
        await updateAccountOrder(newItems.map((item) => item.id), false)
        setIsSaving(false)
      })
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100)
  }

  const accountsWithBalance: AccountWithBalance[] = items.map(account => ({
    ...account,
    balance: accountBalances[account.id] || null
  }))

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accountsWithBalance.map((account) => (
            <SortableAccountCard 
              key={account.id} 
              account={account}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </SortableContext>
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs">
          Guardando orden...
        </div>
      )}
    </DndContext>
  )
}
