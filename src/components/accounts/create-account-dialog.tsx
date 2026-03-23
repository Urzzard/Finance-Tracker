'use client'

import { useState } from 'react'
import { createAccount } from '../../app/(dashboard)/actions'
import { Plus } from 'lucide-react'
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
import { Checkbox } from "@/components/ui/checkbox"
import { useActionToast } from '../use-action-toast'

interface AccountGroup {
  id: number
  name: string
}

interface CreateAccountDialogProps {
  groups: AccountGroup[]
}

export function CreateAccountDialog({ groups }: CreateAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const { handleActionResult } = useActionToast()

  async function handleSubmit(formData: FormData) {
      const result = await createAccount(formData)
      if (result) {
        handleActionResult(result, 'Cuenta creada exitosamente')
        if (result.success) {
          setOpen(false)
        }
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva Cuenta</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Crear Cuenta</DialogTitle>
          <DialogDescription>
            Agrega una fuente de dinero (Ej: Efectivo, BCP, Plin).
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="Ej: Billetera Principal" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currency">Moneda</Label>
            <Select name="currency" defaultValue="PEN">
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona moneda" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isCredit" name="isCredit" />
            <Label htmlFor="isCredit" className="text-sm font-normal">
                ¿Es tarjeta de crédito? (Deuda)
            </Label>
          </div>

          {groups.length > 0 && (
            <div className="grid gap-2">
              <Label>Agregar a grupos</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`group-${group.id}`} 
                      name="groups" 
                      value={group.id.toString()}
                    />
                    <Label 
                      htmlFor={`group-${group.id}`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {group.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit">Guardar Cuenta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
