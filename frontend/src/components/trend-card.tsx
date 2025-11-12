import React from "react";

type Trend = {
  total_success_delta: number;
  total_failed_delta: number;
  total_due_delta: number;
  success_rate_delta: number;
} | null;

type Props = {
  successRate: number;
  trend: Trend;
  cached?: boolean;
  isLoading?: boolean;
};

const formatDiff = (value: number, suffix = "") => {
  const formatted = Math.abs(value).toFixed(2);
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  return `${sign}${formatted}${suffix}`;
};

export const TrendCard: React.FC<Props> = ({ successRate, trend, cached, isLoading }) => {
  return (
    <div className="card flex flex-col gap-3 p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Tasa de éxito</p>
          <p className="text-3xl font-semibold text-white">
            {isLoading ? <span className="text-slate-500">...</span> : `${successRate.toFixed(2)}%`}
          </p>
        </div>
        {cached && (
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">
            Datos desde caché
          </span>
        )}
      </header>

      <dl className="grid grid-cols-2 gap-3 text-xs text-slate-300">
        <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-3">
          <dt className="uppercase tracking-wide text-slate-400">Éxitos</dt>
          <dd className="text-sm font-semibold text-emerald-300">
            {trend ? formatDiff(trend.total_success_delta) : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-3">
          <dt className="uppercase tracking-wide text-slate-400">Fallos</dt>
          <dd className="text-sm font-semibold text-red-300">
            {trend ? formatDiff(trend.total_failed_delta) : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-3">
          <dt className="uppercase tracking-wide text-slate-400">Facturación</dt>
          <dd className="text-sm font-semibold text-sky-300">
            {trend ? formatDiff(trend.total_due_delta, " USD") : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-3">
          <dt className="uppercase tracking-wide text-slate-400">Variación tasa</dt>
          <dd className="text-sm font-semibold text-indigo-300">
            {trend ? formatDiff(trend.success_rate_delta, "%") : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
};

