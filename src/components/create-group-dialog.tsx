'use client';

import { useState } from 'react';
import { createGroup } from '../app/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    
    const result = await createGroup(formData);
    
    if (result.success) {
      onOpenChange(false);
    } else {
      setError(result.error || 'Error al crear grupo');
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Grupo</DialogTitle>
          <DialogDescription>
            Agrupa tus cuentas para mejor organización
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del grupo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Dinero Real, Inversiones"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="includeInTotal" name="includeInTotal" defaultChecked />
              <Label htmlFor="includeInTotal" className="text-sm font-normal">
                Incluir en balance total
              </Label>
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
