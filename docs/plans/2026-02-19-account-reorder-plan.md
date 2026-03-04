# Reordenamiento de Cuentas - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir al usuario reordenar sus cuentas arrastrándolas y persistir el nuevo orden en la base de datos.

**Architecture:** Agregar campo `position` a la tabla accounts, implementar drag & drop con @dnd-kit, guardar orden en servidor.

**Tech Stack:** @dnd-kit/core, @dnd-kit/sortable, Drizzle ORM

---

## Tareas

### Task 1: Agregar campo position al schema

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Agregar campo position**

Modificar la tabla accounts para agregar el campo position:

```typescript
// En src/db/schema.ts, línea 10-17
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  currency: text('currency').default('PEN').notNull(),
  isCredit: boolean('is_credit').default(false),
  position: integer('position').default(0), // <-- AGREGAR ESTA LÍNEA
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Step 2: Generar migración**

Run: `npx drizzle-kit generate`

**Step 3: Ejecutar migración**

Run: `npx drizzle-kit push`

---

### Task 2: Instalar @dnd-kit

**Files:**
- Modify: `package.json` (se modifica automáticamente)

**Step 1: Instalar dependencias**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

---

### Task 3: Crear componente AccountsGrid

**Files:**
- Create: `src/components/accounts-grid.tsx`

**Step 1: Crear componente con drag & drop**

```typescript
'use client'

import { useState } from 'react'
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
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Account {
  id: number
  name: string
  currency: string
  isCredit: boolean
  position: number
}

interface SortableAccountProps {
  account: Account
  children: React.ReactNode
}

function SortableAccount({ account, children }: SortableAccountProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

interface AccountsGridProps {
  accounts: Account[]
  children: (account: Account) => React.ReactNode
  onReorder: (accounts: Account[]) => void
}

export function AccountsGrid({ accounts, children, onReorder }: AccountsGridProps) {
  const [items, setItems] = useState(accounts)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        onReorder(newItems)
        return newItems
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((a) => a.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((account) => (
            <SortableAccount key={account.id} account={account}>
              {children(account)}
            </SortableAccount>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

---

### Task 4: Modificar page.tsx para usar AccountsGrid

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Importar AccountsGrid**

Agregar al inicio del archivo:

```typescript
const AccountsGrid = dynamic(() => 
  import("../components/accounts-grid").then(mod => mod.AccountsGrid)
);
```

**Step 2: Reemplazar el grid de cuentas**

En el código actual, buscar:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {userAccounts.map((account) => (
    // ... cuenta
  ))}
</div>
```

Reemplazar por:

```tsx
<AccountsGrid 
  accounts={userAccounts}
  onReorder={(reorderedAccounts) => {
    // Por ahora vacío, se implementará en Task 5
  }}
>
  {(account) => (
    <div className="group relative">
      <div className="relative bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-grab active:cursor-grabbing">
        {/* ... resto del contenido de la cuenta */}
      </div>
    </div>
  )}
</AccountsGrid>
```

Nota: Necesitarás mantener todo el contenido interno de la cuenta (nombre, balance, etc.) dentro del children.

---

### Task 5: Agregar server action para guardar orden

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Agregar función updateAccountsOrder**

Al final del archivo, agregar:

```typescript
export async function updateAccountsOrder(orderedAccounts: { id: number; position: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    for (const account of orderedAccounts) {
      await db.update(accounts)
        .set({ position: account.position })
        .where(and(eq(accounts.id, account.id), eq(accounts.userId, user.id)))
    }
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error guardando orden:', error)
    return { error: 'No se pudo guardar el orden' }
  }
}
```

---

### Task 6: Conectar onReorder con server action

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Importar updateAccountsOrder**

```typescript
import { getTransactions, getCategories, getAccountBalances, updateAccountsOrder } from "./actions";
```

**Step 2: Modificar AccountsGrid**

```tsx
<AccountsGrid 
  accounts={userAccounts}
  onReorder={async (reorderedAccounts) => {
    const orderData = reorderedAccounts.map((account, index) => ({
      id: account.id,
      position: index,
    }))
    await updateAccountsOrder(orderData)
  }}
>
```

---

### Task 7: Asignar position a cuentas existentes

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Modificar getAccountBalances para incluir position**

Opcional: Si las cuentas no tienen position, podemos asignarlas automáticamente la primera vez que se carguen. Agregar en el bloque de consulta:

```typescript
// Verificar si hay cuentas sin position y asignar
const accountsWithoutPosition = userAccounts.filter(a => !a.position || a.position === 0)
if (accountsWithoutPosition.length > 0) {
  for (const account of accountsWithoutPosition) {
    await db.update(accounts)
      .set({ position: account.id })
      .where(eq(accounts.id, account.id))
  }
}
```

Alternativamente, esto puede hacerse con una migración SQL directa:

```sql
UPDATE accounts SET position = id WHERE position IS NULL OR position = 0;
```

---

### Task 8: Probar y verificar

**Step 1: Verificar que el servidor esté corriendo**

Run: Abrir navegador en http://localhost:3000

**Step 2: Crear varias cuentas de prueba**

Crear al menos 3 cuentas para probar el reordenamiento.

**Step 3: Arrastrar cuentas**

Verificar que:
- El cursor cambia a "grab"
- La cuenta elevada se mueve con el mouse
- Al soltar, la posición cambia
- Al recargar la página, el orden se mantiene

---

## Notas Adicionales

- El cursor "grab" y "grabbing" se maneja con las clases de Tailwind `cursor-grab` y `active:cursor-grabbing`
- El orden se guarda automáticamente al soltar (onReorder)
- Las cuentas existentes sin position se asignarán con su ID como posición inicial
