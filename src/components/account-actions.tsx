'use client'

import { useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { updateAccount, deleteAccount } from '../app/actions'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function AccountActions({ account }: { account: any }){
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => setShowDeleteAlert(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* DIÁLOGO DE EDICIÓN */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cuenta</DialogTitle>
                    </DialogHeader>
                    <form action={async (formData) => {
                        await updateAccount(account.id, formData)
                        setShowEditDialog(false)
                    }} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nombre</Label>
                            <Input name="name" defaultValue={account.name} required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select name="currency" defaultValue={account.currency}>
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
                            <Checkbox id="isCredit" name="isCredit" defaultChecked={account.isCredit} />
                            <Label htmlFor="isCredit" className="text-sm font-normal">
                                ¿Es tarjeta de crédito?
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button type="submit">Guardar Cambios</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ALERTA DE CONFIRMACIÓN PARA ELIMINAR */}
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la cuenta 
                            <strong> {account.name}</strong> y todos los registros asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={async () => await deleteAccount(account.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                            Sí, eliminar cuenta
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}