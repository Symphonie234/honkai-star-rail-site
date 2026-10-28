import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/components/search/SearchPage";

export const metadata: Metadata = {
  title: "Search the Archive",
  description: "Search every Honkai: Star Rail character, Light Cone, relic set, material, enemy, area, Aeon and lore entry in the archive.",
  alternates: { canonical: "/search" },
};

export default function Search() {
  return (
    <div className="mx-auto w-[min(100%-2rem,900px)] py-16">
      <header className="mb-8">
        <p className="eyebrow">Search</p>
        <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Search the archive</h1>
      </header>
      <Suspense fallback={null}>
        <SearchPage />
      </Suspense>
    </div>
  );
}
