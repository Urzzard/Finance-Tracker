# Gestión de Categorías - Diseño

## Overview

Sistema de gestión de categorías accesible desde el formulario de transacciones.

## Acceso

- En el formulario de crear/editar transacción, al lado del dropdown de categorías hay un botón **"+"** que abre un diálogo de gestión de categorías.

## UI del Diálogo

### Lista de categorías existentes
- Cada fila muestra: icono + nombre + tipo (ingreso/gasto)
- Al hacer clic en una fila, se habilita edición inline
- Botón de eliminar (solo disponible si no tiene transacciones asociadas)

### Crear nueva categoría
- Campo de texto para nombre
- Selector de tipo (ingreso/gasto)
- Selector de icono (emoji)
- Botón "Guardar"

### Editar categoría
- Al hacer clic en una categoría existente, los campos se vuelven editables
- Botón "Guardar cambios"

### Eliminar categoría
- Si tiene transacciones asociadas → mensaje de advertencia, no se elimina
- Si no tiene transacciones → confirmar y eliminar

## Server Actions

| Acción | Descripción |
|--------|-------------|
| `createCategory` | ✅ Ya existe |
| `updateCategory(id, formData)` | Actualiza nombre, tipo e icono |
| `deleteCategory(id)` | Elimina categoría (solo si no tiene transacciones) |

## Validaciones

- Nombre requerido, máximo 50 caracteres
- Tipo requerido (income/expense)
- Icono opcional (default: 📌)
- No eliminar si tiene transacciones asociadas

## Componentes a crear

1. `CategoryManagerDialog` - Diálogo principal de gestión
2. `CategoryList` - Lista de categorías con edición inline
3. `CategoryForm` - Formulario para crear/editar

## Integración

- El botón "+" se agrega en `CreateTransactionDialog` y `TransactionList` (al editar)
- El diálogo se abre mediante estado local (useState)
- Al crear/editar/eliminar, se revalida el path para actualizar la lista
