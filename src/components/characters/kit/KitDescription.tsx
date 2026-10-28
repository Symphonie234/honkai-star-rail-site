import { fillDescription } from "@/lib/kit";

export function KitDescription({ desc, params, className = "" }: { desc: string; params?: number[]; className?: string }) {
  return (
    <p className={`leading-relaxed whitespace-pre-line text-muted ${className}`}>
      {fillDescription(desc, params).map((part, i) =>
        typeof part === "string" ? part : <strong key={i} className="font-semibold text-gold-strong tabular-nums">{part.value}</strong>,
      )}
    </p>
  );
}
