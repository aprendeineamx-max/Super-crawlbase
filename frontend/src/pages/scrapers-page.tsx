import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useUiState } from "@/store/ui-state";
import { Upload, Link2, FileText, X, CheckCircle2, Play, FolderOpen, Loader2 } from "lucide-react";

type ScraperType = "amazon" | "walmart" | "facebook" | "instagram";

interface ScrapeResult {
  success: boolean;
  total_urls: number;
  successful: number;
  failed: number;
  excel_path: string;
  sheet_name: string;
  message: string;
  errors?: Array<{ url: string; error: string }>;
}

export const ScrapersPage: React.FC = () => {
  const { activeProfile } = useUiState();
  const [selectedScraper, setSelectedScraper] = useState<ScraperType>("walmart");
  const [keyword, setKeyword] = useState("");
  const [pages, setPages] = useState("1");
  const [urls, setUrls] = useState<string[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState({ current: 0, total: 0 });
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [excelPath, setExcelPath] = useState<string>("");
  const [sheetName, setSheetName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

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

  const handleExcelPathSelect = () => {
    excelInputRef.current?.click();
  };

  const handleExcelPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Guardar solo el nombre del archivo
      // El backend buscará en el directorio output o usará la ruta si es absoluta
      setExcelPath(file.name);
    }
  };

  const handleStartScraping = async () => {
    if (!activeProfile) {
      alert("Por favor selecciona un perfil");
      return;
    }

    if (urls.length === 0) {
      alert("No hay URLs para scrapear. Genera o carga URLs primero.");
      return;
    }

    setIsScraping(true);
    setScrapeProgress({ current: 0, total: urls.length });
    setScrapeResult(null);

    try {
      // Simular progreso mientras se ejecuta el scraping
      const progressInterval = setInterval(() => {
        setScrapeProgress((prev) => {
          if (prev.current < prev.total) {
            return { ...prev, current: Math.min(prev.current + 1, prev.total) };
          }
          return prev;
        });
      }, 500);

      const result = await api.scrapers.scrape({
        urls: urls,
        profile_id: activeProfile.id,
        excel_path: excelPath || null,
        sheet_name: sheetName || null,
      });

      clearInterval(progressInterval);
      setScrapeProgress({ current: urls.length, total: urls.length });
      setScrapeResult(result);
    } catch (error) {
      console.error("Error durante el scraping:", error);
      alert(`Error durante el scraping: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsScraping(false);
    }
  };

  const handleOpenExcel = () => {
    if (!scrapeResult?.excel_path) return;

    // Descargar el archivo Excel desde el backend
    const excelUrl = `/api/scrapers/download?path=${encodeURIComponent(scrapeResult.excel_path)}`;
    
    // Crear un enlace temporal para descargar
    const link = document.createElement("a");
    link.href = excelUrl;
    link.download = scrapeResult.excel_path.split(/[/\\]/).pop() || "scraping.xlsx";
    link.target = "_blank"; // Abrir en nueva pestaña
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nota: El archivo se descargará y, si Excel está configurado como aplicación predeterminada,
    // se abrirá automáticamente. Para abrir en una hoja específica, el usuario deberá hacerlo manualmente
    // desde Excel (Ctrl+G y escribir el nombre de la hoja).
  };

  const handleClearUrls = () => {
    setUrls([]);
    setFileUrls([]);
    setScrapeResult(null);
    setExcelPath("");
    setSheetName("");
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
            Genera URLs para scraping, realiza scraping y guarda los resultados en Excel.
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

            {/* Configuración de Excel */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Archivo Excel (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={excelPath}
                    onChange={(e) => setExcelPath(e.target.value)}
                    placeholder="Nombre del archivo (ej: scraping.xlsx)..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <button
                    onClick={handleExcelPathSelect}
                    className="px-3 py-2 bg-white/5 text-slate-200 border border-white/10 rounded-lg hover:bg-white/10 transition"
                    title="Seleccionar archivo Excel existente (solo para referencia del nombre)"
                  >
                    <FolderOpen className="h-4 w-4" />
                  </button>
                </div>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelPathChange}
                  className="hidden"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Deja vacío para crear un nuevo archivo. Si especificas un nombre de archivo existente en el directorio output, se creará una nueva hoja en ese archivo.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Nombre de hoja (opcional)
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Dejar vacío para nombre automático"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2 pt-2 border-t border-white/10">
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

              <button
                onClick={handleStartScraping}
                disabled={isScraping || urls.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scrapeando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Iniciar Scraping
                  </>
                )}
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
          {/* Progreso del scraping */}
          {isScraping && (
            <div className="card p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Scrapeando URLs...</h3>
                  <span className="text-sm text-slate-400">
                    {scrapeProgress.current} / {scrapeProgress.total}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(scrapeProgress.current / scrapeProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resultado del scraping */}
          {scrapeResult && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-5 w-5 ${scrapeResult.success ? "text-emerald-400" : "text-red-400"}`}
                />
                <h3 className="text-lg font-semibold text-white">Scraping Completado</h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400">Total URLs</p>
                  <p className="text-2xl font-bold text-white">{scrapeResult.total_urls}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <p className="text-xs text-emerald-300">Exitosos</p>
                  <p className="text-2xl font-bold text-emerald-400">{scrapeResult.successful}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-xs text-red-300">Fallidos</p>
                  <p className="text-2xl font-bold text-red-400">{scrapeResult.failed}</p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Archivo Excel</p>
                <p className="text-sm text-white font-mono break-all">{scrapeResult.excel_path}</p>
                <p className="text-xs text-slate-400 mt-1">Hoja: {scrapeResult.sheet_name}</p>
              </div>

              {scrapeResult.errors && scrapeResult.errors.length > 0 && (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-xs text-red-300 mb-2">Errores:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scrapeResult.errors.map((error, idx) => (
                      <p key={idx} className="text-xs text-red-400">
                        {error.url}: {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleOpenExcel}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition hover:bg-primary/80"
                title={`Abrir archivo Excel. La hoja "${scrapeResult.sheet_name}" contiene los resultados del scraping.`}
              >
                <FolderOpen className="h-4 w-4" />
                Abrir Excel (Hoja: {scrapeResult.sheet_name})
              </button>
            </div>
          )}

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
