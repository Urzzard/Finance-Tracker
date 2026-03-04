# Diseño: Reordenamiento de Cuentas con Drag & Drop

**Fecha:** 2026-02-19  
**Feature:** Organización manual de cuentas mediante drag & drop

---

## Resumen

Permitir al usuario reordenar sus cuentas arrastrándolas a la posición deseada. El nuevo orden se persiste en la base de datos.

---

## Decisiones de Diseño

### Persistencia
- Campo `position` (integer) en la tabla `accounts`
- Las cuentas existentes se inicializan con position = id (orden por creación)

### UX Visual
- Cursor "grab" al hover sobre cuenta
- Al arrastrar: cuenta elevada con sombra suave
- Línea sutil indica dónde se colocará al soltar
- Transición suave al reordenar

---

## Aprobado

Sí — pendiente de implementación
