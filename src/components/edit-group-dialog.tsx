'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { updateGroup, deleteGroup, addAccountToGroup, removeAccountFromGroup } from '../app/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Account {
  id: number;
  name: string;
  currency: string;
  isCredit: boolean | null;
}

interface Group {
  id: number;
  name: string;
  includeInTotal: boolean;
  accounts: Account[];
}

interface EditGroupDialogProps {
  group: Group;
  allAccounts: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupDialog({ group, allAccounts, open, onOpenChange }: EditGroupDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(group.name);
  const [includeInTotal, setIncludeInTotal] = useState(group.includeInTotal);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>(
    group.accounts.map(a => a.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await updateGroup(group.id, {
        name: name.trim(),
        includeInTotal,
      });

      if (!result.success) {
        setError(result.error || 'Error al actualizar grupo');
        setLoading(false);
        return;
      }

      const currentAccountIds = group.accounts.map(a => a.id);
      const newAccountIds = selectedAccounts;

      const accountsToAdd = newAccountIds.filter(id => !currentAccountIds.includes(id));
      const accountsToRemove = currentAccountIds.filter(id => !newAccountIds.includes(id));

      for (const accountId of accountsToAdd) {
        await addAccountToGroup(group.id, accountId);
      }

      for (const accountId of accountsToRemove) {
        await removeAccountFromGroup(group.id, accountId);
      }

      onOpenChange(false);
    } catch {
      setError('Error al actualizar grupo');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este grupo? Las cuentas no se eliminarán.')) {
      return;
    }

    setDeleting(true);
    const result = await deleteGroup(group.id);
    
    if (result.success) {
      onOpenChange(false);
    } else {
      setError(result.error || 'Error al eliminar grupo');
    }
    setDeleting(false);
  };

  const toggleAccount = (accountId: number) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
          <DialogDescription>
            Modifica el nombre, selecciona qué cuentas pertenecen al grupo
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del grupo</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Dinero Real, Inversiones"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-includeInTotal"
                checked={includeInTotal}
                onCheckedChange={(checked) => setIncludeInTotal(checked === true)}
              />
              <Label htmlFor="edit-includeInTotal" className="text-sm font-normal">
                Incluir en balance total
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Cuentas en este grupo</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                {allAccounts.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2">No hay cuentas disponibles</p>
                ) : (
                  allAccounts.map((account) => (
                    <div key={account.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`account-${account.id}`}
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={() => toggleAccount(account.id)}
                      />
                      <Label
                        htmlFor={`account-${account.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {account.name} ({account.currency})
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || deleting}
              className="flex items-center gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || deleting}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Guardar
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
