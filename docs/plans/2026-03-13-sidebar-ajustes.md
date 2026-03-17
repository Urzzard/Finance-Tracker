# Sidebar - Ajustes Pendientes

> **Fecha:** 2026-03-13
> **Estado:** Identificado, sin implementar

---

## Problema

El Sidebar y MainContent actualmente aplican márgenes sin verificar si el usuario está autenticado.

**Síntoma:** Al cerrar sesión, se ve un espacio negro (70px) en el lado izquierdo.

---

## Opciones de Solución

### Opción A: Ajuste rápido en MainContent

**Descripción:** Quitar el margen del MainContent cuando sea ruta pública.

**Cambios:**
- En `MainContent`, verificar si es ruta pública antes de aplicar `lg:ml-[70px]`
- Complejidad: Baja (~5 min)

**Pros:**
- Solución rápida
- No rompe nada existente

**Contras:**
- Solución superficial, no arquitectural

---

### Opción B: Layouts separados (Auth vs Dashboard)

**Descripción:** Crear estructura de carpetas separada para rutas autenticadas vs públicas.

**Estructura propuesta:**

```
src/app/
├── (auth)/           # Grupo sin sidebar
│   ├── login/
│   ├── register/
│   └── page.tsx      # Landing page
├── (dashboard)/      # Grupo con sidebar
│   ├── layout.tsx    # Incluye Sidebar + MainContent
│   ├── page.tsx      # Dashboard
│   ├── accounts/
│   ├── transactions/
│   └── ...
└── layout.tsx        # Root layout (sin sidebar)
```

**Pros:**
- Solución arquitectural correcta
- Sidebar solo existe donde se necesita
- Mejor separación de responsabilidades

**Contras:**
- Requiere mover archivos de carpeta
- Actualizar todas las rutas
- Mayor riesgo de romper algo

---

## Recomendación

1. Implementar **Opción A** ahora (quick fix)
2. Planificar **Opción B** para cuando el proyecto crezca

---

## Notas Adicionales

- El sidebar actualmente retorna `null` en rutas públicas (`/login`, `/register`) usando `usePathname()`
- Hay un posible "flash" inicial antes de que se ejecute el hook
- El ModeToggle debe seguir funcionando en rutas públicas (para togglear theme)
