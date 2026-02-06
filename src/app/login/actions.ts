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
    // En un caso real, devolveríamos el error para mostrarlo en pantalla
    console.error('Error login:', error)
    return redirect('/login?error=Could not authenticate user')
  }

  // Si todo sale bien, refrescamos la caché y vamos al inicio
  revalidatePath('/', 'layout')
  redirect('/')
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
    return redirect('/login?error=Could not create user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}