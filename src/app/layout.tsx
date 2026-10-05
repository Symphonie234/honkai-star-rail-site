import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { Starfield } from "@/components/Starfield";
import "./globals.css";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Astral Express — A Honkai: Star Rail Fan Archive", template: "%s · Astral Express" },
  description: "A fan-made archive of Honkai: Star Rail — characters, Paths, worlds and lore.",
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
          <div className="mx-auto w-[min(100%-2rem,1200px)]">
            Fan-made archive. Honkai: Star Rail and all related names are trademarks of HoYoverse.
          </div>
        </footer>
      </body>
    </html>
  );
}
