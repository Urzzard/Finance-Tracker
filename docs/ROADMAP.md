# Finance Tracker - Roadmap

> **Last Updated:** 2026-03-11
> **Language:** Spanish (UI/Comments), English (for agents)

---

## Estado del Proyecto

### ✅ Completado

1. **Account Groups** - Grupos de cuentas
2. **Monthly Closing** - Cierres mensuales manuales
3. **Correcciones de Errores** (2026-03-11):
   - Suspense boundary para useSearchParams
   - Fix setState en useEffect (useSyncExternalStore)
   - Fix Date.now() impuro (useRef)
   - Limpieza de variables sin usar
   - Build exitoso

---

## Pending Features

### 🔴 High Priority - Fase 1: Navigation & Dashboard

#### 1. Sidebar Navigation

**Status:** Planificado (docs/plans/2026-03-11-sidebar-plan.md)

**Descripción:**
- Sidebar izquierdo con comportamiento visible/oculto (overlay)
- No afecta dimensiones del contenido principal
- Breakpoints:
  - Mobile (<768px): Overlay, oculto por defecto
  - Tablet (768-1024px): Overlay, visible por defecto
  - Desktop (>1024px): Fijo, visible por defecto

**Rutas del menú:**
| Ruta | Label | Icono |
|------|-------|-------|
| / | Inicio | Home |
| /accounts | Cuentas | CreditCard |
| /transactions | Transacciones | ArrowLeftRight |
| /charts | Gráficos | BarChart3 |
| /history | Historial | CalendarDays |
| /profile | Perfil | User |

**Componentes:**
- `Sidebar` - Contenedor principal
- `SidebarItem` - Items de navegación
- `SidebarToggle` - Botón abrir/cerrar
- `SidebarProvider` - Estado global con localStorage

---

#### 2. Dashboard Reorganizado

**Status:** Pendiente de planificar

**Estructura nueva del Dashboard (/):**

| Sección | Contenido |
|---------|-----------|
| **Resumen** | Balance general (igual que ahora) |
| **Gráficos** | Bar (gastos por categoría) + Line (evolución mensual) |
| **Transacciones** | Lista de últimas 25 transacciones + link a página completa |
| **Cuentas** | Card simple: total, # cuentas + link a /accounts |
| **Historial** | Card simple: último cierre + link a /history |

---

### 🟡 Medium Priority

#### 3. Charts (Página completa)

**Status:** Planificado parcialmente (docs/plans/2026-03-10-charts-plan.md)

**Descripción:**
- Gráficos completos en página separada (/charts)
- Tipos: Pie, Bar, Line
- Filtros: Período, Cuentas
- Comparaciones mensuales

**Dashboard Charts (simplificado):**
- Bar: Gastos por categoría del período
- Line: Evolución mensual (ingresos vs gastos vs neto)

---

#### 4. Cuentas (/accounts)

**Status:** Pendiente

**Descripción:**
- Página completa de gestión de cuentas
- CRUD completo de cuentas
- Gestión de grupos
- Balances por cuenta

---

#### 5. Transacciones (/transactions)

**Status:** Pendiente

**Descripción:**
- Página completa de transacciones
- Filtros avanzados (fecha, categoría, cuenta, tipo)
- Paginación
- Exportación

---

#### 6. Historial (/history)

**Status:** Pendiente

**Descripción:**
- Página completa de cierres mensuales
- Comparaciones mes a mes
- Detalle de cada mes

---

#### 7. Perfil (/profile)

**Status:** Pendiente

**Descripción:**
- Gestión de perfil de usuario
- Configuraciones de la app
- Preferencias

---

#### 8. Monthly Budgets by Category

**Status:** Pendiente

**Descripción:**
- Límite de gasto por categoría
- Alertas al acercarse al límite

---

#### 9. Savings Goals

**Status:** Pendiente

**Descripción:**
- Meta de ahorro mensual/anual
- Seguimiento de progreso

---

#### 10. Recurring Transactions

**Status:** Pendiente

**Descripción:**
- Transacciones recurrentes automáticas
- Ejemplos: alquiler, Netflix, servicios

---

### 🟢 Low Priority

#### 11. Data Export (CSV/PDF)

**Status:** Pendiente

**Descripción:**
- Exportar transacciones por período
- Exportar resúmenes mensuales

---

#### 12. Excessive Spending Alerts

**Status:** Pendiente

**Descripción:**
- Notificaciones cuando gasto > X% vs mes anterior
- Alertas de categoría inusual

---

## Estructura de Rutas

```
/                    → Dashboard (resumen + gráficos + transacciones + cuentas + historial)
/login               → Login/Registro
/accounts            → Gestión de cuentas
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

| Archivo | Descripción |
|---------|-------------|
| docs/plans/2026-03-11-sidebar-design.md | Diseño del Sidebar |
| docs/plans/2026-03-11-sidebar-plan.md | Implementación del Sidebar |
| docs/plans/2026-03-10-charts-plan.md | Implementación de Gráficos |
| docs/plans/2026-03-10-charts-design.md | Diseño de Gráficos |
| docs/plans/2026-02-26-account-groups-plan.md | Grupos de Cuentas (completado) |

---

## Session Start Protocol (For Agents)

1. Check `docs/ROADMAP.md` for current status
2. Check `docs/plans/` for implementation plans
3. Review `AGENTS.md` for guidelines
4. If something is in progress, review the corresponding plan
5. **NEVER commit or push without user confirmation**
