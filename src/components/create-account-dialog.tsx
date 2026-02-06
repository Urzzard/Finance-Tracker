'use client'

import { useState } from 'react'
import { createAccount } from '../app/actions'
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

export function CreateAccountDialog() {
  const [open, setOpen] = useState(false)

  // Función wrapper para cerrar el modal después de guardar
  async function handleSubmit(formData: FormData) {
      await createAccount(formData)
      setOpen(false) // Cierra el modal
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Nueva Cuenta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Cuenta</DialogTitle>
          <DialogDescription>
            Agrega una fuente de dinero (Ej: Efectivo, BCP, Plin).
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          
          {/* Nombre */}
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="Ej: Billetera Principal" required />
          </div>

          {/* Moneda */}
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

          {/* Es Crédito? */}
          <div className="flex items-center space-x-2">
            <Checkbox id="isCredit" name="isCredit" />
            <Label htmlFor="isCredit" className="text-sm font-normal">
                ¿Es tarjeta de crédito? (Deuda)
            </Label>
          </div>

          <DialogFooter>
            <Button type="submit">Guardar Cuenta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}