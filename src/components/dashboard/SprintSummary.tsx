"use client";

import type { Sprint, SprintIssue } from "@/types";
import { daysRemaining } from "@/lib/utils";
import { Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface Props {
  sprint: Sprint | undefined;
  issues: SprintIssue[] | undefined;
}

export default function SprintSummary({ sprint, issues }: Props) {
  if (!sprint || !issues) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white"
          />
        ))}
      </div>
    );
  }

  const totalPoints = issues.reduce((sum, i) => sum + i.storyPoints, 0);
  const completedPoints = issues
    .filter((i) => i.statusCategory === "Done")
    .reduce((sum, i) => sum + i.storyPoints, 0);
  const remainingPoints = totalPoints - completedPoints;
  const daysLeft = daysRemaining(sprint.endDate);
  const blockerCount = issues.filter((i) => i.blocked).length;

  const cards = [
    {
      title: "Total Points",
      value: totalPoints,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Completed",
      value: completedPoints,
      subtitle: `${totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%`,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Days Remaining",
      value: daysLeft,
      subtitle: `${remainingPoints} pts left`,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Blockers",
      value: blockerCount,
      icon: AlertTriangle,
      color: blockerCount > 0 ? "text-red-600" : "text-gray-600",
      bg: blockerCount > 0 ? "bg-red-50" : "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
          {card.subtitle && (
            <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
