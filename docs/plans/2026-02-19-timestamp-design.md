# Diseño: Timestamp con Fecha y Hora

**Fecha**: 2026-02-19  
**Tema**: Almacenamiento de fecha y hora en transacciones

## Problema

El sistema actual solo almacena la fecha (sin hora) en las transacciones. Esto puede ser limitante para usuarios que:
- Quieren precisión en el registro de operaciones
- Necesitan justificar gastos con hora exacta
- Esperan integración futura con Open Banking (timestamps exactos)

## Solución

Implementar fecha + hora editable en todas las transacciones.

## Arquitectura

- Campo `date` ya es tipo `timestamp` en PostgreSQL ✅
- No requiere migración de esquema
- Solo cambios en UI

## Cambios en UI

### 1. Formulario de nueva transacción
- Input `datetime-local` en lugar de `date`
- Valor por defecto: fecha y hora actual del sistema

### 2. Edición de transacción
- Mismo input `datetime-local`
- Mantiene la hora original al editar

### 3. Listado de transacciones
- Mostrar hora junto a la fecha (formato: DD/MM/YYYY HH:mm)

## Validaciones

- Fecha no puede ser futura a "hoy" (configurable luego)
- Hora no puede ser posterior a `createdAt` (no tiene sentido registrar algo después de crearlo)

## Componentes afectados

- `TransactionForm` (crear)
- `TransactionList` (mostrar)
- `EditTransactionDialog` (editar)

## Flujo de datos

```
Input (datetime-local) → JavaScript Date → PostgreSQL timestamp
```
