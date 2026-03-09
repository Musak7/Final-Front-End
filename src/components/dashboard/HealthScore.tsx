"use client";

import type { HealthScore as HealthScoreType } from "@/types";
import { Shield, TrendingDown, Bug, AlertTriangle, GitBranch } from "lucide-react";

interface Props {
  healthScore: HealthScoreType | null;
  isLoading: boolean;
}

export default function HealthScore({ healthScore, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-40 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (!healthScore) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Health Score</h2>
        <div className="flex h-40 items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const colorMap = {
    healthy: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-500", bar: "bg-green-500" },
    "at-risk": { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-500", bar: "bg-yellow-500" },
    critical: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-500", bar: "bg-red-500" },
  };

  const colors = colorMap[healthScore.level];

  const factors = [
    {
      label: "Burndown Deviation",
      value: healthScore.factors.burndownDeviation,
      max: 100,
      icon: TrendingDown,
    },
    {
      label: "Active Blockers",
      value: healthScore.factors.blockerCount,
      max: 3,
      icon: AlertTriangle,
    },
    {
      label: "Open Bugs",
      value: healthScore.factors.bugCount,
      max: 4,
      icon: Bug,
    },
    {
      label: "Scope Change",
      value: healthScore.factors.scopeChange,
      max: 10,
      icon: GitBranch,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Sprint Health
      </h2>

      {/* Score Display */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ring-4 ${colors.ring} ${colors.bg}`}
        >
          <div className="text-center">
            <span className={`text-2xl font-bold ${colors.text}`}>
              {healthScore.score}
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${colors.text}`} />
            <span className={`text-sm font-semibold uppercase ${colors.text}`}>
              {healthScore.level}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {healthScore.level === "healthy"
              ? "Sprint is on track"
              : healthScore.level === "at-risk"
                ? "Sprint needs attention"
                : "Sprint is in danger"}
          </p>
        </div>
      </div>

      {/* Factors Breakdown */}
      <div className="space-y-3">
        {factors.map((factor) => {
          const pct = Math.min((factor.value / factor.max) * 100, 100);
          return (
            <div key={factor.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <factor.icon className="h-3.5 w-3.5" />
                  {factor.label}
                </div>
                <span className="font-medium text-gray-900">
                  {factor.value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct > 60 ? "bg-red-400" : pct > 30 ? "bg-yellow-400" : "bg-green-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
