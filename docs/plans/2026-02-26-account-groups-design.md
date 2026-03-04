# Account Groups - Diseño

**Fecha:** 2026-02-26  
**Feature:** Account Groups  
**Estado:** ✅ Implementado

---

## 1. Objetivos

Permitir a los usuarios agrupar cuentas para mejor organización financiera. Ejemplos de uso:
- "Dinero Real": Solo ahorros, CTS, efectivo (excluir tarjetas de crédito)
- "Inversiones": Cuentas de inversión
- "Gastos Mensuales": Cuentas para gastos fijos

## 2. Base de Datos

### Tabla: account_groups

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | serial | PK | Identificador único |
| userId | uuid | NOT NULL | Usuario propietario |
| name | text | NOT NULL | Nombre del grupo |
| includeInTotal | boolean | DEFAULT true | Incluir en balance total |
| createdAt | timestamp | DEFAULT now() | Fecha creación |

### Tabla: account_group_members (pivote)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| groupId | integer | FK → account_groups.id | Grupo |
| accountId | integer | FK → accounts.id | Cuenta |

**Relación:** Many-to-Many (una cuenta puede pertenecer a múltiples grupos)

## 3. UI/UX

### 3.1 Estructura de Secciones (Acordeón)

Cada sección principal es colapsable/expandible:
- **Balance General**: Siempre expandido por defecto
- **Mis Cuentas**: Expandido por defecto
- **Transacciones**: Expandido por defecto

El estado (expandido/colapsado) se guarda en localStorage.

### 3.2 Tabs de Grupos

Ubicación: Above "Mis Cuentas" section

```
[Todas] [Dinero Real] [Inversiones] [+]
```

- **"Todas"**: Muestra todas las cuentas
- **Grupos personalizados**: Filtra cuentas por grupo
- **"+"**: Abre diálogo para crear grupo
- **Botón editar (lápiz)**: Aparece al hacer hover sobre cada grupo

### 3.3 Balance por Grupo

Cuando un grupo está seleccionado, mostrar tarjeta de balance del grupo:
- Balance actual (suma de cuentas del grupo)
- Ingresos del mes
- Gastos del mes
- Net del período

### 3.4 Balance General

- Muestra suma de cuentas con `includeInTotal = true`
- Las cuentas sin grupo se incluyen por defecto
- Las cuentas en grupos con `includeInTotal = false` se excluyen

### 3.5 Contador de Transacciones

- El título de "Transacciones" muestra badge con el total de transacciones
- Incluye ingresos + gastos + transferencias

## 4. Componentes

### Nuevos componentes

| Componente | Tipo | Descripción | Estado |
|------------|------|-------------|--------|
| CollapsibleSection | Client | Wrapper para secciones acordeón | ✅ |
| AccountGroupsTabs | Client | Tabs de grupos + botón crear/editar | ✅ |
| CreateGroupDialog | Client | Modal crear grupo | ✅ |
| EditGroupDialog | Client | Modal editar grupo (nombre, includeInTotal, cuentas) | ✅ |
| GroupBalanceCard | Client | Tarjeta de balance del grupo | ✅ |

### Modificaciones existentes

| Componente | Cambio | Estado |
|------------|--------|--------|
| CreateAccountDialog | Agregar dropdown de grupos | ✅ |
| AccountSortableList | Integrar con filtro de tabs | ✅ |
| page.tsx | Integrar acordeón, tabs, contador de transacciones | ✅ |
| TransactionList | Modo embebido para usar dentro de CollapsibleSection | ✅ |

## 5. Server Actions

```typescript
// Crear grupo
createGroup(name: string, includeInTotal?: boolean): Promise<Group>

// Editar grupo
updateGroup(id: number, data: { name?: string, includeInTotal?: boolean }): Promise<Group>

// Eliminar grupo
deleteGroup(id: number): Promise<void>

// Agregar cuenta a grupo
addAccountToGroup(groupId: number, accountId: number): Promise<void>

// Quitar cuenta de grupo
removeAccountFromGroup(groupId: number, accountId: number): Promise<void>

// Obtener grupos con cuentas
getGroupsWithAccounts(): Promise<GroupWithAccounts[]>
```

## 6. Flujo de Usuario

### Crear grupo
1. Usuario hace click en "+" en tabs
2. Abre modal: nombre del grupo + checkbox "incluir en total"
3. Submit → server action → revalidatePath

### Asignar cuenta a grupo
- **Opción A**: Al crear cuenta, dropdown multi-select de grupos ✅
- **Opción B**: Editar grupo, agregar/quitar cuentas ✅

### Editar grupo
1. Click en botón de lápiz al hacer hover en el tab del grupo
2. Modal: nombre, checkbox, lista de cuentas (agregar/quitar)
3. Submit → server action → revalidatePath
4. Botón eliminar grupo disponible

## 7. Consideraciones

- Una cuenta puede pertenecer a múltiples grupos
- Eliminar grupo NO elimina cuentas, solo la asociación
- Balance General excluye cuentas con `includeInTotal = false`
- El filtro de tabs solo afecta "Mis Cuentas", no "Transacciones"
- El botón de acciones en el acordeón NO dispara el toggle (para evitar conflictos con modales)

## 8. Orden de Implementación

1. ✅ Schema de base de datos
2. ✅ Server actions
3. ✅ Componente CollapsibleSection
4. ✅ Componente AccountGroupsTabs + CreateGroupDialog
5. ✅ Integración en page.tsx (filtro de cuentas)
6. ✅ EditGroupDialog (agregar/quitar cuentas)
7. ✅ Balance por grupo
8. ✅ Integración en CreateAccountDialog

---

## Notas Adicionales

- Implementado: 2026-02-27
- El collapsible de Transacciones muestra contador de transacciones total
- Los modales no disparan el toggle del acordeón al interactuar con ellos
