# Frontend - Crawlbase Desktop Suite

Interfaz de usuario moderna construida con React, TypeScript, Vite y Tailwind CSS.

## Instalación

### Requisitos previos
- Node.js 18+ y npm (o pnpm/yarn)

### Pasos de instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

   O usando el script automatizado:
   ```powershell
   # Windows PowerShell
   .\scripts\install-deps.ps1
   ```

   ```bash
   # Linux/macOS
   chmod +x scripts/install-deps.sh
   ./scripts/install-deps.sh
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

3. **Compilar para producción:**
   ```bash
   npm run build
   ```

## Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── hooks/          # Custom hooks
├── layouts/        # Layouts de página
├── lib/            # Utilidades y clientes API
├── pages/          # Páginas principales
├── store/          # Estado global (Zustand)
├── styles/         # Estilos globales
└── routes.tsx      # Configuración de rutas
```

## Tecnologías principales

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS
- **React Router** - Enrutamiento
- **TanStack Query** - Gestión de estado del servidor
- **Zustand** - Estado global
- **Recharts** - Gráficos y visualizaciones
- **Zod** - Validación de esquemas

## Notas importantes

- Asegúrate de que el backend esté ejecutándose en `http://127.0.0.1:8000` para que las peticiones API funcionen correctamente.
- Los errores de TypeScript desaparecerán una vez que se instalen las dependencias con `npm install`.

