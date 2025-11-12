import React from "react";

type DomainUsage = {
  domain: string;
  total_requests: number;
  success: number;
  failed: number;
  success_rate: number;
};

type Props = {
  data: DomainUsage[];
  isLoading?: boolean;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export const DomainTable: React.FC<Props> = ({ data, isLoading }) => {
  const rows = data.length ? data : Array.from({ length: 5 }).map((_, index) => ({
    domain: `dominio-${index + 1}.com`,
    total_requests: 0,
    success: 0,
    failed: 0,
    success_rate: 0,
  }));

  return (
    <div className="card p-6">
      <header className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Top dominios</h2>
          <p className="text-xs text-slate-400">Ordenados por volumen total de solicitudes.</p>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm text-slate-200">
          <thead>
            <tr className="text-left uppercase text-xs tracking-wide text-slate-500">
              <th className="py-2 pr-4">Dominio</th>
              <th className="py-2 pr-4 text-right">Solicitudes</th>
              <th className="py-2 pr-4 text-right">Éxitos</th>
              <th className="py-2 pr-4 text-right">Fallos</th>
              <th className="py-2 text-right">% Éxito</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((item) => (
              <tr key={item.domain} className="transition hover:bg-white/5">
                <td className="py-2 pr-4 font-medium">{item.domain}</td>
                <td className="py-2 pr-4 text-right">{formatNumber(item.total_requests)}</td>
                <td className="py-2 pr-4 text-right text-emerald-300">{formatNumber(item.success)}</td>
                <td className="py-2 pr-4 text-right text-red-300">{formatNumber(item.failed)}</td>
                <td className="py-2 text-right text-sky-300">{item.success_rate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isLoading && <p className="pt-3 text-xs text-slate-400">Calculando líderes por dominio...</p>}
    </div>
  );
};

