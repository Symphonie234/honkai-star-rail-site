import Link from "next/link";
import { getStoryVersions } from "@/lib/queries";
import { HeaderHeight } from "./HeaderHeight";
import { NavMenu, type NavLink } from "./NavMenu";
import { SearchButton } from "./search/SearchPalette";
import { TimeTravelBanner } from "./spoilers/AsOf";
import { StoryProgressPicker } from "./spoilers/story-progress";

const DATABASE: NavLink[] = [
  { href: "/characters", label: "Characters", blurb: "Every playable character, kits and Eidolons" },
  { href: "/light-cones", label: "Light Cones", blurb: "Passives, stats and stories" },
  { href: "/relics", label: "Relics & Ornaments", blurb: "Set bonuses, pieces and stat rolls" },
  { href: "/materials", label: "Materials", blurb: "Where to farm them and who needs them" },
  { href: "/enemies", label: "Enemies", blurb: "Weaknesses, resistances and lore" },
  { href: "/achievements", label: "Achievements", blurb: "Every series, reward and hidden one" },
  { href: "/simulated-universe", label: "Simulated Universe", blurb: "Blessings, Curios and Occurrences" },
  { href: "/currency-wars", label: "Currency Wars", blurb: "Units, Bonds, equipment and a team planner" },
];

const LORE: NavLink[] = [
  { href: "/worlds", label: "Worlds & Maps", blurb: "Star map, areas, in-game maps and story" },
  { href: "/aeons", label: "Aeons & Paths", blurb: "The gods of the cosmos and who follows them" },
  { href: "/versions", label: "Versions", blurb: "Every update, 1.0 to today" },
  { href: "/glossary", label: "Glossary", blurb: "Lore terms, explained" },
];

export async function SiteHeader() {
  const versions = await getStoryVersions();

  return (
    <header id="site-header" className="sticky top-0 z-40 border-b border-line bg-space/70 backdrop-blur-md">
      <HeaderHeight targetId="site-header" />
      <div className="mx-auto flex w-[min(100%-2rem,1200px)] flex-wrap items-center gap-x-3 gap-y-2 py-3 lg:h-16 lg:flex-nowrap lg:gap-x-4 lg:py-0">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-wide">
          <span aria-hidden="true" className="text-gold">✦</span>
          Astral Express
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden items-center text-sm text-muted lg:flex">
          <NavMenu label="Database" links={DATABASE} />
          <NavMenu label="Lore" links={LORE} />
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <SearchButton />
          <StoryProgressPicker versions={versions} />
        </div>
        <nav aria-label="Sections" className="order-last -mx-1 flex w-full gap-5 overflow-x-auto px-1 pb-1 text-sm whitespace-nowrap text-muted lg:hidden">
          {[...DATABASE, ...LORE].map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">{l.label}</Link>
          ))}
        </nav>
      </div>
      <TimeTravelBanner versions={versions} />
    </header>
  );
}
