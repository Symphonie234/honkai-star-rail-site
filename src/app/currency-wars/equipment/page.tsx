import type { Metadata } from "next";
import { EquipmentIcon, UnitAvatar } from "@/components/currency-wars/UnitBits";
import { GameText } from "@/components/GameText";
import { CURRENCY_WARS } from "@/db/seed-data";

const cw = CURRENCY_WARS;

export const metadata: Metadata = {
  title: "Currency Wars Equipment — Every Recipe",
  description: "Every Currency Wars equipment recipe in Honkai: Star Rail at a glance: which two basic items make each advanced item, its effect and who wants it.",
  alternates: { canonical: "/currency-wars/equipment" },
};

export default function EquipmentPage() {
  const basics = cw.equipment.filter((e) => e.category === "Basic");
  const advanced = cw.equipment.filter((e) => e.category === "Advanced");
  const recipeOf = (a: string, b: string) => advanced.find((e) => e.recipe.length === 2 && ((e.recipe[0] === a && e.recipe[1] === b) || (e.recipe[0] === b && e.recipe[1] === a)));
  const others = [...new Set(cw.equipment.map((e) => e.category))].filter((c) => c !== "Basic" && c !== "Advanced");

  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="chart">
        <h2 id="chart" className="font-display text-2xl font-bold sm:text-3xl">Recipe chart</h2>
        <p className="mt-2 text-muted">Combine the basic item in a row with the one in a column. Hover a result for its name.</p>
        <div className="glass mt-6 overflow-x-auto rounded-2xl p-3">
          <table className="mx-auto border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th scope="col" />
                {basics.map((b) => <th key={b.slug} scope="col"><EquipmentIcon slug={b.slug} name={b.name} size={32} /></th>)}
              </tr>
            </thead>
            <tbody>
              {basics.map((row) => (
                <tr key={row.slug}>
                  <th scope="row"><EquipmentIcon slug={row.slug} name={row.name} size={32} /></th>
                  {basics.map((col) => {
                    const r = recipeOf(row.name, col.name);
                    return (
                      <td key={col.slug}>
                        {r ? <a href={`#${r.slug}`}><EquipmentIcon slug={r.slug} name={`${r.name} = ${row.name} + ${col.name}`} size={32} /></a> : <span className="block size-10" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="basic">
        <h2 id="basic" className="font-display text-2xl font-bold sm:text-3xl">Basic equipment</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {basics.map((e) => (
            <li key={e.slug} id={e.slug} className="glass flex scroll-mt-28 items-center gap-3 rounded-2xl p-3">
              <EquipmentIcon slug={e.slug} name={e.name} size={36} />
              <span><span className="block font-semibold">{e.name}</span><span className="text-xs text-muted">{e.stats}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="advanced">
        <h2 id="advanced" className="font-display text-2xl font-bold sm:text-3xl">Advanced equipment</h2>
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {advanced.map((e) => (
            <li key={e.slug} id={e.slug} className="glass scroll-mt-28 rounded-2xl p-4 target:ring-2 target:ring-gold">
              <div className="flex items-center gap-3">
                <EquipmentIcon slug={e.slug} name={e.name} size={40} />
                <div className="min-w-0">
                  <h3 className="font-semibold">{e.name}</h3>
                  <p className="text-xs text-muted">{e.tags.join(" · ")}</p>
                </div>
                {e.recipe.length === 2 && <span className="ml-auto text-right text-xs text-muted">{e.recipe.join(" + ")}</span>}
              </div>
              <GameText text={e.stats} className="mt-2 gap-1 text-xs text-gold" />
              <GameText text={e.effect} className="mt-2 text-sm text-muted" />
              {e.users.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Best on">
                  {e.users.map((n) => cw.units.find((u) => u.name === n)).filter((u) => !!u).map((u) => <li key={u.slug}><UnitAvatar unit={u} size={36} /></li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      {others.map((cat) => (
        <section key={cat} aria-label={cat}>
          <h2 className="font-display text-2xl font-bold">{cat}</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {cw.equipment.filter((e) => e.category === cat).map((e) => (
              <li key={e.slug} id={e.slug} className="glass flex scroll-mt-28 gap-3 rounded-2xl p-3">
                <EquipmentIcon slug={e.slug} name={e.name} size={36} />
                <div className="min-w-0">
                  <h3 className="font-semibold">{e.name}</h3>
                  <GameText text={e.effect || e.stats} className="mt-1 text-sm text-muted" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
