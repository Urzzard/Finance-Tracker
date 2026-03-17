# Sidebar - Plan de Implementación (v2)

> **Versión:** 2.0 (Actualizada)
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **IMPORTANT:** Each task requires user review before proceeding to the next one. Follow this flow:
> 1. Execute the code → 2. Run lint → 3. Show result to user → 4. Wait for user approval

**Goal:** Crear sidebar de navegación colapsable para desktop y overlay para mobile. Solo visible cuando el usuario está logueado.

**Architecture:**
- Desktop: Sidebar colapsable con botón toggle, no fijo visible
- Mobile: Overlay (comportamiento actual)
- Solo visible en rutas autenticadas (no en login/register/landing)
- Persistencia de estado en localStorage

**Tech Stack:** Next.js App Router, React hooks, Tailwind CSS, localStorage

---

### Task 1: Crear componente Sidebar

**Files:**
- Create: `src/components/sidebar/sidebar.tsx`

**Breakpoints actualizados:**
- Mobile (<768px): Overlay con bg-black/50, oculto por defecto
- Desktop (≥768px): Sidebar superpuesto (no ocupa espacio del main), oculto por defecto, siempre con botón toggle

**Step 1: Crear el componente base**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CreditCard, ArrowLeftRight, BarChart3, CalendarDays, User, Moon, Sun, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/accounts', label: 'Cuentas', icon: CreditCard },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/charts', label: 'Gráficos', icon: BarChart3 },
  { href: '/history', label: 'Historial', icon: CalendarDays },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <>
      {/* Overlay - solo en móvil */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-[250px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        // Desktop: siempre superpuesto, nunca fijo visible
        "md:translate-x-0 md:bg-white/95 md:dark:bg-slate-900/95 md:backdrop-blur-sm"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Finance Tracker
            </span>
            <button onClick={onClose} className="md:hidden p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

### Task 2: Crear SidebarToggle (botón abrir)

**Files:**
- Create: `src/components/sidebar/sidebar-toggle.tsx`

**Note:** El botón toggle debe estar SIEMPRE visible (tanto en mobile como desktop), ya que el sidebar está oculto por defecto.

**Step 1: Crear el componente**

```typescript
'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './sidebar-context'

export function SidebarToggle() {
  const { toggle, isOpen } = useSidebar()
  
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

### Task 3: Crear SidebarProvider (estado global)

**Files:**
- Create: `src/components/sidebar/sidebar-context.tsx`

**Note:** El sidebar inicia CERRADO (isOpen: false) por defecto. El usuario debe hacer click para abrirlo.

**Step 1: Crear contexto y provider**

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isOpen: boolean
  isMobile: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const stored = localStorage.getItem('sidebar-open')
    if (stored !== null) {
      setIsOpen(stored === 'true')
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const open = () => {
    setIsOpen(true)
    localStorage.setItem('sidebar-open', 'true')
  }

  const close = () => {
    setIsOpen(false)
    localStorage.setItem('sidebar-open', 'false')
  }

  const toggle = () => {
    if (isOpen) close() else open()
  }

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, open, close, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

### Task 4: Instalar next-themes (si no existe)

**Files:**
- Modify: `package.json`

**Step 1: Verificar si está instalado**

Run: `npm list next-themes`
Expected: Si no existe, proceder a instalar

**Step 2: Instalar si es necesario**

```bash
npm install next-themes
```

---

### Task 5: Modificar layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

**Note:** El sidebar se muestra solo cuando el usuario está autenticado. Esto se determina verificando si la ruta actual NO es pública (login, register, landing).

**Step 1: Leer layout actual**

Run: Read `src/app/layout.tsx`
Expected: Contenido del layout

**Step 2: Agregar providers y sidebar**

El Sidebar y Toggle deben estar visibles en todas las rutas (el toggle siempre, el sidebar se renderiza pero puede estar oculto según el estado).

```typescript
<body className="min-h-screen bg-slate-50 dark:bg-slate-950">
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <SidebarProvider>
      <SidebarToggle />
      <Sidebar />
      <main className="min-h-screen">
        {children}
      </main>
    </SidebarProvider>
  </ThemeProvider>
</body>
```

**Step 3: Agregar imports necesarios**

```typescript
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/sidebar/sidebar-context'
import { Sidebar } from '@/components/sidebar/sidebar'
import { SidebarToggle } from '@/components/sidebar/sidebar-toggle'
```

**Step 4: Actualizar SidebarToggle (mostrar solo cuando autenticado)**

El SidebarToggle debe ocultarse en rutas públicas. Esto se maneja en el componente mismo usando usePathname.

```typescript
// En sidebar-toggle.tsx
'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar-context'

const publicRoutes = ['/login', '/register', '/']

export function SidebarToggle() {
  const pathname = usePathname()
  const { toggle, isOpen } = useSidebar()
  
  const isPublicRoute = publicRoutes.includes(pathname)
  
  if (isPublicRoute) return null
  
  return (
    <button
      onClick={toggle}
      className="fixed top-4 left-4 z-30 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
    >
      <Menu className="w-5 h-5" />
    </button>
  )
}
```

**Step 5: Actualizar Sidebar (mostrar solo cuando autenticado)**

El Sidebar debe ocultarse en rutas públicas.

```typescript
// En sidebar.tsx - agregar al inicio del componente
// Rutas que NO requieren sidebar (públicas)
const publicRoutes = ['/login', '/register']

// Nota: "/" (home) puede ser landing (sin auth) o dashboard (con auth)
// Se maneja automáticamente: si no hay usuario, no se muestra sidebar
const isPublicRoute = publicRoutes.includes(pathname)

if (isPublicRoute) return null
```

**Nota importante:** La lógica completa de autenticación se implementa verificando el usuario con Supabase. Cuando no hay usuario logueado, el sidebar no se muestra.

**Step 6: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

### Task 6: Ajustar page.tsx para nuevo layout

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Remover componentes que se mudan al sidebar**

- Eliminar `ModeToggle` del import
- Verificar que no haya otros componentes de header

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

### Task 7: Verificar en navegador

**Step 1: Probar funcionalidad**

1. Abrir http://localhost:3000
2. Verificar sidebar visible en desktop
3. Click en botón hamburguesa en móvil → debe abrir overlay
4. Click en rutas → debe navegar y cerrar sidebar en móvil
5. Toggle modo dark debe funcionar

**Step 2: Verificar errores**

Run: Revisar consola del navegador
Expected: Sin errores críticos
