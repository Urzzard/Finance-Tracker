# Drag & Drop Accounts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir al usuario reordenar sus cuentas arrastrándolas, con persistencia del orden en la base de datos.

**Architecture:** Agregar campo `position` a la tabla accounts, usar @dnd-kit/sortable para UI, crear server action para guardar el orden.

**Tech Stack:** @dnd-kit/core, @dnd-kit/sortable, Drizzle ORM

---

## Task 1: Agregar campo position al schema

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Modificar schema**

Agregar campo `position` a la tabla accounts:

```typescript
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  currency: text('currency').default('PEN').notNull(),
  isCredit: boolean('is_credit').default(false),
  position: integer('position'), // NUEVO CAMPO
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## Task 2: Generar y ejecutar migración

**Files:**
- Run: `npx drizzle-kit generate`
- Run: `npx drizzle-kit push`

**Step 1: Generar migración**

```bash
npx drizzle-kit generate
```

**Step 2: Ejecutar push**

```bash
npx drizzle-kit push
```

---

## Task 3: Instalar @dnd-kit

**Files:**
- Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

---

## Task 4: Crear componente SortableAccount

**Files:**
- Create: `src/components/sortable-account.tsx`

**Step 1: Crear componente**

```typescript
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Account } from '@/db/schema'

interface SortableAccountProps {
  account: Account
  balance: { income: number; expense: number; net: number; currency: string } | undefined
  children: React.ReactNode
}

export function SortableAccount({ account, balance, children }: SortableAccountProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: account.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      {children}
    </div>
  )
}
```

---

## Task 5: Modificar page.tsx para usar Sortable

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Importar componentes de dnd-kit**

```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'
```

**Step 2: Agregar SortableAccount**

Importar el componente creado:

```typescript
import { SortableAccount } from '@/components/sortable-account'
```

**Step 3: Wrappear accounts con DndContext y SortableContext**

```typescript
// En el return del componente, wrappear el grid de cuentas:
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor)
)

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  if (over && active.id !== over.id) {
    // Aquí we'll call reorderAccounts
  }
}

// En el JSX:
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={userAccounts.map(a => a.id)} strategy={rectSortingStrategy}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {userAccounts.map((account) => (
        <SortableAccount key={account.id} account={account} balance={accountBalances[account.id]}>
          {/* Contenido existente de la card */}
        </SortableAccount>
      ))}
    </div>
  </SortableContext>
</DndContext>
```

---

## Task 6: Crear server action para reorder

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Agregar reorderAccounts action**

```typescript
export async function reorderAccounts(orderedIds: number[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    // Actualizar position para cada cuenta
    await Promise.all(
      orderedIds.map((id, index) => 
        db.update(accounts)
          .set({ position: index })
          .where(and(eq(accounts.id, id), eq(accounts.userId, user.id)))
      )
    )
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error reordenando:', error)
    return { error: 'No se pudo reordenar' }
  }
}
```

---

## Task 7: Conectar drag end con server action

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Modificar handleDragEnd**

```typescript
'use client'

import { reorderAccounts } from './actions'

async function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (over && active.id !== over.id) {
    const oldIndex = userAccounts.findIndex(a => a.id === active.id)
    const newIndex = userAccounts.findIndex(a => a.id === over.id)
    const newOrder = arrayMove(userAccounts, oldIndex, newIndex)
    const orderedIds = newOrder.map(a => a.id)
    await reorderAccounts(orderedIds)
  }
}
```

**Nota:** Para esto, la sección de cuentas necesita ser un Client Component separado, ya que no podemos usar server actions directamente en client-side event handlers del lado del servidor.

---

## Task 8: Crear AccountsGrid component (Client)

**Files:**
- Create: `src/components/accounts-grid.tsx`

**Step 1: Crear componente**

```typescript
'use client'

import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useTransition } from 'react'
import { SortableAccount } from './sortable-account'
import { reorderAccounts } from '@/app/actions'

interface AccountWithBalance {
  id: number
  name: string
  currency: string
  isCredit: boolean
  createdAt: Date
}

interface BalanceData {
  income: number
  expense: number
  net: number
  currency: string
}

interface AccountsGridProps {
  accounts: AccountWithBalance[]
  balances: Record<number, BalanceData>
  formatCurrency: (amount: number, currency: string) => string
  children: (account: AccountWithBalance, balance: BalanceData | undefined) => React.ReactNode
}

export function AccountsGrid({ accounts, balances, formatCurrency, children }: AccountsGridProps) {
  const [isPending, startTransition] = useTransition()
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = accounts.findIndex(a => a.id === active.id)
      const newIndex = accounts.findIndex(a => a.id === over.id)
      const newOrder = arrayMove(accounts, oldIndex, newIndex)
      const orderedIds = newOrder.map(a => a.id)
      
      startTransition(async () => {
        await reorderAccounts(orderedIds)
      })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={accounts.map(a => a.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <SortableAccount 
              key={account.id} 
              account={account} 
              balance={balances[account.id]}
            >
              {children(account, balances[account.id])}
            </SortableAccount>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

---

## Task 9: Actualizar page.tsx para usar AccountsGrid

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Reemplazar grid de cuentas**

Reemplazar todo el grid de cuentas con:

```typescript
import { AccountsGrid } from '@/components/accounts-grid'

// En el return, dentro de la sección de cuentas:
<AccountsGrid 
  accounts={userAccounts} 
  balances={accountBalances}
  formatCurrency={formatCurrency}
>
  {(account, balance) => (
    // Todo el contenido de la card de cuenta existente
  )}
</AccountsGrid>
```

---

## Task 10: Probar y verificar

**Step 1: Levantar proyecto**

```bash
npm run dev
```

**Step 2: Verificar en navegador**
- Crear 2+ cuentas
- Arrastrar una cuenta a nueva posición
- Recargar página y verificar que el orden persiste
