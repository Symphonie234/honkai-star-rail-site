import type { Metadata } from "next";
import { InvestmentBrowser } from "@/components/currency-wars/InvestmentBrowser";
import { CURRENCY_WARS } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Currency Wars Investment Strategies & Environments",
  description: `All ${CURRENCY_WARS.strategies.length} Investment Strategies and ${CURRENCY_WARS.environments.length} Investment Environments in Honkai: Star Rail Currency Wars, by quality and Plane.`,
  alternates: { canonical: "/currency-wars/investments" },
};

export default function InvestmentsPage() {
  return <InvestmentBrowser environments={CURRENCY_WARS.environments} strategies={CURRENCY_WARS.strategies} />;
}
