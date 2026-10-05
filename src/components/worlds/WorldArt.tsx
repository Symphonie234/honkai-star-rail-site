import Image from "next/image";

/**
 * A world's in-game star chart render, glowing in the world's color (--c), or a
 * drawn planet when the world has no art. Hover effects key off a parent `group`.
 */
export function WorldArt({
  image, size, sizes, float = false, priority = false,
}: {
  image: string | null;
  /** Tailwind size classes for the square frame, e.g. "size-24". */
  size: string;
  /** next/image `sizes`, matching the frame's rendered width. */
  sizes: string;
  /** Gently bob up and down (skipped for reduced motion). */
  float?: boolean;
  priority?: boolean;
}) {
  if (!image) return <Planet size={size} />;

  return (
    <span aria-hidden="true" className={`relative block ${size} ${float ? "motion-safe:animate-float" : ""}`}>
      <Image
        src={image}
        alt=""
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="object-contain drop-shadow-[0_0_18px_color-mix(in_srgb,var(--c)_55%,transparent)] transition duration-500 ease-out-expo group-hover:scale-110 group-hover:drop-shadow-[0_0_28px_var(--c)]"
      />
    </span>
  );
}

/** A glowing planet in the world's color, with an orbit ring that spins on hover. */
export function Planet({ size = "size-12 lg:size-14" }: { size?: string }) {
  return (
    <span aria-hidden="true" className={`relative grid place-items-center ${size}`}>
      <span className="absolute inset-[-35%] rounded-full border border-[color-mix(in_srgb,var(--c)_40%,transparent)] transition-transform duration-700 ease-out-expo [transform:rotateX(70deg)] group-hover:[transform:rotateX(70deg)_rotateZ(180deg)_scale(1.1)]" />
      <span className="size-full rounded-full bg-[radial-gradient(circle_at_30%_30%,white,var(--c)_35%,color-mix(in_srgb,var(--c)_30%,black)_100%)] shadow-[0_0_24px_var(--c)] transition-transform duration-500 ease-out-expo group-hover:scale-110" />
    </span>
  );
}
