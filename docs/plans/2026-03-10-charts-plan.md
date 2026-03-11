# Gráficos - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar gráficos interactivos (pastel y línea) con filtros de período y cuentas

**Architecture:** Componentes React con Recharts, Server Actions para obtener datos, integración como sección colapsable en el dashboard

**Tech Stack:** Recharts, Next.js App Router, Drizzle ORM, Server Actions

---

### Task 1: Instalar Recharts

**Files:**
- Modify: `package.json` (se agrega dependencia)

**Step 1: Instalar la librería**

```bash
npm install recharts
```

**Step 2: Verificar instalación**

Run: `npm list recharts`
Expected: recharts@latest installed

---

### Task 2: Crear Server Action para datos de gráfico por categoría

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Agregar función para obtener datos del gráfico de pastel**

Agregar al final de `actions.ts`:

```typescript
interface CategoryChartData {
  categoryId: number
  categoryName: string
  categoryIcon: string
  type: 'income' | 'expense'
  total: number
  percentage: number
}

export async function getChartDataByCategory(
  years: number[],
  months: number[],
  accountIds?: number[]
): Promise<CategoryChartData[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const startDate = new Date(Math.min(...years), Math.min(...months) - 1, 1)
    const endDate = new Date(Math.max(...years), Math.max(...months), 0, 23, 59, 59)

    let query = db.select({
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
          lte(transactions.date, endDate),
          sql`${transactions.type} IN ('income', 'expense')`
        )
      )
      .groupBy(transactions.categoryId, categories.name, categories.icon, transactions.type)

    if (accountIds && accountIds.length > 0) {
      query = query.where(
        and(
          sql`${transactions.accountId} IN (${accountIds.join(',')})`
        )
      ) as typeof query
    }

    const result = await query

    // Calcular totales por tipo (income/expense)
    const incomeTotal = result.filter(r => r.type === 'income').reduce((sum, r) => sum + (r.total || 0), 0)
    const expenseTotal = result.filter(r => r.type === 'expense').reduce((sum, r) => sum + (r.total || 0), 0)

    return result.map(r => ({
      categoryId: r.categoryId || 0,
      categoryName: r.categoryName || 'Sin categoría',
      categoryIcon: r.categoryIcon || '📌',
      type: r.type as 'income' | 'expense',
      total: r.total || 0,
      percentage: r.type === 'income' 
        ? (incomeTotal > 0 ? Math.round((r.total || 0) / incomeTotal * 100) : 0)
        : (expenseTotal > 0 ? Math.round((r.total || 0) / expenseTotal * 100) : 0),
    }))
  } catch (error) {
    console.error('Error getting chart data by category:', error)
    return []
  }
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores nuevos

---

### Task 3: Crear Server Action para datos de gráfico mensual

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Agregar función para obtener datos del gráfico de línea**

```typescript
interface MonthlyChartData {
  year: number
  month: number
  monthName: string
  income: number
  expense: number
  net: number
}

export async function getChartDataMonthly(
  years: number[],
  months: number[],
  accountIds?: number[]
): Promise<MonthlyChartData[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    const startDate = new Date(Math.min(...years), Math.min(...months) - 1, 1)
    const endDate = new Date(Math.max(...years), Math.max(...months), 0, 23, 59, 59)

    let conditions = [
      eq(transactions.userId, user.id),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate),
    ] as any[]

    if (accountIds && accountIds.length > 0) {
      conditions.push(sql`${transactions.accountId} IN (${accountIds.join(',')})` as any)
    }

    const result = await db.select({
      year: sql<number>`extract(year from ${transactions.date})`,
      month: sql<number>`extract(month from ${transactions.date})`,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(
        sql`extract(year from ${transactions.date})`,
        sql`extract(month from ${transactions.date})`,
        transactions.type
      )

    // Agrupar por mes
    const monthlyData: Record<string, MonthlyChartData> = {}

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

    // Calcular net
    Object.values(monthlyData).forEach(m => {
      m.net = m.income - m.expense
    })

    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
  } catch (error) {
    console.error('Error getting monthly chart data:', error)
    return []
  }
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores nuevos

---

### Task 4: Crear componente PeriodSelector

**Files:**
- Create: `src/components/charts/period-selector.tsx`

**Step 1: Crear el componente**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface PeriodSelectorProps {
  onChange: (years: number[], months: number[]) => void
  defaultYears?: number[]
  defaultMonths?: number[]
}

const ALL_MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

export function PeriodSelector({ onChange, defaultYears, defaultMonths }: PeriodSelectorProps) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [years, setYears] = useState<number[]>(defaultYears || [currentYear])
  const [months, setMonths] = useState<number[]>(defaultMonths || [currentMonth])
  const [showYears, setShowYears] = useState(false)
  const [showMonths, setShowMonths] = useState(false)

  useEffect(() => {
    onChange(years, months)
  }, [years, months])

  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const toggleYear = (year: number) => {
    setYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    )
  }

  const toggleMonth = (month: number) => {
    setMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    )
  }

  return (
    <div className="flex flex-wrap gap-4 items-start">
      {/* Selector de Años */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowYears(!showYears); setShowMonths(false) }}
          className="min-w-[120px]"
        >
          {years.length === 1 ? years[0] : `${years.length} años`}
          {showYears ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
        {showYears && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-900 border rounded-lg shadow-lg z-10 min-w-[150px]">
            {availableYears.map(year => (
              <div key={year} className="flex items-center gap-2 p-1">
                <Checkbox
                  id={`year-${year}`}
                  checked={years.includes(year)}
                  onCheckedChange={() => toggleYear(year)}
                />
                <Label htmlFor={`year-${year}`} className="cursor-pointer">
                  {year}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selector de Meses */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowMonths(!showMonths); setShowYears(false) }}
          className="min-w-[120px]"
        >
          {months.length === 1 
            ? ALL_MONTHS.find(m => m.value === months[0])?.label
            : `${months.length} meses`
          }
          {showMonths ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
        {showMonths && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-900 border rounded-lg shadow-lg z-10 max-h-[300px] overflow-y-auto min-w-[150px]">
            {ALL_MONTHS.map(month => (
              <div key={month.value} className="flex items-center gap-2 p-1">
                <Checkbox
                  id={`month-${month.value}`}
                  checked={months.includes(month.value)}
                  onCheckedChange={() => toggleMonth(month.value)}
                />
                <Label htmlFor={`month-${month.value}`} className="cursor-pointer">
                  {month.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

### Task 5: Crear componente CategoryPieChart

**Files:**
- Create: `src/components/charts/category-pie-chart.tsx`

**Step 1: Crear el componente**

```typescript
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CategoryChartData } from '@/app/actions'

interface CategoryPieChartProps {
  data: CategoryChartData[]
  type: 'income' | 'expense'
}

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
]

export function CategoryPieChart({ data, type }: CategoryPieChartProps) {
  const filteredData = data.filter(d => d.type === type)
  
  const chartData = filteredData.map((item, index) => ({
    name: `${item.categoryIcon} ${item.categoryName}`,
    value: item.total,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length],
  }))

  const formatCurrency = (value: number) => {
    return `S/ ${(value / 100).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ percentage }) => `${percentage}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend
          formatter={(value) => {
            const item = chartData.find(d => d.name === value)
            return `${value} (${item?.percentage}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

---

### Task 6: Crear componente MonthlyLineChart

**Files:**
- Create: `src/components/charts/monthly-line-chart.tsx`

**Step 1: Crear el componente**

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MonthlyChartData } from '@/app/actions'

interface MonthlyLineChartProps {
  data: MonthlyChartData[]
}

const formatCurrency = (value: number) => {
  return `S/ ${(value / 100).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

export function MonthlyLineChart({ data }: MonthlyLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="monthName" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
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
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          name="Ingresos"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Gastos"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="net"
          name="Neto"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

### Task 7: Crear ChartsContainer y sección en el dashboard

**Files:**
- Create: `src/components/charts/charts-container.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Crear ChartsContainer**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getChartDataByCategory, getChartDataMonthly, CategoryChartData, MonthlyChartData } from '@/app/actions'
import { PeriodSelector } from './period-selector'
import { CategoryPieChart } from './category-pie-chart'
import { MonthlyLineChart } from './monthly-line-chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ChartsContainer() {
  const [years, setYears] = useState<number[]>([new Date().getFullYear()])
  const [months, setMonths] = useState<number[]>([new Date().getMonth() + 1])
  const [categoryData, setCategoryData] = useState<CategoryChartData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyChartData[]>([])
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [catData, monData] = await Promise.all([
        getChartDataByCategory(years, months),
        getChartDataMonthly(years, months),
      ])
      setCategoryData(catData)
      setMonthlyData(monData)
      setLoading(false)
    }
    fetchData()
  }, [years, months])

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <PeriodSelector 
          onChange={(y, m) => { setYears(y); setMonths(m) }}
          defaultYears={years}
          defaultMonths={months}
        />
      </div>

      {/* Tipo de gráfico pastel */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Mostrar:</span>
        <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'income' | 'expense')}>
          <TabsList>
            <TabsTrigger value="expense">Gastos</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          Cargando...
        </div>
      ) : (
        <>
          {/* Gráfico de Pastel */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border">
            <h3 className="text-lg font-semibold mb-4">
              Gastos por Categoría
            </h3>
            <CategoryPieChart data={categoryData} type={chartType} />
          </div>

          {/* Gráfico de Línea */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border">
            <h3 className="text-lg font-semibold mb-4">
              Evolución Mensual
            </h3>
            <MonthlyLineChart data={monthlyData} />
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Modificar page.tsx para agregar la sección de gráficos**

Agregar al imports:
```typescript
const ChartsContainer = dynamic(() =>
  import("../components/charts/charts-container").then(mod => mod.ChartsContainer)
)
```

Agregar antes del cierre del componente (después de MonthlyHistory):
```tsx
        {/* SECCIÓN DE GRÁFICOS */}
        <CollapsibleSection 
          title="Gráficos" 
          sectionKey="charts" 
          defaultExpanded={false}
          className="text-xs px-3 sm:text-sm sm:px-4"
        >
          <ChartsContainer />
        </CollapsibleSection>
```

**Step 3: Ejecutar lint**

Run: `npm run lint`
Expected: Sin errores

---

### Task 8: Verificar en el navegador

**Step 1: Probar la funcionalidad**

1. Abrir http://localhost:3000
2. Buscar la sección "Gráficos" colapsada
3. Expandirla y verificar que aparecen los gráficos
4. Probar el selector de período (años/meses)
5. Probar el toggle Ingresos/Gastos

**Step 2: Verificar errores en consola**

Run: Revisar consola del navegador
Expected: Sin errores críticos

---

### Task 9: Commit

**Step 1: Hacer commit**

```bash
git add src/app/actions.ts src/components/charts/ src/app/page.tsx package.json
git commit -m "feat: add charts (pie and line) with period selector"
```
