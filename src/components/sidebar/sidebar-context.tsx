'use client'

import { createContext, useContext, useState, useEffect, useSyncExternalStore, ReactNode } from 'react'

interface SidebarContextType {
  isOpen: boolean
  isMobile: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

function getInitialOpenState(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('sidebar-open')
  if (stored !== null) return stored === 'true'
  return false
}

const openStateStore = {
  subscribe: (_callback: () => void) => {
    window.addEventListener('storage', _callback)
    return () => window.removeEventListener('storage', _callback)
  },
  getSnapshot: () => getInitialOpenState(),
  getServerSnapshot: () => false,
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isOpen = useSyncExternalStore(openStateStore.subscribe, openStateStore.getSnapshot, openStateStore.getServerSnapshot)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [, setForceUpdate] = useState(0)

  const open = () => {
    localStorage.setItem('sidebar-open', 'true')
    setForceUpdate(n => n + 1)
  }

  const close = () => {
    localStorage.setItem('sidebar-open', 'false')
    setForceUpdate(n => n + 1)
  }

  const toggle = () => {
    if (getInitialOpenState()) {
      close()
    } else {
      open()
    }
  }

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, open, close, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
