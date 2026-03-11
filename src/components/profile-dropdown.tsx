'use client'

import { useState } from 'react'
import { User, CreditCard } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from './logout-button'

interface ProfileDropdownProps {
  userEmail: string
  accountCount: number
}

export function ProfileDropdown({ userEmail, accountCount }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Extraer iniciales del email para el avatar
  const initials = userEmail
    .split('@')[0]
    .split('.')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {initials}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg"
      >
        {/* User Info Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                {userEmail}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {accountCount} cuenta{accountCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

        {/* Menu Items */}
        <div className="py-2">
          <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
            <User className="mr-3 h-4 w-4 text-slate-500" />
            <span className="text-slate-700 dark:text-slate-300">Configuración de perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
          
          <LogoutButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}