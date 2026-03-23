# Etapa 5: Página /profile

> **Fecha:** 2026-03-20
> **Goal:** Crear página /profile para gestión de usuario y configuraciones

---

## Funcionalidades

### 1. Información del usuario
- Email
- Nombre (si aplica)
- Fecha de registro

### 2. Configuraciones de la app
- Moneda preferida
- Tema (claro/oscuro)
- Zona horaria

### 3. Preferencias de UI
- Formato de fecha
- Formato de hora

### 4. Acciones
- Cerrar sesión
- Eliminar cuenta (futuro)

---

## Tareas

### Tarea 1: Crear estructura de archivos

**Archivos:**
- Create: `src/app/(dashboard)/profile/page.tsx`
- Create: `src/components/profile/profile-view.tsx`

---

### Tarea 2: Crear componentes

**Archivos a crear:**
- `profile-view.tsx` - Vista principal
- `profile-form.tsx` - Formulario de preferencias

---

### Tarea 3: Verificar en navegador

1. Navegar a `/profile`
2. Ver información del usuario
3. Probar cambios de preferencias
4. Verificar cerrar sesión

---

## Resumen de Archivos

| Acción | Archivo |
|--------|---------|
| Create | `src/app/(dashboard)/profile/page.tsx` |
| Create | `src/components/profile/profile-view.tsx` |
| Create | `src/components/profile/profile-form.tsx` |

---

## Notas

- **Nueva funcionalidad** - No existe componente similar en dashboard
- **Se puede expandir** - Más configuraciones según necesidad
