import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type StatusSlice = {
  label: string;
  value: number;
};

type Props = {
  data: StatusSlice[];
  isLoading?: boolean;
};

const colors = ["#22c55e", "#ef4444", "#facc15", "#38bdf8"];

export const StatusDonut: React.FC<Props> = ({ data, isLoading }) => {
  const chartData = data.length
    ? data
    : [
        { label: "Éxitos", value: 0 },
        { label: "Fallos", value: 0 },
      ];

  return (
    <div className="card flex flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Estado de solicitudes</h2>
          <p className="text-xs text-slate-400">Distribución agregada durante el periodo actual.</p>
        </div>
      </header>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.label} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#111827",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {isLoading && <span className="text-xs text-slate-400">Procesando métricas...</span>}
    </div>
  );
};

