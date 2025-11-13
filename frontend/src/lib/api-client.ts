import { z } from "zod";

const API_BASE = "/api";

const profileTokensSchema = z.object({
  normal: z.string(),
  javascript: z.string().nullable(),
  proxy: z.string().nullable(),
  storage: z.string().nullable(),
}).nullable();

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean().optional(),
  default_product: z.string().nullable(),
  tags: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  tokens: profileTokensSchema.optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  scraper_key: z.string(),
  status: z.string(),
  profile_id: z.number(),
  output_formats: z.array(z.string()).optional(),
});

export type Project = z.infer<typeof projectSchema>;

const trendSchema = z
  .object({
    total_success_delta: z.number(),
    total_failed_delta: z.number(),
    total_due_delta: z.number(),
    success_rate_delta: z.number(),
  })
  .nullable();

const domainSeriesSchema = z.object({
  domain: z.string(),
  total_requests: z.number(),
  success: z.number(),
  failed: z.number(),
  success_rate: z.number(),
});

const statusSeriesSchema = z.object({
  label: z.string(),
  value: z.number(),
});

const dashboardSummarySchema = z.object({
  product: z.string(),
  total_success: z.number(),
  total_failed: z.number(),
  total_due: z.number(),
  remaining_credits: z.number().nullable(),
  success_rate: z.number(),
  domains: z.array(domainSeriesSchema),
  trend: trendSchema,
});

const dashboardPayloadSchema = z.object({
  product: z.string(),
  totals: z.object({
    success: z.number(),
    failed: z.number(),
    due: z.number(),
    remaining_credits: z.number().nullable(),
    success_rate: z.number(),
    total_requests: z.number(),
  }),
  trend: trendSchema,
  series: z.object({
    status: z.array(statusSeriesSchema),
    domains: z.array(domainSeriesSchema),
  }),
});

const dashboardUsageSchema = z.object({
  profile: z.object({
    id: z.number(),
    name: z.string(),
    product: z.string(),
  }),
  status_code: z.number(),
  summary: dashboardSummarySchema,
  dashboard: dashboardPayloadSchema,
  raw: z.record(z.any()),
  headers: z.record(z.any()),
  cached: z.boolean().default(false),
});

export type DashboardUsage = z.infer<typeof dashboardUsageSchema>;

async function request<T>(path: string, init?: RequestInit) {
  const url = `${API_BASE}${path}`;
  console.log("API - Realizando petición a:", url);
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      // Agregar timeout y mejor manejo de errores de red
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    });
    console.log("API - Respuesta recibida:", response.status, response.statusText);
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      console.error("API - Error en respuesta:", detail);
      throw new Error(detail.detail ?? `Error ${response.status}`);
    }
    const data = await response.json();
    console.log("API - Datos parseados:", data);
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
        console.error("API - Error de conexión. Verifica que el backend esté corriendo en http://127.0.0.1:8000");
        throw new Error("No se pudo conectar al servidor. Verifica que el backend esté corriendo.");
      }
    }
    console.error("API - Error en petición:", error);
    throw error;
  }
}

export const api = {
  profiles: {
    list: async (options?: { includeTokens?: boolean }) => {
      const includeTokens = options?.includeTokens ?? true;
      try {
        const data = await request<unknown>(
          `/profiles?include_tokens=${includeTokens ? "true" : "false"}`
        );
        console.log("API - Perfiles recibidos del backend:", data);
        const parsed = z.array(profileSchema).parse(data);
        console.log("API - Perfiles parseados correctamente:", parsed);
        return parsed;
      } catch (error) {
        console.error("API - Error al obtener perfiles:", error);
        throw error;
      }
    },
    get: async (profileId: number) => {
      const data = await request<unknown>(`/profiles/${profileId}?include_tokens=true`);
      return profileSchema.parse(data);
    },
    create: async (data: {
      name: string;
      description?: string | null;
      token_normal: string;
      token_js?: string | null;
      token_proxy?: string | null;
      token_storage?: string | null;
      default_product?: string | null;
      is_active?: boolean;
      tags?: string[];
      metadata?: Record<string, any> | null;
    }) => {
      const response = await request<unknown>("/profiles", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return profileSchema.parse(response);
    },
  },
  dashboard: {
    usage: async (
      profileId: number,
      options?: { includePrevious?: boolean; forceRefresh?: boolean }
    ) => {
      const params = new URLSearchParams({ profile_id: String(profileId) });
      if (options?.includePrevious) params.set("include_previous", "true");
      if (options?.forceRefresh) params.set("force_refresh", "true");
      const data = await request<unknown>(`/dashboard/usage?${params.toString()}`);
      return dashboardUsageSchema.parse(data);
    },
  },
  docs: {
    catalog: () => request<{ sections: unknown }>("/docs/catalog"),
  },
  linkFactory: {
    presets: () => request<unknown>("/link-factory/presets"),
  },
  projects: {
    list: async (profileId?: number) => {
      const data = await request<unknown>(profileId ? `/projects?profile_id=${profileId}` : "/projects");
      return z.array(projectSchema).parse(data);
    },
  },
};

