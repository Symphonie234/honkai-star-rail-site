/*
 * Source content for the database. Edit here, then run `npm run db:seed`
 * (the seed upserts, so re-running is safe).
 */

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

export const WORLDS = [
  { slug: "herta-space-station", name: "Herta Space Station", releaseVersion: "1.0",
    description: "A research station housing curios from across the cosmos — and the place where the Trailblaze begins." },
  { slug: "jarilo-vi", name: "Jarilo-VI", releaseVersion: "1.0",
    description: "A planet locked in eternal winter, where the last city of Belobog stands against the Fragmentum." },
  { slug: "xianzhou-luofu", name: "The Xianzhou Luofu", releaseVersion: "1.0",
    description: "A colossal starskiff of the Xianzhou Alliance, home to long-lived peoples and ancient secrets." },
  { slug: "penacony", name: "Penacony", releaseVersion: "2.0",
    description: "The Planet of Festivities, where guests drift through a dazzling Dreamscape of endless celebration." },
  { slug: "amphoreus", name: "Amphoreus", releaseVersion: "3.0",
    description: "A world of myth and Titans, where Chrysos Heirs pursue the Flame-Chase to reclaim their gods' fire." },
].map((w, i) => ({ ...w, arcOrder: i + 1 }));

export const FACTIONS = [
  { slug: "astral-express", name: "Astral Express" },
  { slug: "stellaron-hunters", name: "Stellaron Hunters" },
  { slug: "wildfire", name: "Wildfire" },
  { slug: "xianzhou-alliance", name: "Xianzhou Alliance" },
  { slug: "intelligentsia-guild", name: "Intelligentsia Guild" },
  { slug: "genius-society", name: "Genius Society" },
  { slug: "galaxy-rangers", name: "Galaxy Rangers" },
  { slug: "the-family", name: "The Family" },
  { slug: "chrysos-heirs", name: "Chrysos Heirs" },
  { slug: "herta-space-station", name: "Herta Space Station" },
];

type CharacterSeed = {
  slug: string; name: string; rarity: 4 | 5;
  elementSlug: string; pathSlug: string; factionSlug: string | null; worldSlug: string | null;
  releaseVersion: string; spoilerVersion: string | null; bio: string;
};

export const CHARACTERS: CharacterSeed[] = [
  { slug: "trailblazer", name: "Trailblazer", rarity: 5, elementSlug: "physical", pathSlug: "destruction",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A traveler who awoke on the Herta Space Station with a Stellaron sealed within, now walking the Trailblaze aboard the Astral Express." },
  { slug: "march-7th", name: "March 7th", rarity: 4, elementSlug: "ice", pathSlug: "preservation",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A cheerful girl found frozen in drifting ice, searching for clues to her own forgotten past." },
  { slug: "dan-heng", name: "Dan Heng", rarity: 4, elementSlug: "wind", pathSlug: "hunt",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A cool, reserved guard of the Express archives with a past tied to the Xianzhou." },
  { slug: "himeko", name: "Himeko", rarity: 5, elementSlug: "fire", pathSlug: "erudition",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "The navigator who repaired the Astral Express and set it back on the rails among the stars." },
  { slug: "welt", name: "Welt", rarity: 5, elementSlug: "imaginary", pathSlug: "nihility",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A seasoned veteran who once inherited the name of Welt Yang and now travels with the Express." },
  { slug: "kafka", name: "Kafka", rarity: 5, elementSlug: "lightning", pathSlug: "nihility",
    factionSlug: "stellaron-hunters", worldSlug: null, releaseVersion: "1.2", spoilerVersion: null,
    bio: "A calm and elegant Stellaron Hunter who always seems to be one step ahead of everyone else." },
  { slug: "silver-wolf", name: "Silver Wolf", rarity: 5, elementSlug: "quantum", pathSlug: "nihility",
    factionSlug: "stellaron-hunters", worldSlug: null, releaseVersion: "1.1", spoilerVersion: null,
    bio: "A genius hacker who treats the universe like an immersive game to be beaten." },
  { slug: "blade", name: "Blade", rarity: 5, elementSlug: "wind", pathSlug: "destruction",
    factionSlug: "stellaron-hunters", worldSlug: null, releaseVersion: "1.2", spoilerVersion: null,
    bio: "A swordsman cursed with an undying body, seeking an end that never comes." },
  // Her Stellaron Hunter affiliation is a Penacony story reveal.
  { slug: "firefly", name: "Firefly", rarity: 5, elementSlug: "fire", pathSlug: "destruction",
    factionSlug: "stellaron-hunters", worldSlug: "penacony", releaseVersion: "2.3", spoilerVersion: "2.1",
    bio: "A girl bearing a short lifespan who fights for the chance to truly live." },
  { slug: "seele", name: "Seele", rarity: 5, elementSlug: "quantum", pathSlug: "hunt",
    factionSlug: "wildfire", worldSlug: "jarilo-vi", releaseVersion: "1.0", spoilerVersion: null,
    bio: "A sharp-tongued fighter from the Underworld of Belobog, quick as a butterfly." },
  { slug: "jing-yuan", name: "Jing Yuan", rarity: 5, elementSlug: "lightning", pathSlug: "erudition",
    factionSlug: "xianzhou-alliance", worldSlug: "xianzhou-luofu", releaseVersion: "1.0", spoilerVersion: null,
    bio: "The General of the Cloud Knights, seemingly idle yet always in command." },
  { slug: "fu-xuan", name: "Fu Xuan", rarity: 5, elementSlug: "quantum", pathSlug: "preservation",
    factionSlug: "xianzhou-alliance", worldSlug: "xianzhou-luofu", releaseVersion: "1.6", spoilerVersion: null,
    bio: "Master Diviner of the Luofu, who reads fate through the Matrix of Prescience." },
  { slug: "huohuo", name: "Huohuo", rarity: 5, elementSlug: "wind", pathSlug: "abundance",
    factionSlug: "xianzhou-alliance", worldSlug: "xianzhou-luofu", releaseVersion: "1.7", spoilerVersion: null,
    bio: "A timid Foxian Judge-in-training who carries a heliobus named Tail on her tail." },
  { slug: "dr-ratio", name: "Dr. Ratio", rarity: 5, elementSlug: "imaginary", pathSlug: "hunt",
    factionSlug: "intelligentsia-guild", worldSlug: null, releaseVersion: "1.6", spoilerVersion: null,
    bio: "A brilliant scholar who never removes his plaster bust and has no patience for ignorance." },
  { slug: "ruan-mei", name: "Ruan Mei", rarity: 5, elementSlug: "ice", pathSlug: "harmony",
    factionSlug: "genius-society", worldSlug: null, releaseVersion: "1.6", spoilerVersion: null,
    bio: "A member of the Genius Society devoted to unraveling the secrets of life itself." },
  { slug: "acheron", name: "Acheron", rarity: 5, elementSlug: "lightning", pathSlug: "nihility",
    factionSlug: "galaxy-rangers", worldSlug: "penacony", releaseVersion: "2.1", spoilerVersion: null,
    bio: "A self-proclaimed Galaxy Ranger who walks alone, carrying a blade that cuts through sorrow." },
  { slug: "robin", name: "Robin", rarity: 5, elementSlug: "physical", pathSlug: "harmony",
    factionSlug: "the-family", worldSlug: "penacony", releaseVersion: "2.2", spoilerVersion: null,
    bio: "A beloved Halovian singer whose voice resonates across the cosmos." },
  { slug: "aglaea", name: "Aglaea", rarity: 5, elementSlug: "lightning", pathSlug: "remembrance",
    factionSlug: "chrysos-heirs", worldSlug: "amphoreus", releaseVersion: "3.0", spoilerVersion: null,
    bio: "A Chrysos Heir of Amphoreus who weaves fate through threads of gold." },
  { slug: "castorice", name: "Castorice", rarity: 5, elementSlug: "quantum", pathSlug: "remembrance",
    factionSlug: "chrysos-heirs", worldSlug: "amphoreus", releaseVersion: "3.2", spoilerVersion: null,
    bio: "A gentle Chrysos Heir whose touch brings death, accompanied by the great dragon Pollux." },
  { slug: "asta", name: "Asta", rarity: 4, elementSlug: "fire", pathSlug: "harmony",
    factionSlug: "herta-space-station", worldSlug: "herta-space-station", releaseVersion: "1.0", spoilerVersion: null,
    bio: "The lively lead researcher of the Herta Space Station, with an eye for the stars." },
];
