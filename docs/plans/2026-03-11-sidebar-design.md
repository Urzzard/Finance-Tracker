# Sidebar - Diseño

> **Date:** 2026-03-11
> **Status:** Aprobado

## Overview

Sidebar de navegación ubicado en el lado izquierdo, con comportamiento visible/oculto (overlay) que no afecta las dimensiones del contenido principal.

## Layout

```
┌─────────────────────────────────────┐
│  ☰  Finance Tracker                 │  ← Header móvil
├──────────────┬──────────────────────┤
│              │                      │
│  🏠 Inicio   │   Contenido          │
│  💳 Cuentas  │   Principal          │
│  💰 Transac. │                      │
│  📊 Gráficos │                      │
│  📅 Historial│                      │
│  👤 Perfil   │                      │
│              │                      │
├──────────────┤   [Modo Dark]        │
│  [Cerrar]    │                      │
└──────────────┴──────────────────────┘
```

## Componentes

### Sidebar
- Contenedor principal del sidebar
- Estados: `open` | `closed`
- Persistencia en localStorage

### SidebarItem
- Cada item del menú
- Props: `icon`, `label`, `href`, `active`
- Hover y active states

### SidebarToggle
- Botón para abrir/cerrar sidebar
- Disponible en header

## Breakpoints

| Dispositivo | Ancho | Comportamiento |
|-------------|-------|----------------|
| Mobile | < 768px | Overlay, oculto por defecto |
| Tablet | 768-1024px | Overlay, visible por defecto |
| Desktop | > 1024px | Fijo, visible por defecto |

## Rutas

| Ruta | Label | Icono |
|------|-------|-------|
| / | Inicio | Home |
| /accounts | Cuentas | CreditCard |
| /transactions | Transacciones | ArrowLeftRight |
| /charts | Gráficos | BarChart3 |
| /history | Historial | CalendarDays |
| /profile | Perfil | User |

## Estados

- **Hover**: Background ligeramente más oscuro
- **Active**: Background con color distintivo, borde izquierdo
- **Transiciones**: 200-300ms ease-in-out

## Diseño Visual

- Fondo: `bg-slate-900` (dark) / `bg-white` (light)
- Texto: `text-slate-200` (dark) / `text-slate-700` (light)
- Ancho: 250px expandido
- Border: `border-r` sutil

## Notas

- No afecta dimensiones del main content (usa overlay/fixed)
- Botón toggle visible siempre en móvil
- Modo dark toggle integrado en pie del sidebar
- Perfil de usuario integrado en pie del sidebar
