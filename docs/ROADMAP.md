# Finance Tracker - Roadmap

> **Last Updated:** 2026-03-20 (accounts, transactions, history completados)
> **Language:** Spanish (UI/Comments), English (for agents)

---

## Estado del Proyecto

### ✅ Completado

1. **Account Groups** - Grupos de cuentas
2. **Monthly Closing** - Cierres mensuales manuales
3. **Sidebar Navigation** - Navegación lateral
4. **Dashboard Charts** - Gráficos en dashboard
5. **/accounts** - Página completa de cuentas

---

## Estrategia de Implementación de Rutas

> **Nota:** Cada ruta se implementa en orden, moviendo/copiando componentes existentes del dashboard. El dashboard permanece igual hasta validar cada ruta completa.

**Flujo:**
1. Crear página `/ruta` con componentes copiados
2. Validar funcionalidad en navegador
3. Luego simplificar dashboard con links a rutas completas

---

## Rutas Pendientes

| # | Ruta | Plan | Estado |
|---|------|------|--------|
| 1 | `/accounts` | `2026-03-20-accounts-page-plan.md` | ✅ Completado |
| 2 | `/transactions` | `2026-03-20-transactions-page-plan.md` | ✅ Completado |
| 3 | `/history` | `2026-03-20-history-page-plan.md` | ✅ Completado |
| 4 | `/charts` | `2026-03-20-charts-page-plan.md` | Pendiente |
| 5 | `/profile` | `2026-03-20-profile-page-plan.md` | Pendiente |

---

## Pending Features

### 🔴 High Priority

#### 1. Dashboard Reorganizado (pendiente)

**Status:** Esperando validación de rutas

**Plan:** Crear versión simplificada del dashboard con links a rutas completas

**Estructura futura:**
- Balance General
- Gráficos (simplificados)
- Cards con links a rutas:
  - Cuentas → `/accounts`
  - Transacciones → `/transactions`
  - Historial → `/history`
  - Gráficos → `/charts`

---

### 🟡 Medium Priority

#### Cuentas (/accounts)

**Status:** Planificado

**Plan:** `docs/plans/2026-03-20-accounts-page-plan.md`

**Descripción:**
- Mover `AccountGroupsManager` a `/accounts`
- CRUD completo de cuentas y grupos
- Balances por cuenta
- Drag & drop para reordenar

---

#### Transacciones (/transactions)

**Status:** Planificado

**Plan:** `docs/plans/2026-03-20-transactions-page-plan.md`

**Descripción:**
- Mover `TransactionList` a `/transactions`
- Filtros: fecha, tipo, cuenta, categoría
- Búsqueda por descripción
- Paginación

---

#### Historial (/history)

**Status:** Planificado

**Plan:** `docs/plans/2026-03-20-history-page-plan.md`

**Descripción:**
- Mover `MonthlyHistory` a `/history`
- Vista de cierres mensuales
- Detalle de cada mes

---

#### Charts (/charts)

**Status:** Planificado

**Plan:** `docs/plans/2026-03-20-charts-page-plan.md`

**Descripción:**
- Gráficos completos: Pie, Bar, Line
- Filtros: período, cuentas
- Versión avanzada vs dashboard (simple)

**Dashboard Charts (mantiene):**
- Bar: Gastos por categoría
- Line: Evolución mensual

---

#### Perfil (/profile)

**Status:** Planificado

**Plan:** `docs/plans/2026-03-20-profile-page-plan.md`

**Descripción:**
- Información del usuario
- Configuraciones de la app
- Preferencias de UI

---

#### Monthly Budgets by Category

**Status:** Pendiente

**Descripción:**
- Límite de gasto por categoría
- Alertas al acercarse al límite

---

#### Savings Goals

**Status:** Pendiente

**Descripción:**
- Meta de ahorro mensual/anual
- Seguimiento de progreso

---

#### Recurring Transactions

**Status:** Pendiente

**Descripción:**
- Transacciones recurrentes automáticas
- Ejemplos: alquiler, Netflix, servicios

---

### 🟢 Low Priority

#### Data Export (CSV/PDF)

**Status:** Pendiente

**Descripción:**
- Exportar transacciones por período
- Exportar resúmenes mensuales

---

#### Excessive Spending Alerts

**Status:** Pendiente

**Descripción:**
- Notificaciones cuando gasto > X% vs mes anterior
- Alertas de categoría inusual

---

## Estructura de Rutas

```
/                    → Dashboard (actual, luego simplificado)
/login               → Login/Registro (✅ existe)
/accounts            → Gestión de cuentas (🔄 en progreso)
/transactions        → Lista de transacciones
/charts              → Gráficos completos
/history             → Historial de cierres
/profile             → Perfil del usuario
```

---

## Design Notes

- **Currency**: Amounts are stored in cents (integer) to avoid float errors
- **Transfers**: Do not affect net balance, only move money between accounts
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Language**: Spanish for UI, English for code/agents

---

## Plan Files

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| docs/plans/2026-03-11-sidebar-design.md | Diseño del Sidebar | ✅ |
| docs/plans/2026-03-11-sidebar-plan.md | Implementación del Sidebar | ✅ |
| docs/plans/2026-03-20-accounts-page-plan.md | Página /accounts | 🔄 |
| docs/plans/2026-03-20-transactions-page-plan.md | Página /transactions | 🔄 |
| docs/plans/2026-03-20-history-page-plan.md | Página /history | 🔄 |
| docs/plans/2026-03-20-charts-page-plan.md | Página /charts | 🔄 |
| docs/plans/2026-03-20-profile-page-plan.md | Página /profile | 🔄 |
| docs/plans/2026-02-26-account-groups-plan.md | Grupos de Cuentas | ✅ |

---

## Session Start Protocol (For Agents)

1. Check `docs/ROADMAP.md` for current status
2. Check `docs/plans/` for implementation plans
3. Review `AGENTS.md` for guidelines
4. If something is in progress, review the corresponding plan
5. **NEVER commit or push without user confirmation**
