import React from "react";

type Props = {
  title: string;
  value: number;
  diffLabel?: string;
  trend?: "up" | "down" | "neutral";
  isLoading?: boolean;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export const KPICard: React.FC<Props> = ({ title, value, diffLabel, trend = "up", isLoading }: Props) => {
  return (
    <div className="card p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-white">
          {isLoading ? <span className="text-slate-500">...</span> : formatNumber(value)}
        </span>
        {diffLabel && (
          <span
            className={[
              "rounded-full px-2 py-1 text-xs font-medium",
              trend === "up" ? "bg-emerald-500/20 text-emerald-300" : "",
              trend === "down" ? "bg-red-500/20 text-red-300" : "",
              trend === "neutral" ? "bg-slate-500/20 text-slate-200" : "",
            ].join(" ")}
          >
            {diffLabel}
          </span>
        )}
      </div>
    </div>
  );
};

