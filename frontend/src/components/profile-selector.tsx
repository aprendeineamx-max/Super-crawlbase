import React from "react";
import { Link } from "react-router-dom";
import { Profile } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";
import { useAutoSelectProfile } from "@/hooks/use-auto-select-profile";
import { ChevronDown, User } from "lucide-react";

export const ProfileSelector: React.FC = () => {
  const { activeProfile, setActiveProfile } = useUiState();

  const { profiles, isLoading, error } = useAutoSelectProfile();

  // Debug: Log cuando cambian los perfiles
  React.useEffect(() => {
    console.log("ProfileSelector - Estado:", {
      isLoading,
      profilesCount: profiles.length,
      hasActiveProfile: !!activeProfile,
      error: error ? String(error) : null,
    });
    if (profiles.length) {
      console.log(
        "ProfileSelector - Perfiles encontrados:",
        profiles.map((p: Profile) => ({ id: p.id, name: p.name })),
      );
    }
  }, [profiles, isLoading, activeProfile, error]);

  // Filtrar perfiles que no sean "Nuevo Perfil" (case-insensitive y más estricto)
  const filteredProfiles = React.useMemo(() => {
    if (profiles.length === 0) {
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

  const label = activeProfile ? activeProfile.name : "Perfil";

  return (
    <details className="relative group">
      <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 shadow-sm transition hover:bg-white/10">
        <User className="h-4 w-4 opacity-70" />
        <span>{isLoading ? "Cargando..." : label}</span>
        <ChevronDown className="h-3 w-3 opacity-70 transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur">
        {isLoading && (
          <p className="px-3 py-2 text-xs text-slate-400">Cargando perfiles...</p>
        )}
        {error && (
          <p className="px-3 py-2 text-xs text-red-400">Error: {String(error)}</p>
        )}
        {!isLoading && !error && !filteredProfiles.length && (
          <div className="px-3 py-2 space-y-2">
            <p className="text-xs text-slate-400">
              No hay perfiles configurados.
              {profiles && profiles.length > 0 && (
                <span className="block mt-1 text-amber-400">
                  (Se encontraron {profiles.length} pero fueron filtrados)
                </span>
              )}
            </p>
            <Link
              to="/profiles/new"
              className="block w-full text-center px-3 py-2 bg-primary/20 text-primary-foreground rounded-lg text-xs font-medium transition hover:bg-primary/30"
            >
              + Crear Perfil
            </Link>
          </div>
        )}
        {filteredProfiles.map((profile: Profile) => (
          <button
            key={profile.id}
            onClick={() => {
              console.log("ProfileSelector - Click en perfil:", profile.name);
              setActiveProfile(profile);
            }}
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
        {filteredProfiles.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <Link
              to="/profiles/new"
              className="block w-full text-center px-3 py-2 bg-white/5 text-slate-200 rounded-lg text-xs font-medium transition hover:bg-white/10"
            >
              + Nuevo Perfil
            </Link>
          </div>
        )}
      </div>
    </details>
  );
};

