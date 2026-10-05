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

// mapX / mapY place each stop on the star map (percent of width / height).
export const WORLDS = [
  { slug: "herta-space-station", name: "Herta Space Station", tagline: "Where the Trailblaze begins",
    releaseVersion: "1.0", color: "cyan", mapX: 10, mapY: 68,
    description: "A research station housing curios from across the cosmos — and the place where the Trailblaze begins." },
  { slug: "jarilo-vi", name: "Jarilo-VI", tagline: "The planet of eternal winter",
    releaseVersion: "1.0", color: "ice", mapX: 29, mapY: 30,
    description: "A planet locked in eternal winter, where the last city of Belobog stands against the Fragmentum." },
  { slug: "xianzhou-luofu", name: "The Xianzhou Luofu", tagline: "A starskiff of the Xianzhou Alliance",
    releaseVersion: "1.0", color: "gold", mapX: 50, mapY: 64,
    description: "A colossal starskiff of the Xianzhou Alliance, home to long-lived peoples and ancient secrets." },
  { slug: "penacony", name: "Penacony", tagline: "The Planet of Festivities",
    releaseVersion: "2.0", color: "violet", mapX: 70, mapY: 26,
    description: "The Planet of Festivities, where guests drift through a dazzling Dreamscape of endless celebration." },
  { slug: "amphoreus", name: "Amphoreus", tagline: "The Eternal Land",
    releaseVersion: "3.0", color: "fire", mapX: 89, mapY: 60,
    description: "A world of myth and Titans, where Chrysos Heirs pursue the Flame-Chase to reclaim their gods' fire." },
].map((w, i) => ({ ...w, arcOrder: i + 1 }));

type ChapterSeed = { title: string; spoilerVersion: string | null; body: string };

// Story recaps, in order per world. The first chapter of each world is setup and
// spoiler-free; later chapters carry the version that reveals them.
const CHAPTERS_BY_WORLD: Record<string, ChapterSeed[]> = {
  "herta-space-station": [
    { title: "Awakening", spoilerVersion: null, body:
`The Trailblaze begins in chaos. The Antimatter Legion has overrun Herta Space Station, and amid the wreckage two Stellaron Hunters — Kafka and Silver Wolf — seal a Stellaron inside a newly awakened traveler, then slip away.

March 7th and Dan Heng of the Astral Express find the stranger. Together with the station's researchers they fight their way through the besieged zones, ending in a clash with the Doomsday Beast.` },
    { title: "All Aboard", spoilerVersion: null, body:
`Himeko, the Express's navigator, offers the traveler a seat aboard — and a choice. The Express follows the Trails once laid by the Aeon Akivili, and a Stellaron, the "cancer of all worlds", is calling from a frozen planet: Jarilo-VI.

The Trailblazer decides to come along.` },
  ],
  "jarilo-vi": [
    { title: "The Last City", spoilerVersion: null, body:
`Jarilo-VI has been buried in an Eternal Freeze for centuries. Its last refuge is Belobog, ruled by the Supreme Guardian Cocolia and defended by the Silvermane Guards.

Outsiders are not welcome. Soon after arriving, the crew are branded intruders and pursued by Silvermane officer Gepard, while Cocolia's daughter Bronya watches them closely.` },
    { title: "The Underworld", spoilerVersion: null, body:
`Beneath the city lies the Underworld, a mining district the Overworld left behind. There the crew find Natasha's clinic, the Wildfire resistance, and Seele — and begin to learn how the spreading Fragmentum is tied to the Stellaron.` },
    { title: "The Supreme Guardian", spoilerVersion: "1.0", body:
`Cocolia, it turns out, has long been listening to the Stellaron's whispers. Convinced that it alone can save Belobog, she turns against her own people and her own daughter.

The Trailblazer, Bronya and their allies confront her at the heart of the Fragmentum. Afterwards Bronya takes up her mother's mantle, and the Overworld and Underworld begin to close the divide between them.` },
  ],
  "xianzhou-luofu": [
    { title: "A Ship in Crisis", spoilerVersion: null, body:
`The Xianzhou Luofu is a vast starskiff of the Alliance — home to long-lived Xianzhou natives, Vidyadhara and Foxians — and it is in trouble. A Stellaron has surfaced aboard, the Stellaron Hunters are on the ship, and mara, the madness that comes with too long a life, haunts its people.

General Jing Yuan of the Cloud Knights enlists the Express crew, while keeping his own counsel about how much he already knows.` },
    { title: "The Ambrosial Arbor", spoilerVersion: "1.0", body:
`The threads lead to Phantylia the Unknowing, a Lord Ravager of the Antimatter Legion who has taken the guise of the Luofu's envoy Tingyun. Her plan is to reawaken the Ambrosial Arbor, a remnant of the Aeon of Abundance, and drown the ship in uncontrolled life.

Along the way Dan Heng's past surfaces: he is the reincarnation of Dan Feng, the Vidyadhara High Elder known as Imbibitor Lunae. In the end Jing Yuan calls down his Lightning-Lord and brings Phantylia down.` },
  ],
  penacony: [
    { title: "The Charmony Festival", spoilerVersion: null, body:
`The Express receives an invitation from the Family to Penacony's Charmony Festival. Once a frontier prison of the IPC, Penacony is now a planet of dreams: guests fall asleep in the Hotel Reverie and wake in a shared Dreamscape of endless celebration.

Among the guests are figures from across the cosmos — the Galaxy Ranger Acheron, the IPC's Aventurine, the Masked Fool Sparkle, and a quiet girl named Firefly.` },
    { title: "A Death in the Dream", spoilerVersion: "2.0", body:
`Death in the Dreamscape should be impossible — dreamers simply wake up. Then Robin, the Halovian singer set to headline the festival, is found dead within the dream.

The Trailblazer's investigation pulls them into the hidden layers of the Dreamscape and the secrets the Family keeps.` },
    { title: "Sunday's Paradise", spoilerVersion: "2.2", body:
`Behind the festival stands Sunday, head of the Oak Family and Robin's brother. Believing people deserve to be shielded from suffering, he plans to seal everyone into an eternal, perfect dream modelled on the ideals of the vanished Aeon of Order.

With allies old and new — among them Firefly, revealed as the Stellaron Hunter Sam — the Trailblazer stands against him.` },
  ],
  amphoreus: [
    { title: "The Flame-Chase", spoilerVersion: null, body:
`Amphoreus is a world of myth, sealed away from the wider cosmos. Its Titans once shaped every part of existence; now many have turned against mortals, and the encroaching Black Tide devours the land.

From the city-state of Okhema, the Chrysos Heirs — Aglaea among them — undertake the Flame-Chase: a journey to claim the Titans' fire and remake the world. The Trailblazer arrives and is drawn into the quest.` },
  ],
};

export const WORLD_CHAPTERS = Object.entries(CHAPTERS_BY_WORLD).flatMap(([worldSlug, chapters]) =>
  chapters.map((c, i) => ({ ...c, slug: `${worldSlug}-${i + 1}`, worldSlug, sortOrder: i + 1 })),
);

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
