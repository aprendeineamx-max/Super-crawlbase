import React from "react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

type DomainUsage = {
  domain: string;
  total_requests: number;
  success: number;
  failed: number;
};

type Props = {
  data: DomainUsage[];
  isLoading?: boolean;
};

const placeholder = Array.from({ length: 6 }).map((_, index) => ({
  domain: `dominio-${index + 1}`,
  total_requests: 0,
  success: 0,
  failed: 0,
}));

export const UsageChart: React.FC<Props> = ({ data, isLoading }) => {
  const chartData = (data?.length ? data : placeholder).map((item) => ({
    domain: item.domain,
    Exitosas: item.success,
    Fallidas: item.failed ?? item.total_requests - item.success,
  }));

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Actividad por dominio</h2>
          <p className="text-xs text-slate-400">Agrupación de solicitudes exitosas y fallidas.</p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="failureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="domain" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ background: "#111827", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <Area type="monotone" dataKey="Exitosas" stroke="#22c55e" fill="url(#successGradient)" />
            <Area type="monotone" dataKey="Fallidas" stroke="#ef4444" fill="url(#failureGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {isLoading && <p className="mt-3 text-xs text-slate-400">Cargando estadísticas...</p>}
    </div>
  );
};

