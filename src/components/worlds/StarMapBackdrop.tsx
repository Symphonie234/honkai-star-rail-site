type BackdropWorld = { slug: string; color: string; mapX: number; mapY: number };

const W = 100;
const H = 56.25;

function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

const STARS = (() => {
  const rand = seeded(20230426);
  return Array.from({ length: 170 }, (_, i) => ({
    id: i,
    x: round(rand() * W),
    y: round(rand() * H),
    r: round(0.04 + rand() ** 3 * 0.16),
    gold: rand() < 0.1,
    twinkle: rand() < 0.35,
    delay: round(rand() * 6),
  }));
})();

export function StarMapBackdrop({ worlds }: { worlds: BackdropWorld[] }) {
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="bd-base" cx="50%" cy="45%" r="75%">
            <stop offset="0" stopColor="#16204a" />
            <stop offset="0.6" stopColor="#0d1330" />
            <stop offset="1" stopColor="#070a1c" />
          </radialGradient>
          <linearGradient id="bd-band" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#6fd3ff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#a98bff" stopOpacity="0.24" />
            <stop offset="0.55" stopColor="#6fd3ff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#a98bff" stopOpacity="0" />
          </linearGradient>
          {worlds.map((w) => (
            <radialGradient key={w.slug} id={`bd-neb-${w.slug}`}>
              <stop offset="0" style={{ stopColor: `var(--color-${w.color})` }} stopOpacity="0.8" />
              <stop offset="0.45" style={{ stopColor: `var(--color-${w.color})` }} stopOpacity="0.3" />
              <stop offset="1" style={{ stopColor: `var(--color-${w.color})` }} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="bd-cloud" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="7" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.9 -0.4" result="mask" />
            <feComposite in="SourceGraphic" in2="mask" operator="in" result="cloud" />
            <feGaussianBlur in="cloud" stdDeviation="0.6" />
          </filter>
          <radialGradient id="bd-vignette" cx="50%" cy="50%" r="72%">
            <stop offset="0.6" stopColor="#070a1c" stopOpacity="0" />
            <stop offset="1" stopColor="#070a1c" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#bd-base)" />
        <ellipse cx={W / 2} cy={H / 2} rx={W * 0.75} ry={H * 0.2} fill="url(#bd-band)" transform={`rotate(-18 ${W / 2} ${H / 2})`} filter="url(#bd-cloud)" />
        <g filter="url(#bd-cloud)">
          {worlds.map((w) => (
            <ellipse key={w.slug} cx={(w.mapX / 100) * W} cy={(w.mapY / 100) * H} rx="19" ry="13" fill={`url(#bd-neb-${w.slug})`} />
          ))}
        </g>

        <g fill="none" stroke="#a7b0d6" strokeWidth="0.08">
          {[18, 30, 44, 60].map((r) => (
            <circle key={r} cx={W * 0.5} cy={H * 1.15} r={r} strokeOpacity="0.09" strokeDasharray="0.4 0.9" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} strokeOpacity="0.04" />
          ))}
          {[11.25, 22.5, 33.75, 45].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} strokeOpacity="0.04" />
          ))}
        </g>
        <rect width={W} height={H} fill="url(#bd-vignette)" />
      </svg>

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {STARS.map((s) => (
          <circle
            key={s.id}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.gold ? "#f3d58a" : "#e6ecff"}
            opacity={s.twinkle ? undefined : 0.7}
            className={s.twinkle ? "motion-safe:animate-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
          />
        ))}
      </svg>
    </>
  );
}
