import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";
import { ArrowLeft, Save } from "lucide-react";

export const ProfileCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setActiveProfile } = useUiState();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    token_normal: "",
    token_js: "",
    token_proxy: "",
    token_storage: "",
    default_product: "crawling-api",
    is_active: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.token_normal.trim()) {
        throw new Error("El token normal es requerido");
      }

      const profile = await api.profiles.create({
        name: formData.name || "Nuevo Perfil",
        description: formData.description || null,
        token_normal: formData.token_normal,
        token_js: formData.token_js || null,
        token_proxy: formData.token_proxy || null,
        token_storage: formData.token_storage || null,
        default_product: formData.default_product || null,
        is_active: formData.is_active,
        tags: [],
        metadata: null,
      });

      // Invalidar cache de perfiles
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      
      // Seleccionar el nuevo perfil automáticamente
      setActiveProfile(profile);
      
      // Redirigir al dashboard
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el perfil");
      console.error("Error creando perfil:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-white">Nuevo Perfil</h1>
          <p className="text-sm text-slate-400">Agrega un nuevo perfil con credenciales de Crawlbase</p>
        </div>
      </div>

      {error && (
        <div className="card p-4 border-red-500/50 bg-red-500/10">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del Perfil *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Perfil Demo Crawlbase"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional del perfil"
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Token Normal (Crawling API) *
            </label>
            <input
              type="text"
              value={formData.token_normal}
              onChange={(e) => setFormData({ ...formData, token_normal: e.target.value })}
              placeholder="Tu token de Crawling API"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Token JavaScript (opcional)
            </label>
            <input
              type="text"
              value={formData.token_js}
              onChange={(e) => setFormData({ ...formData, token_js: e.target.value })}
              placeholder="Tu token de JavaScript API"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Token Proxy (opcional)
            </label>
            <input
              type="text"
              value={formData.token_proxy}
              onChange={(e) => setFormData({ ...formData, token_proxy: e.target.value })}
              placeholder="Tu token de Proxy API"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Token Storage (opcional)
            </label>
            <input
              type="text"
              value={formData.token_storage}
              onChange={(e) => setFormData({ ...formData, token_storage: e.target.value })}
              placeholder="Tu token de Storage API"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Producto Predeterminado
            </label>
            <select
              value={formData.default_product}
              onChange={(e) => setFormData({ ...formData, default_product: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="crawling-api">Crawling API</option>
              <option value="javascript-api">JavaScript API</option>
              <option value="proxy-api">Proxy API</option>
              <option value="storage-api">Storage API</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 text-slate-300 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.token_normal.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      </form>
    </div>
  );
};

