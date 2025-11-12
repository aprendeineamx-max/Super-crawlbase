import React from "react";

export const DocumentationPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Documentación integrada</h1>
      <p className="text-sm text-slate-400">
        Esta vista conectará con `/api/docs/catalog` para mostrar tutoriales, ejemplos ejecutables y guías de
        Crawlbase directamente dentro de la aplicación.
      </p>
      <p className="text-sm text-slate-500">
        Próximamente se añadirá un navegador con secciones, búsqueda y panel de ejecución en vivo para cada ejemplo.
      </p>
    </div>
  );
};

