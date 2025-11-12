import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Profile } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";

/**
 * Hook que fuerza la selección automática del perfil demo al cargar
 */
export const useAutoSelectProfile = () => {
  const { activeProfile, setActiveProfile } = useUiState();
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.profiles.list,
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
  });

  useEffect(() => {
    // Solo ejecutar cuando los perfiles estén cargados
    if (isLoading) {
      return;
    }

    if (error) {
      console.error("useAutoSelectProfile - Error:", error);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.warn("useAutoSelectProfile - No hay perfiles disponibles");
      return;
    }

    // Filtrar "Nuevo Perfil"
    const validProfiles = profiles.filter((p: Profile) => {
      const nameLower = p.name.toLowerCase().trim();
      return (
        nameLower !== "nuevo perfil" &&
        !nameLower.startsWith("nuevo perfil") &&
        !nameLower.includes("nuevo perfil")
      );
    });

    if (validProfiles.length === 0) {
      console.warn("useAutoSelectProfile - Todos los perfiles fueron filtrados");
      return;
    }

    // Si ya hay un perfil activo válido, mantenerlo
    if (activeProfile && activeProfile.id) {
      const isValid = validProfiles.some((p: Profile) => p.id === activeProfile.id);
      if (isValid) {
        return;
      }
    }

    // Buscar perfil demo
    const demoProfile = validProfiles.find((p: Profile) => {
      const nameLower = p.name.toLowerCase();
      return (
        nameLower.includes("demo") ||
        nameLower.includes("perfil demo") ||
        nameLower === "perfil demo crawlbase"
      );
    });

    const profileToSelect = demoProfile || validProfiles[0];

    if (profileToSelect) {
      console.log("useAutoSelectProfile - Seleccionando perfil:", profileToSelect.name);
      // Forzar selección inmediatamente
      setActiveProfile(profileToSelect);
    }
  }, [profiles, isLoading, error, activeProfile, setActiveProfile]);

  return { profiles, isLoading, error };
};

