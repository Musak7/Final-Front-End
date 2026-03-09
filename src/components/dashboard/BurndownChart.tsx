"use client";

import type { BurndownPoint } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

interface Props {
  data: BurndownPoint[] | undefined;
  isLoading: boolean;
}

export default function BurndownChart({ data, isLoading }: Props) {
  const [chartType, setChartType] = useState<"burndown" | "burnup">("burndown");

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-72 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Sprint Chart</h2>
        <div className="flex h-72 items-center justify-center text-gray-400">
          No burndown data available
        </div>
      </div>
    );
  }

  // For burnup, transform the data
  const totalPoints = data[0]?.ideal || 0;
  const chartData = data.map((point) => ({
    date: point.date,
    ...(chartType === "burndown"
      ? {
          Ideal: Number(point.ideal.toFixed(1)),
          Actual: Number(point.actual.toFixed(1)),
        }
      : {
          Target: totalPoints,
          Completed: Number((totalPoints - point.actual).toFixed(1)),
        }),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {chartType === "burndown" ? "Burndown Chart" : "Burnup Chart"}
        </h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setChartType("burndown")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              chartType === "burndown"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Burndown
          </button>
          <button
            onClick={() => setChartType("burnup")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              chartType === "burnup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Burnup
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />
          <Legend />
          {chartType === "burndown" ? (
            <>
              <Line
                type="monotone"
                dataKey="Ideal"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="Target"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Completed"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
