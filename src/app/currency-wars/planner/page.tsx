import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamPlanner } from "@/components/currency-wars/TeamPlanner";
import { CURRENCY_WARS } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Currency Wars Team Planner — Bonds and Recommendations",
  description: "Plan a Honkai: Star Rail Currency Wars lineup: see active Bonds and tiers, get unit recommendations for your level, and the best equipment for each unit.",
  alternates: { canonical: "/currency-wars/planner" },
};

export default function PlannerPage() {
  return (
    <Suspense fallback={null}>
      <TeamPlanner data={CURRENCY_WARS} />
    </Suspense>
  );
}
