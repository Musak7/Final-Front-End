"use client";

import type { Alert } from "@/types";
import { X, AlertTriangle, Bug, GitBranch, ShieldAlert, BellOff } from "lucide-react";

interface Props {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

const iconMap = {
  blocker: AlertTriangle,
  bug: Bug,
  "scope-change": GitBranch,
  risk: ShieldAlert,
};

const colorMap = {
  blocker: "border-red-200 bg-red-50 text-red-800",
  bug: "border-orange-200 bg-orange-50 text-orange-800",
  "scope-change": "border-blue-200 bg-blue-50 text-blue-800",
  risk: "border-yellow-200 bg-yellow-50 text-yellow-800",
};

export default function AlertsPanel({ alerts, onDismiss, onDismissAll }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Alerts
          {alerts.length > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {alerts.length}
            </span>
          )}
        </h2>
        {alerts.length > 0 && (
          <button
            onClick={onDismissAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Dismiss all
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <BellOff className="mb-2 h-8 w-8" />
          <p className="text-sm">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {alerts.map((alert) => {
            const Icon = iconMap[alert.type];
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${colorMap[alert.type]}`}
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="mt-1 text-xs opacity-60">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
