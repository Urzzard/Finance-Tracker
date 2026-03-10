# Gestión de Categorías - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Agregar sistema CRUD completo de categorías accesible desde el formulario de transacciones

**Architecture:** Crear server actions para update/delete, y componentes UI para gestión centralizada de categorías

**Tech Stack:** Next.js App Router, Drizzle ORM, shadcn/ui, Server Actions

**Estado:** ✅ COMPLETADO

---

### Task 1: Agregar Server Actions para updateCategory y deleteCategory ✅

**Files:**
- Modify: `src/app/actions.ts`

**Step 1: Agregar updateCategory y deleteCategory al archivo actions.ts**

Agregar al final del archivo (después de createCategory):

```typescript
export async function updateCategory(id: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const name = formData.get('name') as string
  const type = formData.get('type') as 'income' | 'expense'
  const icon = formData.get('icon') as string || '📌'

  if (!name?.trim()) {
    return { success: false, error: 'El nombre es requerido' }
  }

  try {
    await db.update(categories)
      .set({ name: name.trim(), type, icon })
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error actualizando categoría:', error)
    return { success: false, error: 'Error al actualizar categoría' }
  }
}

export async function deleteCategory(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  try {
    // Verificar si tiene transacciones asociadas
    const transactionsWithCategory = await db.query.transactions.findMany({
      where: and(eq(transactions.categoryId, id), eq(transactions.userId, user.id)),
      limit: 1,
    })

    if (transactionsWithCategory.length > 0) {
      return { success: false, error: 'No se puede eliminar una categoría con transacciones asociadas' }
    }

    await db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    return { success: false, error: 'Error al eliminar categoría' }
  }
}
```

**Step 2: Verificar que el código es válido**

Ejecutar: `npm run lint`

---

### Task 2: Crear componente CategoryManagerDialog ✅

### Task 3: Agregar botón de gestión de categorías al formulario de transacción ✅

### Task 4: Verificar que todo funciona ✅

### Task 5: Commit (pendiente - usuario lo realiza)

**Step 1: Hacer commit de los cambios**

```bash
git add src/app/actions.ts src/components/category-manager-dialog.tsx src/components/create-transaction-dialog.tsx
git commit -m "feat: add category management CRUD"
```
