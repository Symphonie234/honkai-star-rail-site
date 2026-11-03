import type { Metadata } from "next";
import { UnitBrowser } from "@/components/currency-wars/UnitBrowser";
import { CURRENCY_WARS } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Currency Wars Units — Cost, Positioning, Bonds",
  description: `All ${CURRENCY_WARS.units.length} Currency Wars units in Honkai: Star Rail, filterable by cost, Bond and on/off-field positioning.`,
  alternates: { canonical: "/currency-wars/units" },
};

export default function UnitsPage() {
  return <UnitBrowser units={CURRENCY_WARS.units} bonds={CURRENCY_WARS.bonds} />;
}
