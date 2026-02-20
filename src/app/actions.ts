'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../utils/supabase/server'
import { cache } from 'react'
import { db } from '../db'
import { eq, and, desc } from 'drizzle-orm'
import { accounts, transactions, categories } from '../db/schema'

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
    // Obtener el máximo sortOrder actual para asignar el siguiente
    const existingAccounts = await db.query.accounts.findMany({
      where: eq(accounts.userId, user.id),
      orderBy: [desc(accounts.sortOrder)],
      limit: 1,
    })
    const nextSortOrder = existingAccounts.length > 0 && existingAccounts[0].sortOrder !== null 
      ? existingAccounts[0].sortOrder + 1 
      : 0

    await db.insert(accounts).values({
      userId: user.id,
      name: name,
      currency: currency,
      isCredit: isCredit,
      sortOrder: nextSortOrder,
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

// === TRANSACTION ACTIONS ===

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    const amount = Math.round(parseFloat(formData.get('amount') as string) * 100) // Convertir a centavos
    const transactionData = {
      userId: user.id,
      accountId: parseInt(formData.get('accountId') as string),
      categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null,
      amount,
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string),
      type: formData.get('type') as 'income' | 'expense' | 'transfer',
    }

    await db.insert(transactions).values(transactionData)
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creando transacción:', error)
    return { error: 'No se pudo crear la transacción' }
  }
}

export const getTransactions = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, user.id),
      with: {
        account: true,
        category: true,
      },
      orderBy: [desc(transactions.date)],
    })
    return userTransactions
  } catch (error) {
    console.error('Error obteniendo transacciones:', error)
    return []
  }
})

export async function updateTransaction(id: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    const amount = Math.round(parseFloat(formData.get('amount') as string) * 100)
    const updateData = {
      accountId: parseInt(formData.get('accountId') as string),
      categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null,
      amount,
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string),
      type: formData.get('type') as 'income' | 'expense' | 'transfer',
    }

    await db.update(transactions)
      .set(updateData)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error actualizando transacción:', error)
    return { error: 'No se pudo actualizar la transacción' }
  }
}

export async function deleteTransaction(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    await db.delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)))
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error eliminando transacción:', error)
    return { error: 'No se pudo eliminar la transacción' }
  }
}

// === CATEGORIES ACTIONS ===

export const getCategories = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const userCategories = await db.query.categories.findMany({
      where: eq(categories.userId, user.id),
      orderBy: [desc(categories.id)],
    })
    return userCategories
  } catch (error) {
    console.error('Error obteniendo categorías:', error)
    return []
  }
})

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  try {
    await db.insert(categories).values({
      userId: user.id,
      name: formData.get('name') as string,
      type: formData.get('type') as 'income' | 'expense',
      icon: formData.get('icon') as string || '📌',
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creando categoría:', error)
    return { error: 'No se pudo crear la categoría' }
  }
}

// === BALANCE FUNCTIONS ===

export const getAccountBalances = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  try {
    // Obtener todas las transacciones del usuario con sus cuentas
    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, user.id),
      with: {
        account: true,
      },
    })

    // Calcular balances por cuenta
    const balances: Record<number, { income: number; expense: number; net: number; currency: string }> = {}

    userTransactions.forEach(transaction => {
      const accountId = transaction.accountId
      const currency = transaction.account.currency

      if (!balances[accountId]) {
        balances[accountId] = { income: 0, expense: 0, net: 0, currency }
      }

      if (transaction.type === 'income') {
        balances[accountId].income += transaction.amount
        balances[accountId].net += transaction.amount
      } else if (transaction.type === 'expense') {
        balances[accountId].expense += transaction.amount
        balances[accountId].net -= transaction.amount
      }
      // Las transferencias no afectan el balance neto
    })

    return balances
  } catch (error) {
    console.error('Error obteniendo balances:', error)
    return {}
  }
})

export const updateAccountOrder = async (accountIds: number[], shouldRevalidate = true) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autenticado' }
  }

  try {
    for (let i = 0; i < accountIds.length; i++) {
      await db.update(accounts)
        .set({ sortOrder: i })
        .where(eq(accounts.id, accountIds[i]))
    }

    if (shouldRevalidate) {
      revalidatePath('/')
    }
    return { success: true }
  } catch (error) {
    console.error('Error actualizando orden:', error)
    return { error: 'No se pudo actualizar el orden' }
  }
}
