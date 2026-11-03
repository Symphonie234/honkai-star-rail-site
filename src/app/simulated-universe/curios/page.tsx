import type { Metadata } from "next";
import { CurioBrowser } from "@/components/extras/CurioOccurrenceBrowsers";
import { CURIOS } from "@/db/seed-data";

export const metadata: Metadata = {
  title: "Simulated Universe Curios — Effects and Lore",
  description: `All ${CURIOS.length} Simulated Universe Curios in Honkai: Star Rail: what each one does and the story behind it.`,
  alternates: { canonical: "/simulated-universe/curios" },
};

export default function CuriosPage() {
  return <CurioBrowser curios={CURIOS} />;
}
