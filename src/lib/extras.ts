export type AchievementSeries = { id: string; slug: string; name: string; count: number; jade: number };

export type Achievement = {
  id: string;
  series: string;
  title: string;
  desc: string;
  hidden: boolean;
  rarity: "Low" | "Mid" | "High";
  jade: number;
};

export type Blessing = {
  id: string;
  name: string;
  mode: "Simulated Universe" | "Divergent Universe";
  path: string;
  rarity: "Common" | "Rare" | "Legendary";
  desc: string;
  enhanced: string;
};

export type Curio = { id: string; name: string; desc: string; lore: string; icon: string | null };

export type Occurrence = { id: string; name: string; type: string; image: string };

export type Domain = { id: string; name: string; desc: string; icon: string; color: string };

export const JADE: Record<Achievement["rarity"], number> = { Low: 5, Mid: 10, High: 20 };
