'use client'

import { PanelLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

const publicRoutes = ['/login', '/register']

export function SidebarToggle() {
  const pathname = usePathname()
  const { toggle, isMobile } = useSidebar()
  
  if (publicRoutes.includes(pathname)) return null

  // Solo visible en móvil
  if (!isMobile) return null
  
  return (
    <button
      onClick={toggle}
      className={cn(
        "fixed top-4 left-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-50",
        "bg-white dark:bg-slate-900 shadow-sm"
      )}
      aria-label="Abrir menú"
    >
      <PanelLeft className="w-5 h-5" />
    </button>
  )
}
