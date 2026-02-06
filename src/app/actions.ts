'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../utils/supabase/server'
import { db } from '../db'
import { accounts } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Seguridad: Obtenemos el usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // Si no hay usuario, no hacemos nada

  // 2. Extraemos datos del formulario HTML
  const name = formData.get('name') as string
  const currency = formData.get('currency') as string || 'PEN'
  // El checkbox devuelve 'on' si está marcado, o null si no
  const isCredit = formData.get('isCredit') === 'on'

  // 3. Insertamos en la Base de Datos
  try {
    await db.insert(accounts).values({
      userId: user.id,
      name: name,
      currency: currency,
      isCredit: isCredit,
    })

    // 4. Recargamos la página para ver los cambios
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creando cuenta:', error)
    return { success: false }
  }
}

export async function updateAccount(id: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = formData.get('name') as string
  const currency = (formData.get('currency') as string) || 'PEN'
  const isCredit = formData.get('isCredit') === 'on'

  try {
    await db.update(accounts)
      .set({ name, currency, isCredit })
      .where(eq(accounts.id, id))

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar:', error)
    return { error: 'No se pudo actualizar la cuenta' }
  }
}


export async function deleteAccount(accountId: number){
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return

  try{
    await db.delete(accounts).where(eq(accounts.id, accountId))
    revalidatePath('/')
    return { success: true }
  }catch(error){
    console.error('Error al eliminar:', error)
    return { error: 'No se pudo eliminar la cuenta'}
  }
}