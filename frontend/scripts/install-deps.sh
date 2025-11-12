#!/bin/bash
# Script de instalación de dependencias para Linux/macOS

echo "Instalando dependencias del frontend..."
cd frontend

if [ -f "package-lock.json" ]; then
    echo "Eliminando package-lock.json anterior..."
    rm -f package-lock.json
fi

echo "Ejecutando npm install..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "¡Dependencias instaladas correctamente!"
    echo "Los errores de TypeScript deberían desaparecer ahora."
else
    echo ""
    echo "Error al instalar dependencias. Intenta ejecutar 'npm install' manualmente."
fi

cd ..

