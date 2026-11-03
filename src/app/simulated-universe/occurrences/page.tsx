import type { Metadata } from "next";
import { OccurrenceBrowser } from "@/components/extras/CurioOccurrenceBrowsers";
import { OCCURRENCES } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Simulated Universe Occurrences",
  description: `All ${OCCURRENCES.length} Simulated Universe Occurrences in Honkai: Star Rail, with their in-game art — Aeon encounters, deals, secrets and more.`,
  alternates: { canonical: "/simulated-universe/occurrences" },
};

export default function OccurrencesPage() {
  return <OccurrenceBrowser occurrences={OCCURRENCES} />;
}
