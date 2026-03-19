'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CategoryBarData {
  categoryId: number
  categoryName: string
  categoryIcon: string
  type: 'income' | 'expense'
  total: number
}

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
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const filteredData = data.filter(d => d.type === type)
  
  const chartData = filteredData.map(item => ({
    name: `${item.categoryIcon} ${item.categoryName}`,
    value: item.total,
  })).sort((a, b) => b.value - a.value)

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : 'white'
  const tooltipBorder = isDark ? '#475569' : '#e2e8f0'

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
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis 
          type="number" 
          tickFormatter={(value) => formatCurrency(value)}
          stroke={axisColor}
          fontSize={10}
          style={{ fill: axisColor }}
        />
        <YAxis 
          type="category"
          dataKey="name"
          stroke={axisColor}
          fontSize={10}
          width={100}
          style={{ fill: axisColor }}
        />
        <Tooltip
          formatter={(value) => formatCurrency(value as number)}
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: '8px',
            color: isDark ? '#f1f5f9' : '#1e293b',
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
