import type { BurndownPoint, HealthScore, SprintIssue } from "@/types";

export function calculateHealthScore(
  burndown: BurndownPoint[],
  issues: SprintIssue[],
  totalPoints: number,
  originalTotalPoints?: number
): HealthScore {
  // Burndown deviation (40% weight)
  const burndownDeviation = calculateBurndownDeviation(burndown, totalPoints);

  // Blocker penalty (30% weight)
  const blockerCount = issues.filter((i) => i.blocked).length;
  const blockerPenalty = Math.min(blockerCount * 10, 30);

  // Bug penalty (20% weight)
  const bugCount = issues.filter(
    (i) => i.issueType.toLowerCase() === "bug" && i.statusCategory !== "Done"
  ).length;
  const bugPenalty = Math.min(bugCount * 5, 20);

  // Scope change penalty (10% weight)
  const scopeChangePenalty = originalTotalPoints
    ? Math.min(
        (Math.abs(totalPoints - originalTotalPoints) / originalTotalPoints) *
          100,
        10
      )
    : 0;

  const score = Math.max(
    0,
    Math.round(
      100 -
        burndownDeviation * 0.4 -
        blockerPenalty * 0.3 -
        bugPenalty * 0.2 -
        scopeChangePenalty * 0.1
    )
  );

  let level: HealthScore["level"];
  if (score >= 75) level = "healthy";
  else if (score >= 50) level = "at-risk";
  else level = "critical";

  return {
    score,
    level,
    factors: {
      burndownDeviation: Math.round(burndownDeviation),
      blockerCount,
      bugCount,
      scopeChange: Math.round(scopeChangePenalty),
    },
  };
}

function calculateBurndownDeviation(
  burndown: BurndownPoint[],
  totalPoints: number
): number {
  if (burndown.length === 0 || totalPoints === 0) return 0;

  const latest = burndown[burndown.length - 1];
  if (!latest) return 0;

  return (Math.abs(latest.actual - latest.ideal) / totalPoints) * 100;
}
