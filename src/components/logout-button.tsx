'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { useActionToast } from './use-action-toast'

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { showToast } = useActionToast()

  const handleLogout = async () => {
    setIsSubmitting(true)
    showToast('Cerrando sesión...', 'info', 3000)
    
    try {
      const response = await fetch('/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.ok) {
        showToast('Sesión cerrada exitosamente', 'success')
        setTimeout(() => {
          router.push('/login')
          router.refresh()
        }, 500)
      } else {
        throw new Error('Error al cerrar sesión')
      }
    } catch (error) {
      showToast('Error al cerrar sesión', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleLogout}
      disabled={isSubmitting}
      className="relative"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cerrando...
        </>
      ) : (
        'Cerrar Sesión'
      )}
    </Button>
  )
}