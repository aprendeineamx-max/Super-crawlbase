import React, { useState } from "react";
import { RefreshCw, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useUiState } from "@/store/ui-state";

export const DebugPanel: React.FC = () => {
  const { activeProfile } = useUiState();
  const [isClearing, setIsClearing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleClearAndReload = () => {
    setIsClearing(true);
    setLastAction("Limpiando localStorage...");
    
    try {
      // Limpiar localStorage
      localStorage.clear();
      setLastAction("localStorage limpiado. Recargando...");
      
      // Recargar después de un breve delay para que el usuario vea el mensaje
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error al limpiar localStorage:", error);
      setLastAction("Error al limpiar. Recargando de todas formas...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleForceReload = () => {
    setLastAction("Recargando página...");
    window.location.reload();
  };

  const checkBackend = async () => {
    setLastAction("Verificando backend...");
    
    // Intentar primero con el proxy de Vite
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        const payload = await response.json().catch(() => null);
        const versionLabel = payload?.version ? ` v${payload.version}` : "";
        setLastAction(`Backend operativo via proxy${versionLabel}`);
        
        // También verificar perfiles
        try {
          const profilesResponse = await fetch("/api/profiles", {
            signal: AbortSignal.timeout(5000),
          });
          if (profilesResponse.ok) {
            const profiles = await profilesResponse.json();
            setLastAction(`Backend OK - ${profiles.length} perfil(es) disponible(s)`);
          }
        } catch {
          // Ignorar error de perfiles
        }
        return;
      } else {
        setLastAction(`Backend responde pero con error (${response.status})`);
        return;
      }
    } catch (proxyError) {
      // Si falla el proxy, intentar directamente
      console.log("Proxy falló, intentando conexión directa...", proxyError);
    }
    
    // Intentar conexión directa como respaldo
    try {
      const directResponse = await fetch("http://127.0.0.1:8000/api/health", {
        method: "GET",
        signal: AbortSignal.timeout(5000),
        mode: "cors",
      });
      
      if (directResponse.ok) {
        setLastAction(`✓ Backend está funcionando (conexión directa)`);
      } else {
        setLastAction(`⚠ Backend responde pero con error (${directResponse.status})`);
      }
    } catch (error) {
      setLastAction("✗ Backend no está disponible. Verifica que esté corriendo en http://127.0.0.1:8000");
      console.error("Error verificando backend:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <details className="group">
        <summary className="cursor-pointer rounded-full bg-slate-800/90 border border-white/10 px-4 py-2 text-sm text-slate-200 shadow-lg hover:bg-slate-700/90 transition flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <span>Utilidades</span>
        </summary>
        <div className="mt-2 w-80 rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-xl backdrop-blur space-y-3">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white mb-3">Herramientas de Depuración</h3>
            
            {/* Estado actual */}
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                {activeProfile ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Perfil activo: {activeProfile.name}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-amber-400" />
                    <span>No hay perfil activo</span>
                  </>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleClearAndReload}
                disabled={isClearing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium transition hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                {isClearing ? "Limpiando..." : "Limpiar y Recargar"}
              </button>

              <button
                onClick={handleForceReload}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-sm font-medium transition hover:bg-blue-500/30"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar Página
              </button>

              <button
                onClick={checkBackend}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm font-medium transition hover:bg-emerald-500/30"
              >
                <CheckCircle2 className="h-4 w-4" />
                Verificar Backend
              </button>
            </div>

            {/* Mensaje de última acción */}
            {lastAction && (
              <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                {lastAction}
              </div>
            )}

            {/* Información de debugging */}
            <details className="mt-3">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                Ver información de debugging
              </summary>
              <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 space-y-1">
                <div>Backend: http://127.0.0.1:8000</div>
                <div>Frontend: http://127.0.0.1:5173</div>
                <div>localStorage: {localStorage.length} items</div>
                {activeProfile && (
                  <div>Perfil ID: {activeProfile.id}</div>
                )}
              </div>
            </details>
          </div>
        </div>
      </details>
    </div>
  );
};

