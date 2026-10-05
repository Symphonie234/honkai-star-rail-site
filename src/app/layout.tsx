import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { Starfield } from "@/components/Starfield";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description:
    "A fan-made, spoiler-aware Honkai: Star Rail archive: every playable character through the Amphoreus era, " +
    "the Aeons and their lore, the worlds of the Trailblaze, and a version-by-version timeline.",
  applicationName: SITE_NAME,
  keywords: ["Honkai: Star Rail", "HSR", "characters", "Aeons", "Paths", "lore", "Amphoreus", "Penacony", "Trailblaze"],
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0b0f24" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <Starfield />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line py-8 text-sm text-muted">
          <div className="mx-auto flex w-[min(100%-2rem,1200px)] flex-col gap-1">
            <p>Fan-made, non-commercial archive. Honkai: Star Rail and all related names and art are © HoYoverse.</p>
            <p>
              Character and Path art via{" "}
              <a href="https://github.com/Mar-7th/StarRailRes" className="underline underline-offset-2 hover:text-ink">
                StarRailRes
              </a>
              ; world art via the{" "}
              <a href="https://honkai-star-rail.fandom.com/" className="underline underline-offset-2 hover:text-ink">
                Honkai: Star Rail Wiki
              </a>
              .
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
