'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MonthlyLineData {
  year: number
  month: number
  monthName: string
  income: number
  expense: number
  net: number
}

interface MonthlyLineChartProps {
  data: MonthlyLineData[]
}

const formatCurrency = (value: number) => {
  return `S/ ${(value / 100).toLocaleString('es-PE', { minimumFractionDigits: 0 })}`
}

export function MonthlyLineChart({ data }: MonthlyLineChartProps) {
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

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : 'white'
  const tooltipBorder = isDark ? '#475569' : '#e2e8f0'

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
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis 
          dataKey="monthName" 
          stroke={axisColor}
          fontSize={11}
          style={{ fill: axisColor }}
        />
        <YAxis 
          stroke={axisColor}
          fontSize={10}
          tickFormatter={(value) => formatCurrency(value)}
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
        <Legend 
          wrapperStyle={{ fontSize: 11, color: axisColor }}
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
