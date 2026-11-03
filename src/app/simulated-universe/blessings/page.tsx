import type { Metadata } from "next";
import { BlessingBrowser } from "@/components/extras/BlessingBrowser";
import { BLESSINGS } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Simulated Universe Blessings — Every Path",
  description: `All ${BLESSINGS.length} Simulated Universe and Divergent Universe Blessings in Honkai: Star Rail, by Path and rarity, with enhanced effects.`,
  alternates: { canonical: "/simulated-universe/blessings" },
};

export default function BlessingsPage() {
  return <BlessingBrowser blessings={BLESSINGS} />;
}
