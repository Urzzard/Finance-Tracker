# Diseño: Reordenamiento Drag & Drop de Cuentas

## Fecha: 2026-02-19

## Objetivo
Permitir al usuario organizar sus cuentas arrastrándolas a la posición deseada, con persistencia del orden en la base de datos.

## Decisiones de Diseño

### UX/UI
- **Cursor grab** en hover para indicar que la cuenta es arrastrable
- **Elevación visual** de la cuenta arrastrada (shadow + escala)
- **Línea indicadora** sutil en la posición de drop
- **Transiciones suaves** CSS durante el reorden
- **Persistencia inmediata** del nuevo orden

### Backend
- **Campo `position`** en la tabla `accounts` (integer)
- **Orden por defecto** cuando no hay posición: `createdAt`
- **Reorden**: actualizar el campo `position` de todas las cuentas afectadas

### Biblioteca
- **@dnd-kit/core** + **@dnd-kit/sortable** (React, moderno, accesible)

## Componentes a Modificar
1. `src/db/schema.ts` - Agregar campo `position`
2. `src/app/actions.ts` - Agregar action `reorderAccounts`
3. `src/app/page.tsx` - Wrappear cuentas con SortableContext

## Pendientes de Implementación
- Migration de base de datos para agregar campo position
- Acción server para guardar el nuevo orden
- Componente SortableAccount wrapper
