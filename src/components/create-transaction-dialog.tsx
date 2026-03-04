'use client'

import { useState } from 'react'
import { createTransaction } from '../app/actions'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, AlertTriangle } from "lucide-react"
import { useActionToast } from './use-action-toast'

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

interface CreateTransactionDialogProps {
  accounts: Account[]
  categories: Category[]
}

export function CreateTransactionDialog({ accounts, categories }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [dateWarning, setDateWarning] = useState<string | null>(null)
  const { handleActionResult } = useActionToast()

  const getLocalDateTime = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    const localDate = new Date(now.getTime() - offset)
    return localDate.toISOString().slice(0, 16)
  }

  function handleDateChange(dateStr: string) {
    if (!dateStr) {
      setDateWarning(null)
      return
    }
    
    const selectedDate = new Date(dateStr)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const selectedMonth = selectedDate.getMonth()
    const selectedYear = selectedDate.getFullYear()
    
    // Si es un mes anterior al actual
    if (
      selectedYear < currentYear || 
      (selectedYear === currentYear && selectedMonth < currentMonth)
    ) {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']
      setDateWarning(`¿Estás seguro que es de ${monthNames[selectedMonth]} ${selectedYear}?`)
    } else {
      setDateWarning(null)
    }
  }

  async function handleSubmit(formData: FormData) {
    const result = await createTransaction(formData)
    handleActionResult(result, 'Transacción creada exitosamente')
    if (result.success) {
      setOpen(false)
    }
  }

  const filteredCategories = categories.filter(cat => 
    cat.type !== 'transfer' && cat.type === transactionType
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <span>
            + Nueva Trans<span className="hidden sm:inline">acción</span>
            <span className="inline sm:hidden">...</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Nueva Transacción</DialogTitle>
          <DialogDescription>
            Registra un ingreso o gasto en tus cuentas.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
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
            <Select name="accountId" required>
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
            <Select name="categoryId">
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
              defaultValue={getLocalDateTime()}
              onChange={(e) => handleDateChange(e.target.value)}
              required 
            />
            {dateWarning && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">{dateWarning}</p>
                  <button
                    type="button"
                    className="text-xs text-amber-600 dark:text-amber-400 underline mt-1 hover:text-amber-800"
                    onClick={() => setDateWarning(null)}
                  >
                    Sí, es correcto
                  </button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">Guardar Transacción</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}