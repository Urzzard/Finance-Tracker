'use client'

import { useToast } from './toast-provider'

export function useActionToast() {
  const { showToast } = useToast()

  const handleActionResult = (result: { success?: boolean; error?: string }, successMessage: string) => {
    if (result.success) {
      showToast(successMessage, 'success')
    } else {
      showToast(result.error || 'Error desconocido', 'error')
    }
  }

  return { handleActionResult, showToast }
}