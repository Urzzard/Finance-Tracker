'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useActionToast } from '../../components/use-action-toast'
import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleActionResult, showToast } = useActionToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleLogin = async (formData: FormData) => {
    setIsSubmitting(true)
    showToast('Iniciando sesión...', 'info', 3000) // Mantiene visible hasta la redirección
    const result = await login(formData)
    if (result.success) {
      // No mostrar toast de éxito, mantener el de loading visible hasta la redirección
      router.push('/')
      showToast('¡Login exitoso!', 'success', 3000)
      setTimeout(() => {
        // Solo después de la redirección reseteamos el estado
        setIsSubmitting(false)
      }, 3000)
    } else {
      handleActionResult(result, 'Login exitoso')
      setIsSubmitting(false)
    }
  }

  const handleSignup = async (formData: FormData) => {
    setIsSubmitting(true)
    showToast('Creando cuenta...', 'info', 3000) // Mantiene visible hasta que se reemplace
    const result = await signup(formData)
    if (result.success && result.info) {
      showToast(result.info, 'info')
    } else {
      handleActionResult(result, 'Cuenta creada exitosamente')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Finance Tracker</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestiona tus finanzas personales</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm relative transition-all duration-300">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {mode === 'login' 
                ? 'Ingresa tus credenciales para acceder a tu cuenta' 
                : 'Regístrate para empezar a gestionar tus finanzas'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Correo electrónico
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  name="email" 
                  placeholder="correo@ejemplo.com" 
                  required 
                  className="h-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  name="password" 
                  required 
                  minLength={6}
                  className="h-11 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    const form = e.currentTarget.form
                    if (form) {
                      const formData = new FormData(form)
                      if (mode === 'login') {
                        handleLogin(formData)
                      } else {
                        handleSignup(formData)
                      }
                    }
                  }}
                  className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'login' ? 'Procesando...' : 'Creando...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="w-full h-11 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200"
                >
                  {mode === 'login' 
                    ? '¿No tienes cuenta? Regístrate' 
                    : '¿Ya tienes cuenta? Inicia sesión'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
          <p>Tus finanzas, organizadas y seguras</p>
        </div>
        
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginContent