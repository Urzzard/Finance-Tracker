# Corrección de Errores y Warnings - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corregir errores críticos, warnings y variables sin usar sin afectar funcionalidad existente.

**Architecture:** Correcciones incrementales paso a paso, verificando con lint y build después de cada tarea.

**Tech Stack:** ESLint, TypeScript, Next.js

---

### Task 1: Corregir uso de useSearchParams en /login

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Leer el archivo completo**

Run: Read `src/app/login/page.tsx`
Expected: Contenido del archivo

**Step 2: Agregar Suspense boundary**

Reemplazar la última línea del archivo:
```tsx
export default LoginContent
```

Con:
```tsx
import { Suspense } from 'react'

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="animate-pulse text-slate-500">Cargando...</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}
```

**Step 3: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores de useSearchParams

---

### Task 2: Limpiar imports no usados en /login

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/login/actions.ts`

**Step 1: En page.tsx, eliminar línea 3**

Cambiar:
```typescript
import { useEffect, useState } from 'react'
```

A:
```typescript
import { useState } from 'react'
```

**Step 2: En page.tsx, eliminar variable no usada (línea 20)**

Cambiar:
```typescript
const searchParams = useSearchParams()
const router = useRouter()
```

A:
```typescript
// searchParams disponible si se necesita en futuro paraOAuth
useSearchParams()
const router = useRouter()
```

**Step 3: En actions.ts, eliminar import no usado (línea 4)**

Cambiar:
```typescript
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
```

A:
```typescript
import { createClient } from "@/utils/supabase/server"
```

**Step 4: Ejecutar lint**

Run: `npm run lint`
Expected: Sin warnings de login

---

### Task 3: Corregir setState en useEffect de CollapsibleSection

**Files:**
- Modify: `src/components/collapsible-section.tsx`

**Step 1: Modificar initialization**

Cambiar líneas 26-35:
```typescript
const [isExpanded, setIsExpanded] = useState(defaultExpanded);
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  const stored = localStorage.getItem(`section_${sectionKey}`);
  if (stored !== null) {
    setIsExpanded(stored === 'true');
  }
}, [sectionKey]);
```

A:
```typescript
const [mounted, setMounted] = useState(() => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(`section_${sectionKey}`);
  return stored !== null ? stored === 'true' : defaultExpanded;
});
const [isExpanded, setIsExpanded] = useState(mounted);

useEffect(() => {
  const stored = localStorage.getItem(`section_${sectionKey}`);
  if (stored !== null) {
    setIsExpanded(stored === 'true');
  }
}, [sectionKey]);
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores de setState en effect

---

### Task 4: Corregir función impura en ToastProvider

**Files:**
- Modify: `src/components/toast-provider.tsx`

**Step 1: Agregar useRef para ID único**

Cambiar líneas 31-45:
```typescript
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) => {
    const id = Date.now().toString()
    const newToast = { id, message, type, duration }
```

A:
```typescript
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = React.useRef(0)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) => {
    toastIdRef.current += 1
    const id = `toast-${toastIdRef.current}`
    const newToast = { id, message, type, duration }
```

**Step 2: Agregar import de React**

Cambiar línea 3:
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
```

**Step 3: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores de Date.now()

---

### Task 5: Corregir entidades sin escapar

**Files:**
- Modify: `src/components/transaction-actions.tsx`

**Step 1: Leer contexto de la línea**

Run: Read `src/components/transaction-actions.tsx` líneas 250-260
Expected: Ver contexto del error

**Step 2: Corregir comillas**

Cambiar línea 256:
```tsx
Esta acción eliminará permanentemente la transacción "<strong>{transaction.description}</strong>" 
```

A:
```tsx
Esta acción eliminará permanentemente la transacción &quot;<strong>{transaction.description}</strong>&quot;
```

**Step 3: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores de entidades

---

### Task 6: Limpiar variables sin usar

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/account-draggable-list.tsx`
- Modify: `src/components/logout-button.tsx`
- Modify: `src/components/profile-dropdown.tsx`
- Modify: `src/db/schema.ts`
- Modify: `middleware.ts`
- Modify: `tailwind.config.ts`

**Step 1: page.tsx - eliminar imports no usados**

Cambiar líneas 7, 19, 36, 96:
```typescript
// Línea 7: Eliminar
import { CreateAccountDialog } from "@/components/create-account-dialog"

// Línea 19: Eliminar  
import { AccountSortableList } from "@/components/account-draggable-list"

// Línea 36: Eliminar
const accounts = await db.query.accounts.findMany({

// Línea 96: Eliminar
const canCloseNow =
```

**Step 2: account-draggable-list.tsx - línea 142**

Cambiar:
```typescript
const { isDragging, isPending } = useSortable({
```

A:
```typescript
const { isDragging } = useSortable({
```

**Step 3: logout-button.tsx - línea 35**

Cambiar:
```typescript
} catch (error) {
  console.error('Error en logout:', error)
```

A:
```typescript
} catch (err) {
  console.error('Error en logout:', err)
```

**Step 4: profile-dropdown.tsx - línea 4**

Cambiar:
```typescript
import { LogOut, User, Settings } from 'lucide-react'
```

A:
```typescript
import { User, Settings } from 'lucide-react'
```

**Step 5: schema.ts - línea 114**

Cambiar:
```typescript
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
```

A:
```typescript
export const transactionsRelations = relations(transactions, ({ one }) => ({
```

**Step 6: middleware.ts - línea 18**

Cambiar:
```typescript
export function middleware(request: NextRequest, options: NextRequest) {
```

A:
```typescript
export function middleware(request: NextRequest) {
```

**Step 7: tailwind.config.ts - línea 83**

Leer línea 83 para ver el contexto, luego corregir el require() a import.

**Step 8: Ejecutar lint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings

---

### Task 7: Verificar build

**Step 1: Ejecutar build**

Run: `npm run build`
Expected: Build exitoso sin errores

---

### Task 8: Commit final

**Step 1: Hacer commit**

```bash
git add -A
git commit -m "fix: correct lint errors and build issues"
```

