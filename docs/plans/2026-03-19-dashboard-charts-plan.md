# Dashboard Charts - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Agregar sección de gráficos (Bar + Line) en el dashboard, entre Balance General y Cuentas.

**Architecture:** Componentes React Client con Recharts, Server Actions para datos, filtros simples (6 meses hacia atrás).

**Tech Stack:** Recharts, Next.js App Router, Drizzle ORM, Server Actions

---

## Overview

### Posición en Dashboard
```
1. Balance General ✅ (existe)
2. Gráficos 🆕 (se agrega aquí)
3. Cuentas ✅ (existe - AccountGroupsManager)
4. Transacciones ✅ (existe)
5. Historial ✅ (existe)
```

### Gráficos a mostrar
- **Bar Chart**: Gastos por categoría del período seleccionado
- **Line Chart**: Evolución mensual (ingresos vs gastos vs neto)

### Filtros
- Selector de período: mes actual + hasta 5 meses hacia atrás
- Toggle: Ingresos / Gastos (solo para Bar Chart)

---

## Task 1: Instalar Recharts

**Files:**
- Modify: `package.json`

**Step 1: Instalar la librería**

```bash
npm install recharts
```

**Step 2: Verificar instalación**

Run: `npm list recharts`
Expected: recharts@latest installed

---

## Task 2: Crear Server Actions para datos de gráficos

**Files:**
- Modify: `src/app/(dashboard)/actions.ts`

**Step 1: Agregar función para datos de Bar Chart (gastos por categoría)**

Agregar al final de `actions.ts`:

```typescript
interface CategoryBarData {
  categoryId: number
  categoryName: string
  categoryIcon: string
  type: 'income' | 'expense'
  total: number
}

export async function getCategoryBarData(
  years: number[],
  months: number[]
): Promise<CategoryBarData[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const startDate = new Date(Math.min(...years), Math.min(...months) - 1, 1)
    const endDate = new Date(Math.max(...years), Math.max(...months), 0, 23, 59, 59)

    const result = await db.select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, user.id),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.categoryId, categories.name, categories.icon, transactions.type)

    return result.map(r => ({
      categoryId: r.categoryId || 0,
      categoryName: r.categoryName || 'Sin categoría',
      categoryIcon: r.categoryIcon || '📌',
      type: r.type as 'income' | 'expense',
      total: r.total || 0,
    }))
  } catch (error) {
    console.error('Error getting category bar data:', error)
    return []
  }
}
```

**Step 2: Agregar función para datos de Line Chart (evolución mensual)**

Agregar después de la función anterior:

```typescript
interface MonthlyLineData {
  year: number
  month: number
  monthName: string
  income: number
  expense: number
  net: number
}

export async function getMonthlyLineData(
  years: number[],
  months: number[]
): Promise<MonthlyLineData[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    const startDate = new Date(Math.min(...years), Math.min(...months) - 1, 1)
    const endDate = new Date(Math.max(...years), Math.max(...months), 0, 23, 59, 59)

    const result = await db.select({
      year: sql<number>`extract(year from ${transactions.date})`,
      month: sql<number>`extract(month from ${transactions.date})`,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(
        sql`extract(year from ${transactions.date})`,
        sql`extract(month from ${transactions.date})`,
        transactions.type
      )

    const monthlyData: Record<string, MonthlyLineData> = {}

    result.forEach(r => {
      const year = Number(r.year)
      const month = Number(r.month)
      const key = `${year}-${month}`

      if (!monthlyData[key]) {
        monthlyData[key] = {
          year,
          month,
          monthName: monthNames[month - 1],
          income: 0,
          expense: 0,
          net: 0,
        }
      }

      if (r.type === 'income') {
        monthlyData[key].income = r.total || 0
      } else if (r.type === 'expense') {
        monthlyData[key].expense = r.total || 0
      }
    })

    Object.values(monthlyData).forEach(m => {
      m.net = m.income - m.expense
    })

    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
  } catch (error) {
    console.error('Error getting monthly line data:', error)
    return []
  }
}
```

**Step 3: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores nuevos

---

## Task 3: Crear componente CategoryBarChart

**Files:**
- Create: `src/components/charts/category-bar-chart.tsx`

**Step 1: Crear el componente**

```typescript
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CategoryBarData } from '@/app/(dashboard)/actions'

interface CategoryBarChartProps {
  data: CategoryBarData[]
  type: 'income' | 'expense'
}

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
}

const formatCurrency = (value: number) => {
  return `S/ ${(value / 100).toLocaleString('es-PE', { minimumFractionDigits: 0 })}`
}

export function CategoryBarChart({ data, type }: CategoryBarChartProps) {
  const filteredData = data.filter(d => d.type === type)
  
  const chartData = filteredData.map(item => ({
    name: `${item.categoryIcon} ${item.categoryName}`,
    value: item.total,
  })).sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-500 dark:text-slate-400">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          type="number" 
          tickFormatter={(value) => formatCurrency(value)}
          stroke="#64748b"
          fontSize={10}
        />
        <YAxis 
          type="category"
          dataKey="name"
          stroke="#64748b"
          fontSize={10}
          width={100}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="value" fill={COLORS[type]} radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[type]} fillOpacity={0.8 - (index * 0.1)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

## Task 4: Crear componente MonthlyLineChart

**Files:**
- Create: `src/components/charts/monthly-line-chart.tsx`

**Step 1: Crear el componente**

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MonthlyLineData } from '@/app/(dashboard)/actions'

interface MonthlyLineChartProps {
  data: MonthlyLineData[]
}

const formatCurrency = (value: number) => {
  return `S/ ${(value / 100).toLocaleString('es-PE', { minimumFractionDigits: 0 })}`
}

export function MonthlyLineChart({ data }: MonthlyLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-500 dark:text-slate-400">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="monthName" 
          stroke="#64748b"
          fontSize={11}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={10}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: 11 }}
        />
        <Line
          type="monotone"
          dataKey="income"
          name="Ingresos"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Gastos"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="net"
          name="Neto"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#3b82f6', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

## Task 5: Crear componente DashboardCharts (contenedor principal)

**Files:**
- Create: `src/components/charts/dashboard-charts.tsx`

**Step 1: Crear el componente**

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { getCategoryBarData, getMonthlyLineData, CategoryBarData, MonthlyLineData } from '@/app/(dashboard)/actions'
import { CategoryBarChart } from './category-bar-chart'
import { MonthlyLineChart } from './monthly-line-chart'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

export function DashboardCharts() {
  const now = new Date()
  const [chartType, setChartType] = useState<'income' | 'expense'>('expense')
  const [categoryData, setCategoryData] = useState<CategoryBarData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyLineData[]>([])
  const [loading, setLoading] = useState(true)

  const { years, months } = useMemo(() => {
    const monthsToShow = 6
    const result: number[] = []
    const yearsResult: number[] = []
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      if (!result.includes(month)) result.push(month)
      if (!yearsResult.includes(year)) yearsResult.push(year)
    }
    
    return { years: yearsResult, months: result }
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [catData, monData] = await Promise.all([
          getCategoryBarData(years, months),
          getMonthlyLineData(years, months),
        ])
        setCategoryData(catData)
        setMonthlyData(monData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [years, months])

  const periodLabel = useMemo(() => {
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1)
    
    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${MONTH_NAMES[startDate.getMonth()]} - ${MONTH_NAMES[endDate.getMonth()]} ${endDate.getFullYear()}`
    }
    return `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear()} - ${MONTH_NAMES[endDate.getMonth()]} ${endDate.getFullYear()}`
  }, [])

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Gráficos</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">({periodLabel})</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[200px] text-slate-500">
          Cargando gráficos...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {chartType === 'expense' ? 'Gastos' : 'Ingresos'} por Categoría
              </h3>
              <div className="flex gap-1">
                <Button
                  variant={chartType === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('expense')}
                  className="h-8 text-xs"
                >
                  Gastos
                </Button>
                <Button
                  variant={chartType === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('income')}
                  className="h-8 text-xs"
                >
                  Ingresos
                </Button>
              </div>
            </div>
            <CategoryBarChart data={categoryData} type={chartType} />
          </div>

          {/* Line Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Evolución Mensual
            </h3>
            <MonthlyLineChart data={monthlyData} />
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

## Task 6: Integrar DashboardCharts en page.tsx

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`

**Step 1: Agregar import dinámico**

Agregar después de los otros imports dinámicos:

```typescript
const DashboardCharts = dynamic(() =>
  import("../../components/charts/dashboard-charts").then(mod => mod.DashboardCharts)
)
```

**Step 2: Agregar la sección en el dashboard**

Agregar DESPUÉS del bloque de Balance General y ANTES de AccountGroupsManager:

```tsx
{/* SECCIÓN DE GRÁFICOS */}
<DashboardCharts />

<AccountGroupsManager 
  accounts={userAccounts}
  groups={userGroups}
  accountBalances={accountBalances}
/>
```

**Step 3: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

## Task 7: Verificar en el navegador

**Step 1: Probar la funcionalidad**

1. Asegurarse que el servidor de desarrollo está corriendo
2. Abrir http://localhost:3000
3. Verificar que la sección "Gráficos" aparece después de "Balance General"
4. Verificar que ambos gráficos (Bar y Line) se muestran
5. Probar el toggle Ingresos/Gastos
6. Verificar que los datos son coherentes con las transacciones

**Step 2: Verificar en consola**

Run: Revisar consola del navegador
Expected: Sin errores críticos

---

## Task 8: Commit

**Step 1: Sugerir commit**

Suggested command:
```bash
git add src/app/\(dashboard\)/actions.ts src/components/charts/ src/app/\(dashboard\)/page.tsx package.json
git commit -m "feat: add dashboard charts (bar and line)"
```

**User executes the commit command.**

---

## Resumen de Archivos

| Acción | Archivo |
|--------|---------|
| Modify | `package.json` |
| Modify | `src/app/(dashboard)/actions.ts` |
| Create | `src/components/charts/category-bar-chart.tsx` |
| Create | `src/components/charts/monthly-line-chart.tsx` |
| Create | `src/components/charts/dashboard-charts.tsx` |
| Modify | `src/app/(dashboard)/page.tsx` |

---

## Notas

- Los gráficos muestran datos de los últimos 6 meses
- Bar Chart muestra los gastos/ingresos por categoría ordenados de mayor a menor
- Line Chart muestra la evolución mensual con 3 series: Ingresos, Gastos, Neto
- No requiere filtros complejos (a diferencia de la página /charts completa)
- Los datos se cargan una sola vez al montar el componente
