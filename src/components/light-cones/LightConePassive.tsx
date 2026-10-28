"use client";

import { useState } from "react";
import { KitDescription } from "../characters/kit/KitDescription";

export function LightConePassive({
  skill, desc, params, className = "", heading: Heading = "h3",
}: {
  skill: string;
  desc: string;
  params: number[][];
  className?: string;
  heading?: "h3" | "h4";
}) {
  const [rank, setRank] = useState(1);
  const ranks = params.length;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading className="font-display text-xl font-bold">{skill}</Heading>
        {ranks > 1 && (
          <div role="group" aria-label="Superimposition" className="glass flex items-center rounded-full p-1 text-sm">
            {Array.from({ length: ranks }, (_, i) => i + 1).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={rank === r}
                aria-label={`Superimposition ${r}`}
                onClick={() => setRank(r)}
                className="rounded-full px-3 py-1 font-semibold text-muted tabular-nums transition-colors hover:text-ink aria-pressed:bg-gold aria-pressed:text-gold-ink"
              >
                S{r}
              </button>
            ))}
          </div>
        )}
      </div>
      <KitDescription desc={desc} params={params[rank - 1] ?? params[0]} className="mt-3" />
    </div>
  );
}
