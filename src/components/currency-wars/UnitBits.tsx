import Image from "next/image";
import Link from "next/link";
import { COST_COLOR, type CwUnit } from "@/lib/currency-wars";
import { cwEquipmentImage, cwUnitImage } from "@/lib/images";

export const unitCost = (u: CwUnit) => (u.costs.length ? Math.max(...u.costs) : 0);

export function UnitAvatar({ unit, size = 56, link = true }: { unit: CwUnit; size?: number; link?: boolean }) {
  const cost = unitCost(unit);
  const body = (
    <span className="relative block overflow-hidden rounded-xl border-2 bg-space" style={{ width: size, height: size, borderColor: COST_COLOR[cost] || "var(--color-line)" }}>
      {unit.image && <Image src={cwUnitImage(unit.slug)} alt="" fill sizes={`${size}px`} className="object-cover object-top" />}
      {cost > 0 && (
        <span className="absolute right-0 bottom-0 rounded-tl-md px-1 text-[0.6rem] font-bold text-space" style={{ background: COST_COLOR[cost] }}>
          {unit.costs.length > 1 ? unit.costs.join("/") : cost}
        </span>
      )}
    </span>
  );
  return link ? (
    <Link href={`/currency-wars/units/${unit.slug}`} title={unit.name} className="block shrink-0 transition hover:-translate-y-0.5">{body}</Link>
  ) : body;
}

export function EquipmentIcon({ slug, name, size = 32 }: { slug: string; name: string; size?: number }) {
  return (
    <span title={name} className="grid shrink-0 place-items-center rounded-lg border border-line bg-space" style={{ width: size + 8, height: size + 8 }}>
      <Image src={cwEquipmentImage(slug)} alt={name} width={size} height={size} className="object-contain" />
    </span>
  );
}

export const FIELD_STYLE: Record<CwUnit["field"], string> = {
  "On Field": "border-gold/60 text-gold",
  "Off Field": "border-cyan/60 text-cyan",
  "On/Off Field": "border-violet/60 text-violet",
};
