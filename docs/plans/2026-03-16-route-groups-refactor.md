# Reestructuración de Rutas - Route Groups

> **Goal:** Separar rutas autenticadas de públicas usando Next.js Route Groups, eliminando el renderizado condicional del sidebar.

**Architecture:** Usar Route Groups `(auth)` y `(dashboard)` para que el sidebar solo exista en el layout de dashboard.

**Tech Stack:** Next.js 16 App Router, TypeScript

**IMPORTANTE:** Usar rutas relativas (`../`, `../../`) en lugar de path aliases (`@/`) para los imports de componentes, siguiendo las reglas del proyecto.

---

## Análisis Previo

### Estructura Actual
```
src/app/
├── layout.tsx              # Root + Sidebar + MainContent
├── page.tsx               # Dashboard (/)
├── actions.ts             # Server actions
├── globals.css
├── login/
│   ├── page.tsx           # Login/Registro
│   └── actions.ts
└── auth/
    └── signout/
        └── route.ts       # API route
```

### Imports Actuales (rutas relativas)

**src/app/page.tsx:**
```ts
import { createClient } from "../utils/supabase/server";
import("../components/create-transaction-dialog")
import("../components/transaction-list")
import("../components/profile-dropdown")
import("../components/account-groups-manager")
import("../components/collapsible-section")
import("../components/close-month-button")
import("../components/monthly-history")
import { db } from "../db";
import { getTransactions, ... } from "./actions";
```

**src/app/actions.ts:**
```ts
import { createClient } from '../utils/supabase/server'
import { db } from '../db'
import { accounts, transactions, ... } from '../db/schema'
```

**src/app/login/actions.ts:**
```ts
import { createClient } from "../../utils/supabase/server"
```

---

## Plan de Ejecución

### Paso 1: Crear nueva estructura de carpetas

**Acción:** Crear carpetas sin mover archivos todavía.

```bash
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(dashboard\)
```

### Paso 2: Crear Root Layout simplificado

**Archivo:** `src/app/layout.tsx` (sobrescribir)

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Controla tus gastos fácilmente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Paso 3: Crear Auth Layout (sin sidebar)

**Archivo:** `src/app/(auth)/layout.tsx` (crear)

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
```

### Paso 4: Crear Dashboard Layout (CON sidebar)

**Archivo:** `src/app/(dashboard)/layout.tsx` (crear)

```tsx
import { SidebarProvider } from "@/components/sidebar/sidebar-context";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle";
import { MainContent } from "@/components/sidebar/main-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarToggle />
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </SidebarProvider>
  );
}
```

### Paso 5: Mover y actualizar page.tsx

**Acción:** Mover `src/app/page.tsx` → `src/app/(dashboard)/page.tsx`

**Imports a actualizar (rutas relativas):**
```ts
// ANTES (en src/app/page.tsx):
import { createClient } from "../utils/supabase/server";
import("../components/create-transaction-dialog")
import { db } from "../db";
import { getTransactions, ... } from "./actions";

// DESPUÉS (en src/app/(dashboard)/page.tsx):
import { createClient } from "../../utils/supabase/server";
import("../../components/create-transaction-dialog")
import { db } from "../../db";
import { getTransactions, ... } from "./actions";  // <-- ESTE NO CAMBIA
```

### Paso 6: Mover y actualizar actions.ts

**Acción:** Mover `src/app/actions.ts` → `src/app/(dashboard)/actions.ts`

**Imports a actualizar (rutas relativas):**
```ts
// ANTES (en src/app/actions.ts):
import { createClient } from '../utils/supabase/server'
import { db } from '../db'
import { accounts, transactions, ... } from '../db/schema'

// DESPUÉS (en src/app/(dashboard)/actions.ts'):
import { createClient } from '../../utils/supabase/server'
import { db } from '../../db'
import { accounts, transactions, ... } from '../../db/schema'
```

### Paso 7: Mover y actualizar login/page.tsx

**Acción:** Mover `src/app/login/page.tsx` → `src/app/(auth)/login/page.tsx`

**Imports a actualizar (rutas relativas):**
```ts
// ANTES (en src/app/login/page.tsx):
import { useActionToast } from '../../components/use-action-toast'
import { login, signup } from './actions'

// DESPUÉS (en src/app/(auth)/login/page.tsx'):
import { useActionToast } from '../../../components/use-action-toast'
import { login, signup } from './actions'
```

### Paso 8: Mover y actualizar login/actions.ts

**Acción:** Mover `src/app/login/actions.ts` → `src/app/(auth)/login/actions.ts`

**Imports a actualizar (rutas relativas):**
```ts
// ANTES (en src/app/login/actions.ts):
import { createClient } from "../../utils/supabase/server"

// DESPUÉS (en src/app/(auth)/login/actions.ts'):
import { createClient } from "../../../utils/supabase/server"
```

### Paso 9: Mover auth/signout/route.ts

**Acción:** Mover `src/app/auth/signout/route.ts` → `src/app/(dashboard)/auth/signout/route.ts`

**Verificar imports:** No debería necesitar cambios (probablemente no tiene imports a archivos locales).

### Paso 10: Verificar que sidebar no tenga renderizado condicional

**Archivo:** `src/components/sidebar/sidebar.tsx`

Eliminar líneas 23-24:
```ts
const publicRoutes = ['/login', '/register']
if (publicRoutes.includes(pathname)) return null
```

**Nota:** Esto ya no es necesario porque el sidebar solo existe en el dashboard layout.

### Paso 11: Probar que todo funcione

**Verificar:**
1. `npm run build` - debe compilar sin errores
2. `/login` - debe verse sin sidebar ni márgenes
3. `/` - debe verse con sidebar
4. Theme toggle debe funcionar en ambas rutas
5. Probar login/logout completo

### Paso 12: Cleanup

Eliminar carpetas vacías si quedan:
- `src/app/login/` (queda vacía)
- `src/app/auth/` (si quedó vacía)

---

## Checklist de Verificación

| Paso | Verificación | Estado |
|------|-------------|--------|
| 1 | Carpetas creadas | ⬜ |
| 2 | Root layout simplificado | ⬜ |
| 3 | Auth layout sin sidebar | ⬜ |
| 4 | Dashboard layout con sidebar | ⬜ |
| 5 | page.tsx movido + imports actualizados | ⬜ |
| 6 | actions.ts movido + imports actualizados | ⬜ |
| 7 | login/page.tsx movido + imports actualizados | ⬜ |
| 8 | login/actions.ts movido + imports actualizados | ⬜ |
| 9 | auth/signout/route.ts movido | ⬜ |
| 10 | Sidebar condicional eliminado | ⬜ |
| 11 | Build exitoso | ⬜ |
| 12 | /login sin sidebar | ⬜ |
| 13 | / con sidebar | ⬜ |
| 14 | Theme toggle funciona | ⬜ |
| 15 | Cleanup completado | ⬜ |

---

## Notas Importantes

1. **Rutas Relativas:** Se usan para imports de componentes/utils/db. Los path aliases (`@/`) pueden causar problemas según las pruebas del usuario.

2. **Server Actions:** Located en `./actions` desde `page.tsx` en dashboard - se mantiene igual porque ambos archivos se mueven juntos.

3. **Auth Signout:** Se mueve a (dashboard) porque hace redirect a `/` que necesita el contexto del sidebar.

4. **Rutas futuras:** Si agregas `/register`, `/forgot-password`, etc., van en `(auth)/`.

5. **Verificación obligatoria:** Después de mover cada archivo, verificar que el build pase antes de continuar al siguiente.
