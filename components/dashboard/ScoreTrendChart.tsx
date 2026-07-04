"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardTrendPoint } from "@/lib/dashboard";

type ScoreTrendChartProps = {
  data: DashboardTrendPoint[];
};

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const hasEnoughPoints = data.length >= 2;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Match Score Trend
          </h2>
          <p className="mt-1 text-xs text-text-muted">Last 30 days</p>
        </div>
      </div>

      {!hasEnoughPoints ? (
        <p className="mt-10 text-sm text-text-muted">
          Complete at least two analyses to see your score trend.
        </p>
      ) : (
        <div className="mt-6 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  color: "var(--color-text-primary)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value}%`, "Avg score"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-accent)"
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: "var(--color-accent)",
                  stroke: "var(--color-surface)",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
