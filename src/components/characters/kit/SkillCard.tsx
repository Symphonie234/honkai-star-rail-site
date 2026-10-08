"use client";

import Image from "next/image";
import { useState } from "react";
import { gameIcon } from "@/lib/images";
import type { KitSkill } from "@/lib/kit";
import { KitDescription } from "./KitDescription";

/** One skill, with a level stepper that fills the description's numbers for that level. */
export function SkillCard({ skill }: { skill: KitSkill }) {
  const [level, setLevel] = useState(skill.normalMaxLevel);
  const leveled = skill.params.length > 1;
  const boosted = level > skill.normalMaxLevel;

  return (
    <article className="glass flex flex-col gap-3 rounded-2xl p-5">
      <header className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[color-mix(in_srgb,var(--c)_55%,transparent)] bg-space">
          <Image src={gameIcon(skill.icon)} alt="" width={32} height={32} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-widest text-[var(--c)] uppercase">
            {skill.typeLabel}
            {skill.tag && <span className="text-muted normal-case tracking-normal"> · {skill.tag}</span>}
          </p>
          <h4 className="font-display text-lg leading-tight font-bold">{skill.name}</h4>
        </div>
        {leveled && (
          <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`${skill.name} level`}>
            <button type="button" aria-label="Lower level" disabled={level <= 1} onClick={() => setLevel((l) => l - 1)}
              className="grid size-7 place-items-center rounded-full border border-line text-muted transition hover:text-ink disabled:opacity-30">−</button>
            <span className="w-14 text-center text-sm tabular-nums" aria-live="polite">
              Lv. <span className={boosted ? "text-violet" : "text-ink"}>{level}</span>
            </span>
            <button type="button" aria-label="Raise level" disabled={level >= skill.maxLevel} onClick={() => setLevel((l) => l + 1)}
              className="grid size-7 place-items-center rounded-full border border-line text-muted transition hover:text-ink disabled:opacity-30">+</button>
          </div>
        )}
      </header>
      <KitDescription desc={skill.desc} params={skill.params[level - 1] ?? skill.params[0]} />
      {leveled && (
        <p className="text-xs text-muted">
          {boosted
            ? `Lv. ${level} needs Eidolon boosts (Traces alone reach Lv. ${skill.normalMaxLevel}).`
            : `Max Lv. ${skill.normalMaxLevel} from Traces · up to Lv. ${skill.maxLevel} with Eidolons.`}
        </p>
      )}
    </article>
  );
}
