'use client'

import { useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar()

  return (
    <main className={cn(
      "min-h-screen transition-all duration-300",
      // Mobile: sin margen (overlay)
      isMobile && "ml-0",
      // Tablet/Desktop: 70px collapsed, 250px expanded
      !isMobile && (isOpen ? "md:ml-[250px]" : "md:ml-[70px]")
    )}>
      {children}
    </main>
  )
}
