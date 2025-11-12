import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Profile } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";
import { ChevronDown, User } from "lucide-react";

export const ProfileSelector: React.FC = () => {
  const { activeProfile, setActiveProfile } = useUiState();
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.profiles.list,
  });

  // Filtrar perfiles que no sean "Nuevo Perfil" (case-insensitive y más estricto)
  const filteredProfiles = React.useMemo(() => {
    return profiles?.filter((profile: Profile) => {
      const nameLower = profile.name.toLowerCase().trim();
      return (
        nameLower !== "nuevo perfil" &&
        !nameLower.startsWith("nuevo perfil") &&
        !nameLower.includes("nuevo perfil")
      );
    }) || [];
  }, [profiles]);

  useEffect(() => {
    if (filteredProfiles.length > 0) {
      // Buscar el perfil demo primero, si no existe, usar el primero disponible
      const demoProfile = filteredProfiles.find((p: Profile) => 
        p.name.toLowerCase().includes("demo") || 
        p.name.toLowerCase().includes("perfil demo")
      );
      const profileToSelect = demoProfile || filteredProfiles[0];
      
      // Solo actualizar si no hay perfil activo o si el perfil activo no está en la lista
      if (!activeProfile || !filteredProfiles.find((p: Profile) => p.id === activeProfile.id)) {
        setActiveProfile(profileToSelect);
      }
    }
  }, [filteredProfiles, activeProfile, setActiveProfile]);

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

