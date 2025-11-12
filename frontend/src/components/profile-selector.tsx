import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Profile } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";
import { ChevronDown, User } from "lucide-react";

export const ProfileSelector: React.FC = () => {
  const { activeProfile, setActiveProfile } = useUiState();
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.profiles.list,
    retry: 2,
    retryDelay: 1000,
  });

  // Debug: Log cuando cambian los perfiles
  React.useEffect(() => {
    console.log("ProfileSelector - Estado:", { 
      isLoading, 
      profilesCount: profiles?.length ?? 0, 
      hasActiveProfile: !!activeProfile,
      error: error ? String(error) : null
    });
    if (profiles && profiles.length > 0) {
      console.log("ProfileSelector - Perfiles encontrados:", profiles.map((p: Profile) => ({ id: p.id, name: p.name })));
    }
  }, [profiles, isLoading, activeProfile, error]);

  // Filtrar perfiles que no sean "Nuevo Perfil" (case-insensitive y más estricto)
  const filteredProfiles = React.useMemo(() => {
    if (!profiles || profiles.length === 0) {
      console.log("ProfileSelector - No hay perfiles en la respuesta");
      return [];
    }
    console.log("ProfileSelector - Perfiles antes del filtrado:", profiles.length);
    const filtered = profiles.filter((profile: Profile) => {
      const nameLower = profile.name.toLowerCase().trim();
      const shouldInclude = (
        nameLower !== "nuevo perfil" &&
        !nameLower.startsWith("nuevo perfil") &&
        !nameLower.includes("nuevo perfil")
      );
      if (!shouldInclude) {
        console.log("ProfileSelector - Perfil filtrado:", profile.name);
      }
      return shouldInclude;
    });
    console.log("ProfileSelector - Perfiles después del filtrado:", filtered.length);
    return filtered;
  }, [profiles]);

  // Efecto para seleccionar automáticamente el perfil demo
  useEffect(() => {
    // Esperar a que termine la carga
    if (isLoading) {
      return;
    }
    
    // Si hay error, mostrarlo pero no bloquear
    if (error) {
      console.error("ProfileSelector - Error cargando perfiles:", error);
    }
    
    // Si no hay perfiles filtrados, no hacer nada
    if (filteredProfiles.length === 0) {
      console.warn("ProfileSelector - No hay perfiles disponibles después del filtrado");
      if (profiles && profiles.length > 0) {
        console.warn("ProfileSelector - Perfiles antes del filtrado:", profiles.map((p: Profile) => ({ id: p.id, name: p.name })));
      }
      return;
    }

    console.log("ProfileSelector - Perfiles filtrados disponibles:", filteredProfiles.map((p: Profile) => ({ id: p.id, name: p.name })));

    // Si ya hay un perfil activo válido, mantenerlo
    if (activeProfile && activeProfile.id) {
      const isStillValid = filteredProfiles.some((p: Profile) => p.id === activeProfile.id);
      if (isStillValid) {
        console.log("ProfileSelector - Perfil activo válido, manteniendo:", activeProfile.name);
        return;
      }
      console.log("ProfileSelector - Perfil activo ya no válido, seleccionando nuevo");
    }

    // FORZAR selección del perfil demo o el primero disponible
    const demoProfile = filteredProfiles.find((p: Profile) => {
      const nameLower = p.name.toLowerCase();
      return nameLower.includes("demo") || 
             nameLower.includes("perfil demo") ||
             nameLower === "perfil demo crawlbase";
    });
    
    const profileToSelect = demoProfile || filteredProfiles[0];
    
    if (profileToSelect) {
      console.log("ProfileSelector - FORZANDO selección de perfil:", profileToSelect.name, "ID:", profileToSelect.id);
      // Usar setTimeout para asegurar que se ejecute después de que React termine de renderizar
      setTimeout(() => {
        setActiveProfile(profileToSelect);
      }, 100);
    } else {
      console.error("ProfileSelector - ERROR: No se pudo seleccionar ningún perfil de", filteredProfiles.length, "perfiles disponibles");
    }
  }, [filteredProfiles, isLoading, error, profiles, activeProfile, setActiveProfile]);

  const label = activeProfile ? activeProfile.name : "Perfil";

  return (
    <details className="relative group">
      <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 shadow-sm transition hover:bg-white/10">
        <User className="h-4 w-4 opacity-70" />
        <span>{isLoading ? "Cargando..." : label}</span>
        <ChevronDown className="h-3 w-3 opacity-70 transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur">
        {!filteredProfiles.length && (
          <p className="px-3 py-2 text-xs text-slate-400">No hay perfiles configurados.</p>
        )}
        {filteredProfiles.map((profile: Profile) => (
          <button
            key={profile.id}
            onClick={() => setActiveProfile(profile)}
            className={[
              "w-full rounded-xl px-3 py-2 text-left text-sm transition",
              activeProfile?.id === profile.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-white/10 text-slate-200",
            ].join(" ")}
          >
            <div className="font-semibold">{profile.name}</div>
            {profile.description && <p className="text-xs opacity-70">{profile.description}</p>}
          </button>
        ))}
      </div>
    </details>
  );
};

