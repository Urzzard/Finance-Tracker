'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../utils/supabase/server'
import { cache } from 'react'
import { db } from '../db'
import { eq, and, desc, gte, lte, sql, asc } from 'drizzle-orm'
import { accounts, transactions, categories, accountGroups, accountGroupMembers, monthlySummaries } from '../db/schema'

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
  
  // Grupos seleccionados (viene como array de strings)
  const groupIds = formData.getAll('groups').map(g => parseInt(g as string, 10)).filter(g => !isNaN(g))

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

    const newAccount = await db.insert(accounts).values({
      userId: user.id,
      name: name,
      currency: currency,
      isCredit: isCredit,
      sortOrder: nextSortOrder,
    }).returning({ id: accounts.id })

    const newAccountId = newAccount[0].id

    // Asignar la cuenta a los grupos seleccionados
    if (groupIds.length > 0) {
      const groupMembers = groupIds.map(groupId => ({
        groupId,
        accountId: newAccountId,
      }))
      await db.insert(accountGroupMembers).values(groupMembers)
    }

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

// === ACCOUNT GROUPS ACTIONS ===

export const getGroupsWithAccounts = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const groups = await db.query.accountGroups.findMany({
      where: eq(accountGroups.userId, user.id),
      with: {
        members: {
          with: {
            account: true,
          },
        },
      },
    })

    return groups.map(g => ({
      id: g.id,
      name: g.name,
      includeInTotal: g.includeInTotal,
      createdAt: g.createdAt,
      accounts: g.members.map(m => m.account),
    }))
  } catch (error) {
    console.error('Error obteniendo grupos:', error)
    return []
  }
})

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const name = formData.get('name') as string
  const includeInTotal = formData.get('includeInTotal') === 'on'

  if (!name?.trim()) {
    return { success: false, error: 'El nombre es requerido' }
  }

  try {
    await db.insert(accountGroups).values({
      userId: user.id,
      name: name.trim(),
      includeInTotal,
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creating group:', error)
    return { success: false, error: 'Error al crear grupo' }
  }
}

export async function updateGroup(groupId: number, data: { name?: string; includeInTotal?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  try {
    await db.update(accountGroups)
      .set(data)
      .where(and(eq(accountGroups.id, groupId), eq(accountGroups.userId, user.id)))
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating group:', error)
    return { success: false, error: 'Error al actualizar grupo' }
  }
}

export async function deleteGroup(groupId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  try {
    await db.delete(accountGroups)
      .where(and(eq(accountGroups.id, groupId), eq(accountGroups.userId, user.id)))
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting group:', error)
    return { success: false, error: 'Error al eliminar grupo' }
  }
}

export async function addAccountToGroup(groupId: number, accountId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  try {
    await db.insert(accountGroupMembers).values({ groupId, accountId })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error adding account to group:', error)
    return { success: false, error: 'Error al agregar cuenta al grupo' }
  }
}

export async function removeAccountFromGroup(groupId: number, accountId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  try {
    await db.delete(accountGroupMembers)
      .where(and(eq(accountGroupMembers.groupId, groupId), eq(accountGroupMembers.accountId, accountId)))
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error removing account from group:', error)
    return { success: false, error: 'Error al quitar cuenta del grupo' }
  }
}

// === MONTHLY SUMMARIES ACTIONS ===

export async function createMonthlySummary(year: number, month: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const existing = await db.query.monthlySummaries.findFirst({
    where: and(
      eq(monthlySummaries.userId, user.id),
      eq(monthlySummaries.year, year),
      eq(monthlySummaries.month, month)
    ),
  })

  if (existing) {
    return { success: false, error: 'Este mes ya fue cerrado' }
  }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, user.id),
  })

  const userGroups = await db.query.accountGroups.findMany({
    where: eq(accountGroups.userId, user.id),
    with: {
      members: {
        with: { account: true },
      },
    },
  })

  const result = await db.select({
    type: transactions.type,
    total: sql<number>`sum(${transactions.amount})`,
  })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, user.id),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(transactions.type)

  const income = result.find(r => r.type === 'income')?.total || 0
  const expense = result.find(r => r.type === 'expense')?.total || 0

  const balancesByAccount: Record<number, number> = {}
  for (const account of userAccounts) {
    const accountTransactions = await db.select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
      .from(transactions)
      .where(
        and(
          eq(transactions.accountId, account.id),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.type)

    let balance = 0
    for (const t of accountTransactions) {
      if (t.type === 'income' || t.type === 'transfer') {
        balance += t.total
      } else {
        balance -= t.total
      }
    }
    balancesByAccount[account.id] = balance
  }

  const balancesByGroup: Record<number, number> = {}
  for (const group of userGroups) {
    let groupBalance = 0
    for (const member of group.members) {
      groupBalance += balancesByAccount[member.account.id] || 0
    }
    balancesByGroup[group.id] = groupBalance
  }

  try {
    await db.insert(monthlySummaries).values({
      userId: user.id,
      year,
      month,
      totalIncome: income,
      totalExpense: expense,
      netSavings: income - expense,
      balancesByAccount,
      balancesByGroup,
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creating monthly summary:', error)
    return { success: false, error: 'Error al crear cierre mensual' }
  }
}

export const getMonthlySummaries = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    return await db.query.monthlySummaries.findMany({
      where: eq(monthlySummaries.userId, user.id),
      orderBy: [desc(monthlySummaries.year), desc(monthlySummaries.month)],
    })
  } catch (error) {
    console.error('Error getting monthly summaries:', error)
    return []
  }
})

export async function getMonthlySummary(year: number, month: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    return await db.query.monthlySummaries.findFirst({
      where: and(
        eq(monthlySummaries.userId, user.id),
        eq(monthlySummaries.year, year),
        eq(monthlySummaries.month, month)
      ),
    })
  } catch (error) {
    console.error('Error getting monthly summary:', error)
    return null
  }
}

export const getMonthsWithTransactions = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  try {
    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, user.id),
      orderBy: [asc(transactions.date)],
    })

    const monthsSet = new Set<string>()
    userTransactions.forEach(t => {
      const date = new Date(t.date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      monthsSet.add(key)
    })

    return Array.from(monthsSet).map(key => {
      const [year, month] = key.split('-').map(Number)
      return { year, month }
    })
  } catch (error) {
    console.error('Error getting months with transactions:', error)
    return []
  }
})

export async function getTransactionsByMonth(year: number, month: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  try {
    return await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, user.id),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      ),
      with: {
        account: true,
        category: true,
      },
      orderBy: [desc(transactions.date)],
    })
  } catch (error) {
    console.error('Error getting transactions by month:', error)
    return []
  }
}
