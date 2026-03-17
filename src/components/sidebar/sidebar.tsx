'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CreditCard, ArrowLeftRight, BarChart3, CalendarDays, User, PanelLeftClose, PanelRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '../mod-toggle'
import { useSidebar } from './sidebar-context'

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/accounts', label: 'Cuentas', icon: CreditCard },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/charts', label: 'Gráficos', icon: BarChart3 },
  { href: '/history', label: 'Historial', icon: CalendarDays },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, isMobile, close, toggle } = useSidebar()

  const isExpanded = isMobile || isOpen

  return (
    <>
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={close}
        />
      )}
      
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out",
        // Mobile: overlay behavior
        isMobile && (isOpen ? "w-[250px] translate-x-0" : "w-[250px] -translate-x-full"),
        // Desktop: empuja el contenido
        !isMobile && (isOpen ? "w-[250px] translate-x-0" : "w-[70px]")
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
            <span className={cn(
              "font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap transition-opacity duration-200",
              isExpanded ? "opacity-100" : "opacity-0 hidden"
            )}>
              Finance Tracker
            </span>
            <button 
              onClick={toggle} 
              className={cn(
                "p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                !isExpanded && "mx-auto"
              )}
            >
              {isExpanded ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelRight className="w-5 h-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? close : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                    !isExpanded && "justify-center"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className={cn(
                    "whitespace-nowrap transition-opacity duration-200",
                    isExpanded ? "opacity-100" : "opacity-0 hidden"
                  )}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Footer con ModeToggle */}
          <div className={cn(
            "p-3 border-t border-slate-200 dark:border-slate-800",
            !isExpanded && "flex justify-center"
          )}>
            <ModeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
