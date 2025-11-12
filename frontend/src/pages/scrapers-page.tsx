import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";
import { Upload, Link2, FileText, X, CheckCircle2 } from "lucide-react";

type ScraperType = "amazon" | "walmart" | "facebook" | "instagram";

export const ScrapersPage: React.FC = () => {
  const { activeProfile } = useUiState();
  const [selectedScraper, setSelectedScraper] = useState<ScraperType>("walmart");
  const [keyword, setKeyword] = useState("");
  const [pages, setPages] = useState("1");
  const [urls, setUrls] = useState<string[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: presets } = useQuery({
    queryKey: ["link-presets"],
    queryFn: api.linkFactory.presets,
  });

  const handleGenerateUrls = async () => {
    if (!keyword.trim()) {
      alert("Por favor ingresa una palabra clave");
      return;
    }

    setIsGenerating(true);
    try {
      const presetId = `${selectedScraper}-serp`;
      const overrides: Record<string, string[]> = {
        keyword: [keyword],
        page: Array.from({ length: parseInt(pages) || 1 }, (_, i) => String(i + 1)),
      };

      const response = await fetch(`/api/link-factory/generate?preset_id=${presetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides }),
      });

      const data = await response.json();
      if (data.preview) {
        setUrls(data.preview.map((item: string) => item));
      }
    } catch (error) {
      console.error("Error generando URLs:", error);
      alert("Error al generar URLs");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && (line.startsWith("http://") || line.startsWith("https://")));

      if (lines.length === 0) {
        alert("El archivo no contiene URLs válidas");
        return;
      }

      setFileUrls(lines);
      setUrls((prev) => [...prev, ...lines]);
    } catch (error) {
      console.error("Error cargando archivo:", error);
      alert("Error al cargar el archivo");
    } finally {
      setIsLoadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearUrls = () => {
    setUrls([]);
    setFileUrls([]);
  };

  const handleExportUrls = () => {
    if (urls.length === 0) {
      alert("No hay URLs para exportar");
      return;
    }

    const content = urls.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urls_${selectedScraper}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!activeProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-slate-300">Selecciona un perfil para usar los scrapers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Scrapers</h1>
          <p className="text-sm text-slate-400">
            Genera URLs para scraping o carga archivos existentes con listas de URLs.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel izquierdo - Configuración */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Configuración</h2>

            {/* Selector de Scraper */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Plataforma</label>
              <div className="grid grid-cols-2 gap-2">
                {(["amazon", "walmart", "facebook", "instagram"] as ScraperType[]).map((scraper) => (
                  <button
                    key={scraper}
                    onClick={() => setSelectedScraper(scraper)}
                    className={[
                      "px-4 py-2 rounded-lg text-sm font-medium transition",
                      selectedScraper === scraper
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-slate-300 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {scraper.charAt(0).toUpperCase() + scraper.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Parámetros de búsqueda */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Palabra clave
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ej: laptop, smartphone..."
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Páginas</label>
                <input
                  type="number"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleGenerateUrls}
                disabled={isGenerating || !keyword.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Link2 className="h-4 w-4" />
                {isGenerating ? "Generando..." : "Generar URLs"}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoadingFile}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-slate-200 border border-white/10 rounded-lg font-medium transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                {isLoadingFile ? "Cargando..." : "Abrir archivo de URLs"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Panel derecho - Resultados */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                URLs {urls.length > 0 && `(${urls.length})`}
              </h2>
              {urls.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleExportUrls}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-sm font-medium transition hover:bg-white/10"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar
                  </button>
                  <button
                    onClick={handleClearUrls}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium transition hover:bg-red-500/30"
                  >
                    <X className="h-4 w-4" />
                    Limpiar
                  </button>
                </div>
              )}
            </div>

            {fileUrls.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">
                  {fileUrls.length} URL(s) cargadas desde archivo
                </span>
              </div>
            )}

            {urls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-slate-500 mb-4" />
                <p className="text-sm text-slate-400">
                  No hay URLs generadas. Usa "Generar URLs" o "Abrir archivo de URLs" para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition"
                  >
                    <span className="text-xs text-slate-500 mt-1 min-w-[2rem]">{index + 1}.</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-sky-400 hover:text-sky-300 break-all"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

