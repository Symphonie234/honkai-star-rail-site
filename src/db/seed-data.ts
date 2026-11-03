import { worldImage } from "../lib/images";
import type { CharacterSeed } from "./data/characters";
import type { ArtVariant } from "./schema";

export { AEON_LORE, AEONS } from "./data/aeons";
export { CHARACTERS } from "./data/characters";
export { WORLD_CHAPTERS } from "./data/story";
export { VERSIONS } from "./data/versions";

import kitsFile from "./data/game/kits.json";
import areasFile from "./data/game/areas.json";
import enemiesFile from "./data/game/enemies.json";
import lightConesFile from "./data/game/light-cones.json";
import relicsFile from "./data/game/relics.json";
import achievementsFile from "./data/game/achievements.json";
import simulatedFile from "./data/game/simulated.json";
import materialsFile from "./data/game/materials.json";
import type { Kit, Material } from "../lib/kit";
import type { Area } from "../lib/area";
import type { Enemy } from "../lib/enemy";
import type { LightCone } from "../lib/light-cone";
import type { RelicSet, RelicStats } from "../lib/relic";
import type { Achievement, AchievementSeries, Blessing, Curio, Domain, Occurrence } from "../lib/extras";
export const KITS = kitsFile.kits as unknown as Record<string, Kit>;
export const MATERIALS = materialsFile.materials as Material[];
export const LIGHT_CONES = lightConesFile.lightCones as unknown as LightCone[];
export const RELIC_SETS = relicsFile.relics as unknown as RelicSet[];
export const RELIC_STATS = relicsFile.stats as unknown as RelicStats;
export const AREAS = areasFile.areas as unknown as Area[];
export const ENEMIES = enemiesFile.enemies as unknown as Enemy[];
export const ACHIEVEMENT_SERIES = achievementsFile.series as AchievementSeries[];
export const ACHIEVEMENTS = achievementsFile.achievements as Achievement[];
export const BLESSINGS = simulatedFile.blessings as Blessing[];
export const CURIOS = simulatedFile.curios as Curio[];
export const OCCURRENCES = simulatedFile.occurrences as Occurrence[];
export const DOMAINS = simulatedFile.domains as Domain[];

export const PATHS = [
  { slug: "destruction", name: "Destruction", icon: "✸", aeon: "Nanook",
    blurb: "Those who walk Destruction wield overwhelming power, trading safety for raw strength. Durable frontliners who deal heavy damage." },
  { slug: "hunt", name: "The Hunt", icon: "➹", aeon: "Lan",
    blurb: "Hunters pursue a single target with relentless precision, specializing in powerful single-target damage." },
  { slug: "erudition", name: "Erudition", icon: "✧", aeon: "Nous",
    blurb: "Seekers of knowledge who unleash attacks across the whole field, excelling against groups of enemies." },
  { slug: "harmony", name: "Harmony", icon: "♫", aeon: "Xipe",
    blurb: "Harmony unites many voices into one, empowering allies with buffs that amplify the whole team." },
  { slug: "nihility", name: "Nihility", icon: "◌", aeon: "IX",
    blurb: "Followers of Nihility weaken their foes with debuffs and damage over time, turning entropy into a weapon." },
  { slug: "preservation", name: "Preservation", icon: "⛨", aeon: "Qlipoth",
    blurb: "Guardians of Preservation shield their allies, absorbing harm so the team can endure." },
  { slug: "abundance", name: "Abundance", icon: "❀", aeon: "Yaoshi",
    blurb: "Abundance restores and sustains. Healers who keep the team standing through any battle." },
  { slug: "remembrance", name: "Remembrance", icon: "❖", aeon: "Fuli",
    blurb: "Keepers of Remembrance summon memosprites — companions forged from memory — to fight alongside them." },
  { slug: "elation", name: "Elation", icon: "✺", aeon: "Aha",
    blurb: "The Path of Aha, the laughing Aeon. Its followers chase joy and spectacle, and turn every battle into a stage." },
].map((p, i) => ({ ...p, sortOrder: i }));

export const ELEMENTS = [
  { slug: "physical", name: "Physical", description: "Bleed — damage based on the target's max HP." },
  { slug: "fire", name: "Fire", description: "Burn — deals Fire damage over time." },
  { slug: "ice", name: "Ice", description: "Freeze — target is frozen and skips its turn." },
  { slug: "lightning", name: "Lightning", description: "Shock — deals Lightning damage over time." },
  { slug: "wind", name: "Wind", description: "Wind Shear — stacking damage over time." },
  { slug: "quantum", name: "Quantum", description: "Entanglement — delays the target's action." },
  { slug: "imaginary", name: "Imaginary", description: "Imprisonment — delays and slows the target." },
].map((e, i) => ({ ...e, sortOrder: i }));

export const WORLD_ART_SOURCES: Record<string, string> = {
  "herta-space-station": "World_Herta_Space_Station.png",
  "jarilo-vi": "World_Jarilo-VI.png",
  "xianzhou-luofu": "World_The_Xianzhou_Luofu.png",
  penacony: "World_Penacony.png",
  amphoreus: "World_Amphoreus.png",
  planarcadia: "World_Planarcadia.png",
  astropolis: "World_Astropolis.png",
};

export const WORLDS = [
  { slug: "herta-space-station", name: "Herta Space Station", tagline: "Where the Trailblaze begins",
    releaseVersion: "1.0", color: "cyan", mapX: 8, mapY: 70,
    description: "A research station housing curios from across the cosmos — and the place where the Trailblaze begins." },
  { slug: "jarilo-vi", name: "Jarilo-VI", tagline: "The planet of eternal winter",
    releaseVersion: "1.0", color: "ice", mapX: 22, mapY: 30,
    description: "A planet locked in eternal winter, where the last city of Belobog stands against the Fragmentum." },
  { slug: "xianzhou-luofu", name: "The Xianzhou Luofu", tagline: "A starskiff of the Xianzhou Alliance",
    releaseVersion: "1.0", color: "gold", mapX: 36, mapY: 66,
    description: "A colossal starskiff of the Xianzhou Alliance, home to long-lived peoples and ancient secrets." },
  { slug: "penacony", name: "Penacony", tagline: "The Planet of Festivities",
    releaseVersion: "2.0", color: "violet", mapX: 50, mapY: 28,
    description: "The Planet of Festivities, where guests drift through a dazzling Dreamscape of endless celebration." },
  { slug: "amphoreus", name: "Amphoreus", tagline: "The Eternal Land",
    releaseVersion: "3.0", color: "fire", mapX: 64, mapY: 66,
    description: "A world of myth and Titans, where Chrysos Heirs pursue the Flame-Chase to reclaim their gods' fire." },
  { slug: "planarcadia", name: "Planarcadia", tagline: "The arcadia of Elation",
    releaseVersion: "4.0", color: "lightning", mapX: 78, mapY: 30,
    description: "Himeko's homeland, a world restored from a painted scroll and famed for entertainment, where the Phantasmoon Games grant their victor one minute of an Aeon's power." },
  { slug: "astropolis", name: "Astropolis", tagline: "The City of Converging Stars",
    releaseVersion: "4.5", color: "wind", mapX: 92, mapY: 66,
    description: "The IPC's resort megastructure and headquarters of Interastral Peace Entertainment: beaches, motorsports, cinema and influencers, bankrolled by staggering sums." },
].map((w, i) => ({ ...w, arcOrder: i + 1, image: WORLD_ART_SOURCES[w.slug] ? worldImage(w.slug) : null }));

export const FACTIONS = [
  { slug: "astral-express", name: "Astral Express", introducedVersion: "1.0", aeonSlug: "akivili",
    description: "The crew of the train once ridden by Akivili, travelling the star rails on the Trailblaze." },
  { slug: "stellaron-hunters", name: "Stellaron Hunters", introducedVersion: "1.0", aeonSlug: null,
    description: "Wanted fugitives led by Elio, following a script that seems to foresee the future." },
  { slug: "wildfire", name: "Wildfire", introducedVersion: "1.0", aeonSlug: null,
    description: "The resistance of Belobog's Underworld on Jarilo-VI." },
  { slug: "xianzhou-alliance", name: "Xianzhou Alliance", introducedVersion: "1.0", aeonSlug: "lan",
    description: "A fleet of colossal starskiffs devoted to Lan, waging an ancient war against the Abundance." },
  { slug: "intelligentsia-guild", name: "Intelligentsia Guild", introducedVersion: "1.6", aeonSlug: "nous",
    description: "A scholarly guild walking the Path of Erudition." },
  { slug: "genius-society", name: "Genius Society", introducedVersion: "1.0", aeonSlug: "nous",
    description: "An exclusive circle of geniuses recognized by Nous, the Aeon of Erudition." },
  { slug: "galaxy-rangers", name: "Galaxy Rangers", introducedVersion: "2.0", aeonSlug: null,
    description: "Wanderers who roam the cosmos righting wrongs." },
  { slug: "the-family", name: "The Family", introducedVersion: "2.0", aeonSlug: "xipe",
    description: "The alliance of clans that governs Penacony, devoted to Xipe, the Aeon of Harmony." },
  { slug: "chrysos-heirs", name: "Chrysos Heirs", introducedVersion: "3.0", aeonSlug: null,
    description: "Heroes of Amphoreus chosen to undertake the Flame-Chase." },
  { slug: "herta-space-station", name: "Herta Space Station", introducedVersion: "1.0", aeonSlug: null,
    description: "The research station of Herta, a member of the Genius Society." },
  { slug: "ipc", name: "Interastral Peace Corporation", introducedVersion: "1.0", aeonSlug: "qlipoth",
    description: "A vast interstellar trading power that reveres Qlipoth, the Aeon of Preservation." },
  { slug: "antimatter-legion", name: "Antimatter Legion", introducedVersion: "1.0", aeonSlug: "nanook",
    description: "The endless armies of Nanook, bent on wiping out all life." },
  { slug: "masked-fools", name: "Masked Fools", introducedVersion: "1.0", aeonSlug: "aha",
    description: "Jesters who follow Aha, the Aeon of Elation, seeking amusement above all else." },
  { slug: "belobog", name: "Belobog", introducedVersion: "1.0", aeonSlug: "qlipoth",
    description: "The last city of Jarilo-VI, split between the Overworld and the Underworld, whose people revere Qlipoth." },
  { slug: "silvermane-guards", name: "Silvermane Guards", introducedVersion: "1.0", aeonSlug: null,
    description: "Belobog's army, sworn to defend the last city against the Fragmentum." },
  { slug: "garden-of-recollection", name: "Garden of Recollection", introducedVersion: "2.0", aeonSlug: "fuli",
    description: "Home of the Memokeepers, who serve Fuli by gathering and preserving memories." },
  { slug: "knights-of-beauty", name: "Knights of Beauty", introducedVersion: "1.5", aeonSlug: "idrila",
    description: "Wandering knights who spread the glory of Idrila, the vanished Aeon of Beauty." },
];

export const artOf = (c: CharacterSeed): ArtVariant[] =>
  typeof c.art === "string" ? [{ label: c.name, gameId: c.art }] : (c.art ?? []);

const TERM_VERSIONS: Record<string, string> = { "dreamscape": "2.0", "the-family": "2.0", "memokeeper": "2.0", "self-annihilator": "2.1", "memosprite": "3.0", "titans": "3.0", "chrysos-heirs": "3.0", "flame-chase": "3.0", "black-tide": "3.0",
  "phantasmoon-games": "4.0", "imagenae": "4.0", "supplicant": "4.0", "wishpower": "4.0", "voracity": "4.2" };

export const GLOSSARY = [
  { slug: "stellaron", term: "Stellaron", aliases: [], spoilerVersion: null,
    definition: "A mysterious seed of calamity that brings disaster to any world it lands on. The Genius Society calls it \"the cancer of all worlds\"." },
  { slug: "aeon", term: "Aeon", aliases: [], spoilerVersion: null,
    definition: "God-like beings who each embody a single concept — Destruction, Preservation, Erudition and more. Their will shapes the universe and gives rise to the Paths." },
  { slug: "path", term: "Path", aliases: ["Pathstrider"], spoilerVersion: null,
    definition: "The road of an Aeon's concept. Those who walk a Path — Pathstriders — draw power from the Aeon who embodies it." },
  { slug: "emanator", term: "Emanator", aliases: [], spoilerVersion: null,
    definition: "A being granted a share of power directly by an Aeon, making them that Aeon's living instrument." },
  { slug: "trailblaze", term: "Trailblaze", aliases: ["Trailblazing"], spoilerVersion: null,
    definition: "The Path of the Aeon Akivili, who laid the star rails between worlds. The Astral Express follows it still." },
  { slug: "akivili", term: "Akivili", aliases: [], spoilerVersion: null,
    definition: "The Aeon of the Trailblaze, who opened the star rails and travelled aboard the Astral Express. Akivili is said to have perished long ago." },
  { slug: "astral-express", term: "Astral Express", aliases: [], spoilerVersion: null,
    definition: "The star-faring train once ridden by Akivili. Repaired by Himeko, it now carries a new crew along the Trailblaze." },
  { slug: "antimatter-legion", term: "Antimatter Legion", aliases: [], spoilerVersion: null,
    definition: "The endless armies of Nanook, the Aeon of Destruction, bent on wiping out all life." },
  { slug: "lord-ravager", term: "Lord Ravager", aliases: [], spoilerVersion: null,
    definition: "A commander of the Antimatter Legion and an Emanator of Destruction." },
  { slug: "stellaron-hunters", term: "Stellaron Hunters", aliases: ["Stellaron Hunter"], spoilerVersion: null,
    definition: "A small band of wanted fugitives led by Elio, who follow a \"script\" that seems to foresee the future." },
  { slug: "ipc", term: "Interastral Peace Corporation", aliases: ["IPC"], spoilerVersion: null,
    definition: "A vast interstellar trading power that reveres Qlipoth, the Aeon of Preservation, and reaches into nearly every corner of the cosmos." },
  { slug: "genius-society", term: "Genius Society", aliases: [], spoilerVersion: null,
    definition: "An exclusive circle of geniuses recognized by Nous, the Aeon of Erudition. Herta and Ruan Mei are members." },
  { slug: "fragmentum", term: "Fragmentum", aliases: [], spoilerVersion: null,
    definition: "Space corroded by a Stellaron, where reality breaks apart and monsters roam." },
  { slug: "silvermane-guards", term: "Silvermane Guards", aliases: [], spoilerVersion: null,
    definition: "The army of Belobog on Jarilo-VI, sworn to defend the last city." },
  { slug: "mara", term: "Mara", aliases: ["mara-struck"], spoilerVersion: null,
    definition: "An affliction of the long-lived Xianzhou peoples: after too long a life, mind and body begin to warp beyond recognition." },
  { slug: "vidyadhara", term: "Vidyadhara", aliases: [], spoilerVersion: null,
    definition: "A dragon-descended people of the Xianzhou who do not truly die, but are reborn from eggs into new lives." },
  { slug: "cloud-knights", term: "Cloud Knights", aliases: [], spoilerVersion: null,
    definition: "The Xianzhou Alliance's military, led on the Luofu by General Jing Yuan." },
  { slug: "dreamscape", term: "Dreamscape", aliases: [], spoilerVersion: null,
    definition: "Penacony's shared dream world, entered by falling asleep in the Hotel Reverie." },
  { slug: "the-family", term: "the Family", aliases: [], spoilerVersion: null,
    definition: "The alliance of clans that governs Penacony and hosts the Charmony Festival, devoted to Xipe, the Aeon of Harmony." },
  { slug: "memosprite", term: "Memosprite", aliases: [], spoilerVersion: null,
    definition: "A companion conjured from memory that fights alongside Remembrance characters." },
  { slug: "titans", term: "Titan", aliases: [], spoilerVersion: null,
    definition: "The godlike beings of Amphoreus who, in its myths, shaped every part of the world." },
  { slug: "chrysos-heirs", term: "Chrysos Heirs", aliases: ["Chrysos Heir"], spoilerVersion: null,
    definition: "Heroes of Amphoreus chosen to undertake the Flame-Chase." },
  { slug: "flame-chase", term: "Flame-Chase", aliases: [], spoilerVersion: null,
    definition: "Amphoreus's great quest to take back the Titans' fire and remake the world." },
  { slug: "swarm-disaster", term: "Swarm Disaster", aliases: [], spoilerVersion: null,
    definition: "The ancient catastrophe in which Tayzzyronth and the Swarm spread across the universe, until several Aeons joined forces to seal it." },
  { slug: "memokeeper", term: "Memokeeper", aliases: [], spoilerVersion: null,
    definition: "A follower of Fuli from the Garden of Recollection who has shed their body to live on as a being of memory." },
  { slug: "amber-era", term: "Amber Era", aliases: ["AE"], spoilerVersion: null,
    definition: "The cosmic calendar era, which begins anew each time Qlipoth brings down its hammer." },
  { slug: "voidranger", term: "Voidranger", aliases: [], spoilerVersion: null,
    definition: "The rank-and-file monsters of the Antimatter Legion." },
  { slug: "self-annihilator", term: "Self-Annihilator", aliases: [], spoilerVersion: null,
    definition: "Someone who has entered a Shadow of IX and lost the meaning of their own existence." },
  { slug: "the-nameless", term: "the Nameless", aliases: [], spoilerVersion: null,
    definition: "Akivili's travelling companions — and everyone since who has ridden the Astral Express along the Trailblaze." },
  { slug: "black-tide", term: "Black Tide", aliases: [], spoilerVersion: null,
    definition: "A corrupting tide that is steadily swallowing the lands of Amphoreus." },
  { slug: "phantasmoon-games", term: "Phantasmoon Games", aliases: ["Phantasmoon"], spoilerVersion: null,
    definition: "Planarcadia's contest held under the full Phantasmoon. Its victor is granted an audience with Aha, the Aeon of Elation, and one minute of THEIR authority." },
  { slug: "imagenae", term: "Imagenae", aliases: ["imagenated"], spoilerVersion: null,
    definition: "Beings and places brought to life from images — the living art that fills Planarcadia." },
  { slug: "supplicant", term: "Supplicant", aliases: ["Supplicants"], spoilerVersion: null,
    definition: "One of the eight contestants of the Phantasmoon Games, each chosen by a Mask of Elation." },
  { slug: "wishpower", term: "Wishpower", aliases: [], spoilerVersion: null,
    definition: "Power drawn from the wishes and attention of the masses, which Supplicants compete to gather in the Phantasmoon Games." },
  { slug: "voracity", term: "Voracity", aliases: [], spoilerVersion: "4.2",
    definition: "The Path of Oroboros, an Aeon of insatiable hunger. Oroboros's remains were sealed beneath Planarcadia by the Phantasmoon Games." },
].map((g) => ({ ...g, version: TERM_VERSIONS[g.slug] ?? "1.0" }));
