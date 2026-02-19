'use client'

import { useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { updateTransaction, deleteTransaction } from '../app/actions'
import { useActionToast } from './use-action-toast'

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

interface TransactionActionsProps {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
}

export function TransactionActions({ transaction, accounts, categories }: TransactionActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    transaction.type === 'transfer' ? 'expense' : transaction.type
  )
  const { handleActionResult } = useActionToast()

  async function handleEdit(formData: FormData) {
    const result = await updateTransaction(transaction.id, formData)
    handleActionResult(result, 'Transacción actualizada exitosamente')
    if (result.success) {
      setShowEditDialog(false)
    }
  }

  async function handleDelete() {
    const result = await deleteTransaction(transaction.id)
    handleActionResult(result, 'Transacción eliminada exitosamente')
    if (result.success) {
      setShowDeleteAlert(false)
    }
  }

  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const offset = d.getTimezoneOffset() * 60000
    const localDate = new Date(d.getTime() - offset)
    return localDate.toISOString().slice(0, 16)
  }

  const formatAmountForInput = (amount: number) => {
    return (amount / 100).toFixed(2)
  }

  const filteredCategories = categories.filter(cat => 
    cat.type !== 'transfer' && cat.type === transactionType
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIÁLOGO DE EDICIÓN */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
            <DialogDescription>
              Modifica los datos de la transacción.
            </DialogDescription>
          </DialogHeader>
          
          <form action={handleEdit} className="grid gap-4 py-4">
            {/* Tipo de Transacción */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                name="type" 
                value={transactionType} 
                onValueChange={(value: 'income' | 'expense') => setTransactionType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Ingreso</SelectItem>
                  <SelectItem value="expense">💸 Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cuenta */}
            <div className="grid gap-2">
              <Label htmlFor="accountId">Cuenta</Label>
              <Select name="accountId" defaultValue={transaction.account.id.toString()} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Categoría (opcional)</Label>
              <Select name="categoryId" defaultValue={transaction.category?.id?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monto */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0.01"
                defaultValue={formatAmountForInput(transaction.amount)}
                placeholder="0.00" 
                required 
              />
            </div>

            {/* Descripción */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input 
                id="description" 
                name="description" 
                defaultValue={transaction.description || ''}
                placeholder="Ej: Almuerzo con amigos"
                required 
              />
            </div>

            {/* Fecha */}
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <Input 
                id="date" 
                name="date" 
                type="datetime-local" 
                defaultValue={formatDateForInput(transaction.date)}
                required 
              />
            </div>

            <DialogFooter>
              <Button type="submit">Actualizar Transacción</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE ELIMINACIÓN */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la transacción "<strong>{transaction.description}</strong>" 
              por <strong>{formatAmountForInput(transaction.amount)}</strong>. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}