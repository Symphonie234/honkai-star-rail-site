import Link from "next/link";
import { getStoryVersions } from "@/lib/queries";
import { HeaderHeight } from "./HeaderHeight";
import { TimeTravelBanner } from "./spoilers/AsOf";
import { StoryProgressPicker } from "./spoilers/story-progress";

const links = [
  { href: "/characters", label: "Characters" },
  { href: "/worlds", label: "Worlds" },
  { href: "/aeons", label: "Aeons" },
  { href: "/versions", label: "Versions" },
  { href: "/glossary", label: "Glossary" },
];

export async function SiteHeader() {
  const versions = await getStoryVersions();

  return (
    <header id="site-header" className="sticky top-0 z-40 border-b border-line bg-space/70 backdrop-blur-md">
      <HeaderHeight targetId="site-header" />
      <div className="mx-auto flex w-[min(100%-2rem,1200px)] flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-wide">
          <span aria-hidden="true" className="text-gold">✦</span>
          Astral Express
        </Link>
        <nav aria-label="Primary" className="order-last -mx-1 flex w-full gap-5 overflow-x-auto px-1 text-sm whitespace-nowrap text-muted sm:order-none sm:ml-auto sm:w-auto sm:gap-6 sm:overflow-visible">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto sm:ml-0">
          <StoryProgressPicker versions={versions} />
        </div>
      </div>
      <TimeTravelBanner versions={versions} />
    </header>
  );
}
