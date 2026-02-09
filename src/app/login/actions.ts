'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from "../../utils/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extraemos los datos del formulario HTML
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Intentamos iniciar sesión
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error login:', error)
    let errorMessage = 'Credenciales incorrectas'
    
    if (error.message === 'Invalid login credentials') {
      errorMessage = 'Credenciales incorrectas'
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Por favor confirma tu correo electrónico'
    } else {
      errorMessage = 'Error al iniciar sesión'
    }
    
    return { success: false, error: errorMessage }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Intentamos crear el usuario
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Importante: Redirigir aquí después de confirmar email (si lo activas)
      emailRedirectTo: 'http://localhost:3000/auth/callback',
    },
  })

  if (error) {
    console.error('Error signup:', error)
    return { success: false, error: 'Error al crear cuenta' }
  }

  revalidatePath('/', 'layout')
  return { 
    success: true, 
    info: 'Te hemos enviado un correo. Si ya tienes una cuenta, encontrarás un enlace para iniciar sesión. Si eres nuevo, encontrarás un enlace para confirmar tu registro.' 
  }
}