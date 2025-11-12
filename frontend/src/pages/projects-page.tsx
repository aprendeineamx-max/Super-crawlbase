import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Project } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export const ProjectsPage: React.FC = () => {
  const { activeProfile } = useUiState();

  const { data, isLoading } = useQuery<Project[]>({
    queryKey: ["projects", activeProfile?.id],
    queryFn: () => api.projects.list(activeProfile?.id),
  });

  const projects: Project[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Proyectos</h1>
          <p className="text-sm text-slate-400">
            Administra los proyectos de scraping y asigna perfiles y presets de enlace.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Link>
      </header>

      {isLoading && <p className="text-sm text-slate-400">Cargando proyectos...</p>}

      {!isLoading && projects.length === 0 && (
        <div className="card p-6 text-center text-sm text-slate-300">
          No hay proyectos registrados. Crea uno nuevo para comenzar.
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                <p className="text-xs uppercase tracking-wide text-slate-400">{project.scraper_key}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                {project.status}
              </span>
            </div>
            {project.description && <p className="text-sm text-slate-300">{project.description}</p>}
            <div className="text-xs text-slate-400">
              <p>Formatos: {project.output_formats?.join(", ") ?? "N/A"}</p>
              <p>Perfil: {project.profile_id}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

