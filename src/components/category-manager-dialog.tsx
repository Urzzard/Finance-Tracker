'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '../app/actions'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Pencil, Trash2, X, Check, AlertTriangle } from "lucide-react"
import { useActionToast } from './use-action-toast'

interface Category {
  id: number
  name: string
  type: 'income' | 'expense' | 'transfer'
  icon?: string | null
  userId?: string
}

interface CategoryManagerDialogProps {
  categories: Category[]
  trigger?: React.ReactNode
}

const COMMON_ICONS = ['📌', '🍔', '🚗', '🏠', '💡', '🎮', '👕', '💊', '📱', '💰', '🎁', '🏥', '📚', '✈️', '💼', '🎵']

export function CategoryManagerDialog({ categories, trigger }: CategoryManagerDialogProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: '', type: 'expense' as 'income' | 'expense', icon: '📌' })
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' as 'income' | 'expense', icon: '📌' })
  const [showNewForm, setShowNewForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { handleActionResult } = useActionToast()

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  async function handleCreate(formData: FormData) {
    const result = await createCategory(formData)
    handleActionResult(result, 'Categoría creada')
    if (result.success) {
      setShowNewForm(false)
      setNewCategory({ name: '', type: 'expense', icon: '📌' })
    }
  }

  async function handleUpdate(id: number, formData: FormData) {
    const result = await updateCategory(id, formData)
    handleActionResult(result, 'Categoría actualizada')
    if (result.success) {
      setEditingId(null)
    }
  }

  async function handleDelete(id: number) {
    const result = await deleteCategory(id)
    if (result.success) {
      handleActionResult({ success: true }, 'Categoría eliminada')
      setDeleteConfirm(null)
      setDeleteError(null)
    } else {
      setDeleteError(result.error || 'Error al eliminar')
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      type: category.type === 'transfer' ? 'expense' : category.type,
      icon: category.icon || '📌'
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ name: '', type: 'expense', icon: '📌' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Gestionar Categorías
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías</DialogTitle>
          <DialogDescription>
            Crea, edita o elimina tus categorías de transacciones.
          </DialogDescription>
        </DialogHeader>

        {showNewForm ? (
          <form action={handleCreate} className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="grid gap-2">
              <Label>Nueva Categoría</Label>
              <div className="flex gap-2">
                <Select 
                  name="icon" 
                  value={newCategory.icon}
                  onValueChange={(value) => setNewCategory(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue>{newCategory.icon}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ICONS.map(icon => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  name="name" 
                  placeholder="Nombre de categoría" 
                  required 
                  maxLength={50}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select name="type" defaultValue={newCategory.type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">💰 Ingreso</SelectItem>
                  <SelectItem value="expense">💸 Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                <Check className="w-4 h-4 mr-1" />
                Guardar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewForm(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowNewForm(true)} className="w-full mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400">💰 Ingresos</h4>
          {incomeCategories.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No hay categorías de ingreso</p>
          ) : (
            incomeCategories.map(category => (
              editingId === category.id ? (
                <form 
                  key={category.id} 
                  action={(formData) => handleUpdate(category.id, formData)}
                  className="flex gap-2 items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <Select name="icon" defaultValue={editForm.icon}>
                    <SelectTrigger className="w-[60px]">
                      <SelectValue>{editForm.icon}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_ICONS.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    name="name" 
                    defaultValue={editForm.name} 
                    required 
                    maxLength={50}
                    className="flex-1 h-8"
                  />
                  <Select name="type" defaultValue={editForm.type}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="expense">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="ghost" size="sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div key={category.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group">
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(category)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(category.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )
            ))
          )}
        </div>

        <div className="space-y-2 mt-4">
          <h4 className="font-medium text-sm text-slate-500 dark:text-slate-400">💸 Gastos</h4>
          {expenseCategories.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No hay categorías de gasto</p>
          ) : (
            expenseCategories.map(category => (
              editingId === category.id ? (
                <form 
                  key={category.id} 
                  action={(formData) => handleUpdate(category.id, formData)}
                  className="flex gap-2 items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <Select name="icon" defaultValue={editForm.icon}>
                    <SelectTrigger className="w-[60px]">
                      <SelectValue>{editForm.icon}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_ICONS.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    name="name" 
                    defaultValue={editForm.name} 
                    required 
                    maxLength={50}
                    className="flex-1 h-8"
                  />
                  <Select name="type" defaultValue={editForm.type}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="expense">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="ghost" size="sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <div key={category.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group">
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(category)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(category.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )
            ))
          )}
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg max-w-sm">
              <div className="flex items-center gap-2 mb-4 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">¿Eliminar categoría?</span>
              </div>
              {deleteError ? (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  {deleteError}
                </p>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Si esta categoría tiene transacciones asociadas, no se podrá eliminar.
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setDeleteConfirm(null); setDeleteError(null) }}>
                  Cancelar
                </Button>
                {!deleteError && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
