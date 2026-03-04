# Account Groups - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir a usuarios crear grupos de cuentas y filtrar visualmente por ellos, con balance agrupado y opción de excluir del total.

**Architecture:** 
- Nueva tabla `account_groups` y `account_group_members` en Drizzle schema
- Server actions para CRUD de grupos
- Client components para UI (tabs, diálogos, acordeón)
- Integración en page.tsx existente

**Tech Stack:** Next.js 16, Drizzle ORM, shadcn/ui (Dialog, DropdownMenu), @dnd-kit

---

## Tarea 1: Schema de Base de Datos

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Agregar tablas al schema**

```typescript
// Agregar después de la tabla accounts

// Tabla de grupos
export const accountGroups = pgTable('account_groups', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  includeInTotal: boolean('include_in_total').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabla pivote (many-to-many)
export const accountGroupMembers = pgTable('account_group_members', {
  groupId: integer('group_id').references(() => accountGroups.id, { onDelete: 'cascade' }).notNull(),
  accountId: integer('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
});

// Agregar relaciones
export const accountGroupsRelations = relations(accountGroups, ({ many }) => ({
  members: many(accountGroupMembers),
  accounts: many(accounts, {
    through: accountGroupMembers,
    source: accounts,
  }),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  // ... existing
  groupMembers: many(accountGroupMembers),
}));

export const accountGroupMembersRelations = relations(accountGroupMembers, ({ one }) => ({
  group: one(accountGroups, {
    fields: [accountGroupMembers.groupId],
    references: [accountGroups.id],
  }),
  account: one(accounts, {
    fields: [accountGroupMembers.accountId],
    references: [accounts.id],
  }),
}));
```

**Step 2: Generar migración**

Run: `npx drizzle-kit generate`
Expected: Crea archivo de migración con las nuevas tablas

**Step 3: Push a DB**

Run: `npx drizzle-kit push`
Expected: Tablas creadas en PostgreSQL

---

## Tarea 2: Server Actions

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Agregar imports**

```typescript
import { accountGroups, accountGroupMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
```

**Step 2: Agregar acciones de grupos**

```typescript
export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  const name = formData.get('name') as string;
  const includeInTotal = formData.get('includeInTotal') === 'on';

  if (!name?.trim()) {
    return { success: false, error: 'El nombre es requerido' };
  }

  try {
    await db.insert(accountGroups).values({
      userId: user.id,
      name: name.trim(),
      includeInTotal,
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error: 'Error al crear grupo' };
  }
}

export async function updateGroup(groupId: number, data: { name?: string; includeInTotal?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  try {
    await db.update(accountGroups)
      .set(data)
      .where(and(eq(accountGroups.id, groupId), eq(accountGroups.userId, user.id)));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating group:', error);
    return { success: false, error: 'Error al actualizar grupo' };
  }
}

export async function deleteGroup(groupId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  try {
    await db.delete(accountGroups)
      .where(and(eq(accountGroups.id, groupId), eq(accountGroups.userId, user.id)));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { success: false, error: 'Error al eliminar grupo' };
  }
}

export async function addAccountToGroup(groupId: number, accountId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  try {
    await db.insert(accountGroupMembers).values({ groupId, accountId });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding account to group:', error);
    return { success: false, error: 'Error al agregar cuenta al grupo' };
  }
}

export async function removeAccountFromGroup(groupId: number, accountId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  try {
    await db.delete(accountGroupMembers)
      .where(and(eq(accountGroupMembers.groupId, groupId), eq(accountGroupMembers.accountId, accountId)));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error removing account from group:', error);
    return { success: false, error: 'Error al quitar cuenta del grupo' };
  }
}

export async function getGroupsWithAccounts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const groups = await db.query.accountGroups.findMany({
    where: eq(accountGroups.userId, user.id),
    with: {
      members: {
        with: {
          account: true,
        },
      },
    },
  });

  return groups.map(g => ({
    ...g,
    accounts: g.members.map(m => m.account),
  }));
}
```

---

## Tarea 3: Componente CollapsibleSection

**Files:**
- Create: `src/components/collapsible-section.tsx`

**Step 1: Crear componente**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  sectionKey: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  sectionKey,
  defaultExpanded = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    const stored = localStorage.getItem(`section_${sectionKey}`);
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    } else {
      setIsExpanded(defaultExpanded);
    }
  }, [sectionKey, defaultExpanded]);

  const toggle = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    localStorage.setItem(`section_${sectionKey}`, String(newValue));
  };

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-800 mb-8", className)}>
      <button
        onClick={toggle}
        className="flex items-center gap-3 w-full text-left mb-4 hover:opacity-80 transition-opacity"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        )}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
      </button>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        {children}
      </div>
    </div>
  );
}
```

---

## Tarea 4: AccountGroupsTabs

**Files:**
- Create: `src/components/account-groups-tabs.tsx`

**Step 1: Crear componente**

```typescript
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGroupDialog } from './create-group-dialog';

interface Group {
  id: number;
  name: string;
  includeInTotal: boolean;
}

interface AccountGroupsTabsProps {
  groups: Group[];
  activeGroup: number | null;
  onGroupChange: (groupId: number | null) => void;
}

export function AccountGroupsTabs({ groups, activeGroup, onGroupChange }: AccountGroupsTabsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => onGroupChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeGroup === null
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Todas
        </button>
        
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onGroupChange(group.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeGroup === group.id
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {group.name}
          </button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="rounded-full px-3"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <CreateGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
```

---

## Tarea 5: CreateGroupDialog

**Files:**
- Create: `src/components/create-group-dialog.tsx`

**Step 1: Crear componente**

```typescript
'use client';

import { useState } from 'react';
import { createGroup } from '@/app/actions';
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
```

---

## Tarea 6: Integración en page.tsx

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Agregar imports**

```typescript
import { getGroupsWithAccounts } from './actions';
import { CollapsibleSection } from '@/components/collapsible-section';
import { AccountGroupsTabs } from '@/components/account-groups-tabs';
import dynamic from 'next/dynamic';

const CreateGroupDialog = dynamic(() => 
  import('@/components/create-group-dialog').then(mod => mod.CreateGroupDialog)
);
```

**Step 2: Modificar componente Dashboard**

```typescript
// Agregar estado para grupo activo
const [activeGroupId, setActiveGroupId] = useState<number | null>(null);

// Obtener grupos
const userGroups = await getGroupsWithAccounts();

// Filtrar cuentas por grupo si hay uno seleccionado
const filteredAccounts = activeGroupId
  ? userAccounts.filter(account => 
      userGroups.find(g => g.id === activeGroupId)?.accounts.some(a => a.id === account.id)
    )
  : userAccounts;
```

**Step 3: Reemplazar secciones por CollapsibleSection**

```tsx
<CollapsibleSection title="Mis Cuentas" sectionKey="accounts" defaultExpanded={false}>
  <AccountGroupsTabs 
    groups={userGroups} 
    activeGroup={activeGroupId}
    onGroupChange={setActiveGroupId}
  />
  {filteredAccounts.length === 0 ? (
    <div className="py-8 text-center text-slate-500">
      {activeGroupId ? 'No hay cuentas en este grupo' : 'No hay cuentas registradas'}
    </div>
  ) : (
    <AccountSortableList 
      accounts={filteredAccounts} 
      accountBalances={accountBalances} 
    />
  )}
</CollapsibleSection>

<CollapsibleSection title="Transacciones" sectionKey="transactions" defaultExpanded={false}>
  <TransactionList 
    transactions={userTransactions} 
    accounts={userAccounts}
    categories={userCategories}
  />
</CollapsibleSection>
```

---

## Tarea 7: EditGroupDialog (Opcional - puede ser parte de AccountGroupsTabs)

Este paso puede combinarse con la tarea 6 si agregamos un botón de edición al hacer click derecho en el tab del grupo.

---

## Tarea 8: Testing y Verificación

**Step 1: Verificar que el servidor corra sin errores**

Run: `npm run dev`
Expected: Server inicia en http://localhost:3000 sin errores en consola

**Step 2: Verificar base de datos**

Run: `npx drizzle-kit studio`
Expected: Verificar que existen las tablas account_groups y account_group_members

**Step 3: Probar flujo**
1. Crear grupo desde el botón "+"
2. Ver que aparece en las tabs
3. Ver que las cuentas se pueden filtrar por grupo

---

## Notas Adicionales

- No hay tests configurados actualmente
- Para agregar tests, considerar Jest o Vitest
- Revisar `npm run lint` antes de commit

---

## Estado de Implementación ✅ COMPLETADO

**Fecha de implementación:** 2026-02-27

Todas las tareas han sido completadas:

| Tarea | Estado |
|-------|--------|
| Tarea 1: Schema de Base de Datos | ✅ |
| Tarea 2: Server Actions | ✅ |
| Tarea 3: CollapsibleSection | ✅ |
| Tarea 4: AccountGroupsTabs + CreateGroupDialog | ✅ |
| Tarea 5: Integración en page.tsx | ✅ |
| Tarea 6: EditGroupDialog | ✅ |
| Tarea 7: Balance por Grupo | ✅ |
| Tarea 8: IncludeInTotal en Balance General | ✅ |
| Tarea 9: Dropdown grupos en CreateAccountDialog | ✅ |
| Tarea 10: Contador de transacciones en título | ✅ |

### Archivos creados/modificados:

**Nuevos:**
- `src/components/collapsible-section.tsx`
- `src/components/account-groups-manager.tsx`
- `src/components/account-groups-tabs.tsx`
- `src/components/create-group-dialog.tsx`
- `src/components/edit-group-dialog.tsx`
- `src/components/group-balance-card.tsx`

**Modificados:**
- `src/db/schema.ts`
- `src/app/actions.ts`
- `src/app/page.tsx`
- `src/components/create-account-dialog.tsx`
- `src/components/transaction-list.tsx`

**Migraciones:**
- `supabase/migrations/0003_material_maginty.sql`
