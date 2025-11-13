import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Profile } from "@/lib/api-client";
import { useUiState, getUiState } from "@/store/ui-state";

/**
 * Hook que fuerza la selección automática del perfil demo al cargar
 * Versión mejorada con múltiples reintentos y mejor logging
 */
export const useAutoSelectProfile = () => {
  const { activeProfile, setActiveProfile } = useUiState();
  const hasSelectedRef = useRef(false);
  
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: api.profiles.list,
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    staleTime: 0, // Siempre obtener datos frescos
  });

  useEffect(() => {
    // Auto-limpieza si detectamos problemas persistentes
    const checkAndAutoFix = () => {
      // Si no hay perfil después de 3 segundos y hay perfiles disponibles, limpiar localStorage
      if (!activeProfile && profiles && profiles.length > 0 && !isLoading) {
        const persisted = getUiState().activeProfile;
        // Si hay un perfil persistido inválido, limpiarlo
        if (persisted && persisted.id) {
          const isValid = profiles.some((p: Profile) => p.id === persisted.id);
          if (!isValid) {
            console.warn("useAutoSelectProfile - Perfil persistido inválido, limpiando localStorage...");
            localStorage.removeItem("crawlbase-active-profile");
          }
        }
      }
    };

    // Solo ejecutar cuando los perfiles estén cargados
    if (isLoading) {
      console.log("useAutoSelectProfile - Esperando carga de perfiles...");
      return;
    }

    // Auto-fix después de un delay
    setTimeout(checkAndAutoFix, 3000);

    // Si ya seleccionamos un perfil, no hacer nada más
    if (hasSelectedRef.current && activeProfile?.id) {
      return;
    }

    if (error) {
      console.error("useAutoSelectProfile - Error cargando perfiles:", error);
      // Intentar usar perfil persistido como respaldo
      const persisted = getUiState().activeProfile;
      if (persisted && persisted.id) {
        console.log("useAutoSelectProfile - Usando perfil persistido:", persisted.name);
        hasSelectedRef.current = true;
        return;
      }
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.warn("useAutoSelectProfile - No hay perfiles disponibles");
      // Intentar usar perfil persistido como respaldo
      const persisted = getUiState().activeProfile;
      if (persisted && persisted.id) {
        console.log("useAutoSelectProfile - Usando perfil persistido como respaldo:", persisted.name);
        hasSelectedRef.current = true;
        return;
      }
      return;
    }

    console.log("useAutoSelectProfile - Perfiles recibidos:", profiles.length, profiles.map((p: Profile) => p.name));

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

    console.log("useAutoSelectProfile - Perfiles válidos:", validProfiles.length);

    // Si ya hay un perfil activo válido, mantenerlo
    if (activeProfile && activeProfile.id) {
      const isValid = validProfiles.some((p: Profile) => p.id === activeProfile.id);
      if (isValid) {
        console.log("useAutoSelectProfile - Perfil activo válido, manteniendo:", activeProfile.name);
        hasSelectedRef.current = true;
        return;
      }
      console.log("useAutoSelectProfile - Perfil activo no válido, buscando nuevo");
    }

    // Buscar perfil demo (más flexible - busca cualquier cosa con "demo" o "crawlbase")
    const demoProfile = validProfiles.find((p: Profile) => {
      const nameLower = p.name.toLowerCase();
      return (
        nameLower.includes("demo") ||
        nameLower.includes("perfil demo") ||
        nameLower === "perfil demo crawlbase" ||
        (nameLower.includes("crawlbase") && nameLower.includes("demo"))
      );
    });

    const profileToSelect = demoProfile || validProfiles[0];

    if (profileToSelect) {
      console.log("useAutoSelectProfile - FORZANDO selección de perfil:", profileToSelect.name, "ID:", profileToSelect.id);
      hasSelectedRef.current = true;
      
      // Selección inmediata
      setActiveProfile(profileToSelect);
      
      // Múltiples reintentos para asegurar que se guarde
      const retryDelays = [100, 300, 500, 1000];
      retryDelays.forEach((delay) => {
        setTimeout(() => {
          const current = getUiState().activeProfile;
          if (!current || current.id !== profileToSelect.id) {
            console.log(`useAutoSelectProfile - Reintentando selección (delay ${delay}ms)...`);
            setActiveProfile(profileToSelect);
          } else {
            console.log("useAutoSelectProfile - Perfil confirmado:", current.name, "ID:", current.id);
          }
        }, delay);
      });
    } else {
      console.error("useAutoSelectProfile - ERROR: No se pudo seleccionar ningún perfil de", validProfiles.length, "perfiles disponibles");
    }
  }, [profiles, isLoading, error, activeProfile, setActiveProfile]);

  return { profiles, isLoading, error };
};
