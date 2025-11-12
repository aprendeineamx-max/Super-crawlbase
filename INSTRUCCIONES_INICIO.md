# Instrucciones para Iniciar el Programa

## ✅ Estado Actual

- ✅ Base de datos inicializada
- ✅ Perfil demo cargado con credenciales
- ✅ Backend ejecutándose en segundo plano (puerto 8000)
- ✅ Frontend ejecutándose en segundo plano (puerto 5173)

## 🌐 Acceso a la Aplicación

1. **Frontend**: Abre tu navegador y ve a `http://localhost:5173`
2. **Backend API**: Disponible en `http://127.0.0.1:8000/api`
3. **Documentación API**: `http://127.0.0.1:8000/api/docs`

## 📋 Verificación

### Verificar que el perfil demo está cargado:
```bash
cd backend
python -c "from app.cli import cli; import sys; sys.argv = ['cli', 'perfiles']; cli()"
```

Deberías ver:
```
1 - Perfil Demo Crawlbase (crawling-api)
```

## 🔧 Si Necesitas Reiniciar

### Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend:
```bash
cd frontend
npm run dev
```

## ⚠️ Notas

- El perfil demo se selecciona automáticamente al iniciar
- "Nuevo Perfil" está filtrado y no aparece en la lista
- Las credenciales del perfil demo están cargadas desde `backend/seed_data/primer_perfil.json`
- La página de Scrapers permite generar URLs y abrir archivos de URLs

