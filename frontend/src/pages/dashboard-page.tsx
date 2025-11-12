import React, { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import { UsageChart } from "@/components/usage-chart";
import { KPICard } from "@/components/kpi-card";
import { StatusDonut } from "@/components/status-donut";
import { TrendCard } from "@/components/trend-card";
import { DomainTable } from "@/components/domain-table";
import { useUsageSnapshot } from "@/hooks/use-usage-snapshot";

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isFetching, error, refresh, activeProfile } = useUsageSnapshot();

  const kpis = useMemo(() => {
    const totals = data?.dashboard.totals;
    if (!totals) {
      return {
        success: 0,
        failed: 0,
        remaining: 0,
        due: 0,
      };
    }
    return {
      success: totals.success,
      failed: totals.failed,
      remaining: totals.remaining_credits ?? 0,
      due: totals.due,
    };
  }, [data]);

  const statusSeries = data?.dashboard.series.status ?? [];
  const domainSeries = data?.dashboard.series.domains ?? [];
  const successRate = data?.dashboard.totals.success_rate ?? 0;
  const trend = data?.summary.trend ?? null;

  if (!activeProfile) {
    return <p className="text-sm text-slate-300">Selecciona un perfil para ver el dashboard.</p>;
  }

  const errorMessage = (error as Error | undefined)?.message;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Monitorea el consumo de la suscripción y el desempeño del scraper seleccionado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.cached && (
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              Mostrando datos en caché
            </span>
          )}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <KPICard title="Solicitudes exitosas" value={kpis.success} diffLabel="mes actual" isLoading={isLoading} />
          <KPICard
            title="Solicitudes fallidas"
            value={kpis.failed}
            diffLabel="mes actual"
            trend="down"
            isLoading={isLoading}
          />
          <KPICard title="Créditos restantes" value={kpis.remaining} diffLabel="suscripción" isLoading={isLoading} />
          <KPICard title="Coste acumulado" value={kpis.due} diffLabel="USD" isLoading={isLoading} />
        </div>
        <TrendCard successRate={successRate} trend={trend} cached={data?.cached} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <StatusDonut data={statusSeries} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <UsageChart data={domainSeries} isLoading={isLoading} />
        </div>
      </div>

      <DomainTable data={domainSeries} isLoading={isLoading} />

      {errorMessage && <p className="text-sm text-red-400">Error al cargar métricas: {errorMessage}</p>}
    </div>
  );
};

