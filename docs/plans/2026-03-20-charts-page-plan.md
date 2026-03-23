# Etapa 4: Página /charts

> **Fecha:** 2026-03-20
> **Goal:** Crear página /charts con gráficos completos y avanzados

---

## Análisis de Componentes Existentes

### Componentes en dashboard:
- `DashboardCharts` - Gráficos simples (Bar + Line)
- `CategoryBarChart` - Bar chart por categoría
- `MonthlyLineChart` - Line chart mensual

### Componentes a crear:
- `PieChart` - Gráfico de pastel
- `ChartsFilters` - Filtros de período y cuentas
- `ChartsView` - Contenedor principal

---

## Gráficos a implementar

1. **Bar Chart (existente mejorado):**
   - Gastos/ingresos por categoría
   - Toggle ingreso/gasto

2. **Line Chart (existente mejorado):**
   - Evolución mensual completa
   - Serie: ingresos, gastos, neto

3. **Pie Chart (nuevo):**
   - Distribución de gastos por categoría
   - Breakdown mensual

---

## Filtros

1. **Período:**
   - Selector de mes/año
   - Rango de meses

2. **Cuentas:**
   - Todas o específicas

---

## Tareas

### Tarea 1: Crear estructura de archivos

**Archivos:**
- Create: `src/app/(dashboard)/charts/page.tsx`
- Create: `src/components/charts/charts-view.tsx`

---

### Tarea 2: Crear/completar componentes

**Archivos a crear:**
- `pie-chart.tsx`
- `charts-filters.tsx`
- `charts-view.tsx`

**Archivos existentes a copiar:**
- `category-bar-chart.tsx`
- `monthly-line-chart.tsx`
- `dashboard-charts.tsx`

---

### Tarea 3: Verificar en navegador

1. Navegar a `/charts`
2. Verificar los 3 tipos de gráficos
3. Probar filtros
4. Verificar datos coherentes

---

## Resumen de Archivos

| Acción | Archivo |
|--------|---------|
| Create | `src/app/(dashboard)/charts/page.tsx` |
| Create | `src/components/charts/charts-view.tsx` |
| Create | `src/components/charts/pie-chart.tsx` |
| Create | `src/components/charts/charts-filters.tsx` |
| Copy | `src/components/charts/category-bar-chart.tsx` |
| Copy | `src/components/charts/monthly-line-chart.tsx` |

---

## Notas

- **Dashboard mantiene versión simple** - `DashboardCharts` se queda como está
- **/charts es versión completa** - Más tipos de gráficos y filtros
