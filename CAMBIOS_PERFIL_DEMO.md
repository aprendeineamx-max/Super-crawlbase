# Cambios Realizados para Perfil Demo

## ✅ Cambios Implementados

### 1. Selección Automática del Perfil Demo
- Modificado `frontend/src/components/profile-selector.tsx` para que busque automáticamente el perfil demo al iniciar
- El perfil demo se identifica por contener "demo" o "perfil demo" en su nombre
- Si no existe el perfil demo, se selecciona el primer perfil disponible

### 2. Filtrado de "Nuevo Perfil"
- Agregado filtro para excluir cualquier perfil que contenga "nuevo perfil" en su nombre
- Los perfiles filtrados no aparecen en el selector ni se seleccionan automáticamente

### 3. Perfil Demo con Credenciales
- El perfil demo ya contiene todas las credenciales en `backend/seed_data/primer_perfil.json`:
  - Token Normal: `9sTH5F1Pj_BziIRkn1JxXQ`
  - Token JavaScript: `sHhCnCgqjuVps4e32yKdAQ`
  - Token Proxy: `9sTH5F1Pj_BziIRkn1JxXQ`
  - Token Storage: `9sTH5F1Pj_BziIRkn1JxXQ`

## 📋 Cómo Verificar

1. **Asegúrate de que el perfil demo esté cargado:**
   ```bash
   cd backend
   python -m app.cli seed
   python -m app.cli perfiles
   ```

2. **Inicia el backend:**
   ```bash
   uvicorn app.main:app --reload --app-dir backend
   ```

3. **Inicia el frontend:**
   ```bash
   cd frontend
   npm install  # Si aún no lo has hecho
   npm run dev
   ```

4. **Verifica que:**
   - El perfil demo se selecciona automáticamente al iniciar
   - No aparece "Nuevo Perfil" en la lista
   - El dashboard muestra datos del perfil demo

## 🔧 Código Modificado

### `frontend/src/components/profile-selector.tsx`
- Agregado `useMemo` para filtrar perfiles
- Modificado `useEffect` para buscar y seleccionar el perfil demo automáticamente
- Filtrado de "Nuevo Perfil" implementado

## ⚠️ Nota Importante

Si el perfil demo no aparece o no se selecciona automáticamente:
1. Verifica que el perfil demo esté cargado en la base de datos
2. Asegúrate de que el nombre del perfil contenga "demo" o "perfil demo"
3. Verifica que el backend esté ejecutándose y respondiendo correctamente

