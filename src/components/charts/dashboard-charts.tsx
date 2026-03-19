'use client'

import { useState, useEffect, useMemo } from 'react'
import { getCategoryBarData, getMonthlyLineData } from '../../app/(dashboard)/actions'
import { CategoryBarChart } from './category-bar-chart'
import { MonthlyLineChart } from './monthly-line-chart'
import { Button } from '@/components/ui/button'

interface CategoryBarData {
  categoryId: number
  categoryName: string
  categoryIcon: string
  type: 'income' | 'expense'
  total: number
}

interface MonthlyLineData {
  year: number
  month: number
  monthName: string
  income: number
  expense: number
  net: number
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

export function DashboardCharts() {
  const [chartType, setChartType] = useState<'income' | 'expense'>('expense')
  const [categoryData, setCategoryData] = useState<CategoryBarData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyLineData[]>([])
  const [loading, setLoading] = useState(true)

  const monthsToShow = 6
  const { years, months, periodLabel } = useMemo(() => {
    const now = new Date()
    const result: number[] = []
    const yearsResult: number[] = []
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      if (!result.includes(month)) result.push(month)
      if (!yearsResult.includes(year)) yearsResult.push(year)
    }
    
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1)
    
    let label: string
    if (startDate.getFullYear() === endDate.getFullYear()) {
      label = `${MONTH_NAMES[startDate.getMonth()]} - ${MONTH_NAMES[endDate.getMonth()]} ${endDate.getFullYear()}`
    } else {
      label = `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear()} - ${MONTH_NAMES[endDate.getMonth()]} ${endDate.getFullYear()}`
    }
    
    return { years: yearsResult, months: result, periodLabel: label }
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

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">Gráficos</h2>
        </div>
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">({periodLabel})</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[200px] text-slate-500">
          Cargando gráficos...
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                {chartType === 'expense' ? 'Gastos' : 'Ingresos'} por Categoría
              </h3>
              <div className="flex gap-1 ml-auto">
                <Button
                  variant={chartType === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('expense')}
                  className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                >
                  Gastos
                </Button>
                <Button
                  variant={chartType === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('income')}
                  className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                >
                  Ingresos
                </Button>
              </div>
            </div>
            <CategoryBarChart data={categoryData} type={chartType} />
          </div>

          {/* Line Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Evolución Mensual
            </h3>
            <MonthlyLineChart data={monthlyData} />
          </div>
        </div>
      )}
    </div>
  )
}
