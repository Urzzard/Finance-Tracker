# Gráficos - Diseño

## Overview

Sistema de visualización de datos financieros con gráficos interactivos estilo BI.

## Requisitos

### Filtros

#### 1. Selector de Período (Año/Mes)
- **Año(s)**: Selector múltiple para elegir uno o más años
- **Mes(es)**: Selector múltiple para elegir meses dentro del año seleccionado
- **Dinámico**: El usuario puede seleccionar cualquier combinación

#### 2. Selector de Cuentas/Grupos
- **Global**: Todas las cuentas combinadas
- **Por Grupo**: Seleccionar grupo(s) de cuentas
- **Por Cuenta**: Seleccionar cuenta(s) específica(s)
- **Lógica**: "includeInTotal" - solo cuentas marcadas para incluir en balance
- **Selector múltiple**: Permite elegir varios grupos/cuentas a la vez

### Gráfico 1: Pastel por Categoría

**Propósito:** Ver cómo se distribuyen los ingresos/gastos por categoría en el período y filtro seleccionados.

**Datos a mostrar:**
- Porcentaje por categoría
- Monto absoluto por categoría
- Separación entre ingresos y gastos (dos gráficos o switch)

**UI:**
- Gráfico de dona/pastel interactivo
- Leyenda con categorías, iconos, montos y porcentajes
- Tooltip al pasar el mouse con detalles
- Filtro toggle: Ingresos / Gastos

### Gráfico 2: Línea Mensual

**Propósito:** Ver la tendencia de ingresos/gastos a lo largo del tiempo.

**Datos a mostrar:**
- Línea de ingresos por mes
- Línea de gastos por mes
- Línea de ahorro neto (ingresos - gastos)

**UI:**
- Gráfico de líneas multi-serie
- Eje X: meses del período seleccionado
- Eje Y: montos en la moneda del usuario
- Leyenda interactiva (click para mostrar/ocultar series)
- Tooltip con valores por mes

## Componentes a crear

1. **PeriodSelector** - Componente para seleccionar año(s) y mes(es)
2. **AccountGroupSelector** - Componente para seleccionar cuentas/grupos (Global/Grupo/Cuenta)
3. **CategoryPieChart** - Gráfico de pastel por categoría
4. **MonthlyLineChart** - Gráfico de línea mensual
5. **ChartsContainer** - Contenedor principal con ambos gráficos y filtros

## Server Actions necesarias

1. **getChartDataByCategory(years, months, accountIds?)** - Datos para gráfico de pastel
   - Retorna: { categoryId, categoryName, categoryIcon, type, total, percentage }

2. **getChartDataMonthly(years, months, accountIds?)** - Datos para gráfico de línea
   - Retorna: { year, month, income, expense, net }

## Biblioteca sugerida

Usar **Recharts** (compatible con React, fácil de usar, buena documentación)

```bash
npm install recharts
```

## Acceso

Nueva sección "Reportes" o "Gráficos" en el dashboard, como sección colapsable o página separada.

## Implementación por fases

### Fase 1: Gráfico de Pastel
- Selector de período (año/mes)
- Gráfico de dona por categoría
- Toggle Ingresos/Gastos
- Sin filtro de cuentas (global)

### Fase 2: Gráfico de Línea
- Mismos filtros de período
- Evolución mensual

### Fase 3: Filtro de Cuentas/Grupos
- Selector de cuentas/grupos
- Integración con ambos gráficos
