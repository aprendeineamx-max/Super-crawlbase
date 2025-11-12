# Instrucciones de Reinicio Completo

## Estado Actual
✅ Backend reiniciado en puerto 8000
✅ Frontend reiniciado en puerto 5173
✅ Perfil demo verificado en base de datos

## Cambios Realizados

### 1. Manejo de Errores Mejorado
- `ProjectsPage` ahora muestra mensajes de error claros
- No intenta cargar proyectos si no hay perfil activo
- Muestra estado de carga y errores de forma clara

### 2. Selección Automática de Perfil
- Hook `useAutoSelectProfile` simplificado
- Se ejecuta en `AppLayout` para carga temprana
- Reintento automático si la selección falla

### 3. Servicios Reiniciados
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:5173`

## Pasos para Verificar

1. **Abre el navegador** en `http://127.0.0.1:5173` o `http://localhost:5173`

2. **Abre la consola del navegador** (F12 → Console)

3. **Busca estos mensajes:**
   - `API - Realizando petición a: /api/profiles`
   - `useAutoSelectProfile - Seleccionando perfil: Perfil Demo Crawlbase`
   - `useAutoSelectProfile - Perfil confirmado: Perfil Demo Crawlbase`

4. **Verifica que el perfil aparezca** en el dropdown "Perfil" en la esquina superior derecha

## Si Aún Hay Problemas

### Limpiar localStorage
En la consola del navegador:
```javascript
localStorage.clear();
location.reload();
```

### Verificar Backend
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/profiles" -UseBasicParsing
```

### Verificar Frontend
Abre `http://127.0.0.1:5173` en el navegador

## Archivos Modificados
- `frontend/src/pages/projects-page.tsx` - Manejo de errores mejorado
- `frontend/src/hooks/use-auto-select-profile.ts` - Selección simplificada
- `frontend/src/store/ui-state.tsx` - Exportación de getState

