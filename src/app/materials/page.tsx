import type { Metadata } from "next";
import { MaterialBrowser } from "@/components/materials/MaterialBrowser";
import { getMaterialList } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Materials — Every Upgrade Material",
  description:
    "Every Honkai: Star Rail upgrade material — character ascension, Trace, Light Cone, EXP and synthesis materials: where to farm " +
    "them, how to synthesize them, their in-game stories, and exactly which characters and Light Cones need how many.",
  alternates: { canonical: "/materials" },
};

export default async function MaterialsPage() {
  const materials = await getMaterialList();
  return (
    <div className="mx-auto w-[min(100%-2rem,1200px)] py-16">
      <header className="mb-10">
        <p className="eyebrow">Inventory</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Materials</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Every upgrade material: where it drops, how to synthesize it, the story on its item card, and who needs it.
        </p>
      </header>
      <MaterialBrowser
        materials={materials.map((m) => ({ slug: m.slug, name: m.name, rarity: m.rarity, category: m.category || "Other", icon: m.icon, description: m.description }))}
      />
    </div>
  );
}
