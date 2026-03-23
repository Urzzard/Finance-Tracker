# Etapa 1: Página /accounts

> **Fecha:** 2026-03-20
> **Goal:** Crear página /accounts funcional idéntica al componente que existe en dashboard

---

## Análisis de Componentes Existentes

### Componentes relacionados con cuentas:
- `AccountGroupsManager` - Contenedor principal
- `AccountGroupsTabs` - Tabs de grupos
- `AccountSortableList` - Lista draggable de cuentas
- `GroupBalanceCard` - Card de balance por grupo
- `CreateAccountDialog` - Crear cuenta
- `AccountActions` - Menú de acciones (edit/delete)
- `CreateGroupDialog` - Crear grupo
- `EditGroupDialog` - Editar grupo

### Actions relacionadas:
- `createAccount`, `updateAccount`, `deleteAccount`
- `createGroup`, `updateGroup`, `deleteGroup`
- `addAccountToGroup`, `removeAccountFromGroup`

---

## Tareas

### Tarea 1: Crear estructura de archivos

**Archivos:**
- Create: `src/app/(dashboard)/accounts/page.tsx`
- Create: `src/components/accounts/accounts-view.tsx`

**Step 1: Crear page.tsx**

```tsx
import { db } from "../../../db";
import { getAccountBalances, getGroupsWithAccounts } from "../actions";
import { AccountsView } from "../../../components/accounts/accounts-view";

export default async function AccountsPage() {
  const userAccounts = await db.query.accounts.findMany({
    where: (accounts, { eq }) => eq(accounts.userId, user.id),
    orderBy: (accounts, { asc }) => [asc(accounts.sortOrder), asc(accounts.createdAt)],
  });

  const [accountBalances, userGroups] = await Promise.all([
    getAccountBalances(),
    getGroupsWithAccounts(),
  ]);

  return (
    <AccountsView
      accounts={userAccounts}
      groups={userGroups}
      accountBalances={accountBalances}
    />
  );
}
```

**Step 2: Crear AccountsView.tsx**

Copiar contenido de `AccountGroupsManager` y renombrar.

---

### Tarea 2: Mover/crear componentes en carpeta accounts

**Archivos a crear en `src/components/accounts/`:**
- `accounts-view.tsx` (copia de AccountGroupsManager)
- `account-groups-tabs.tsx` (copia del existente)
- `account-sortable-list.tsx` (copia del existente)
- `group-balance-card.tsx` (copia del existente)

**Archivos a copiar (mantener originales para dashboard):**
- `create-account-dialog.tsx` → `src/components/accounts/create-account-dialog.tsx`
- `create-group-dialog.tsx` → `src/components/accounts/create-group-dialog.tsx`
- `edit-group-dialog.tsx` → `src/components/accounts/edit-group-dialog.tsx`
- `account-actions.tsx` → `src/components/accounts/account-actions.tsx`

**Imports a actualizar en cada archivo copiado:**
- Cambiar imports de `'@/components/...'` a `'../...'` según ubicación

---

### Tarea 3: Actualizar imports de acciones

**Archivos:**
- Modify: `src/components/accounts/account-sortable-list.tsx`

Cambiar:
```ts
// ANTES
import { updateAccountOrder } from '../app/actions'

// DESPUÉS
import { updateAccountOrder } from '../../app/(dashboard)/actions'
```

---

### Tarea 4: Crear cuenta de usuario en page.tsx

**Archivo:** `src/app/(dashboard)/accounts/page.tsx`

Agregar lógica de autenticación similar a dashboard:
```tsx
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');
```

---

### Tarea 5: Actualizar ROADMAP

**Archivo:** `docs/ROADMAP.md`

Marcar `/accounts` como implementado.

---

### Tarea 6: Verificar en navegador

1. Navegar a `/accounts`
2. Verificar que muestra todas las cuentas
3. Crear una cuenta nueva
4. Editar una cuenta
5. Eliminar una cuenta
6. Crear/editar/eliminar grupo
7. Drag and drop para reordenar
8. Verificar filtros por grupo

---

## Resumen de Archivos

| Acción | Archivo |
|--------|---------|
| Create | `src/app/(dashboard)/accounts/page.tsx` |
| Create | `src/components/accounts/accounts-view.tsx` |
| Copy | `src/components/accounts/account-groups-tabs.tsx` |
| Copy | `src/components/accounts/account-sortable-list.tsx` |
| Copy | `src/components/accounts/group-balance-card.tsx` |
| Copy | `src/components/accounts/create-account-dialog.tsx` |
| Copy | `src/components/accounts/create-group-dialog.tsx` |
| Copy | `src/components/accounts/edit-group-dialog.tsx` |
| Copy | `src/components/accounts/account-actions.tsx` |
| Modify | `src/components/accounts/*/index.ts` (barrel exports) |

---

## Notas

- **Dashboard no se modifica** - Mantiene su `AccountGroupsManager` actual
- **Funcionalidad idéntica** - La página /accounts debe funcionar exactamente igual
- **Preservar originales** - Los componentes en `src/components/` raíz NO se eliminan hasta validar
