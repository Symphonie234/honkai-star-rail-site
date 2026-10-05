import { worldImage } from "../lib/images";
import type { ArtVariant } from "./schema";

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

// In-game star chart renders on the Honkai: Star Rail Wiki (Fandom), by file name.
// `npm run art:fetch` downloads them to public/art/worlds/<slug>.webp.
export const WORLD_ART_SOURCES: Record<string, string> = {
  "herta-space-station": "World_Herta_Space_Station.png",
  "jarilo-vi": "World_Jarilo-VI.png",
  "xianzhou-luofu": "World_The_Xianzhou_Luofu.png",
  penacony: "World_Penacony.png",
  amphoreus: "World_Amphoreus.png",
};

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
].map((w, i) => ({ ...w, arcOrder: i + 1, image: WORLD_ART_SOURCES[w.slug] ? worldImage(w.slug) : null }));

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

// The Aeons, in the order they sit around the Aeons web. pathSlug links an Aeon to
// its playable Path; Aeons whose Path has no playable characters (Trailblaze,
// Permanence, Order) have none and show their glyph instead.
export const AEONS = [
  { slug: "nanook", name: "Nanook", concept: "Destruction", pathSlug: "destruction", glyph: "✸",
    description: "The Aeon of Destruction, who sees all existence as a mistake to be erased. Its Antimatter Legion wages war on every living world." },
  { slug: "lan", name: "Lan", concept: "The Hunt", pathSlug: "hunt", glyph: "➹",
    description: "The Aeon of the Hunt, an archer forever pursuing its quarry. The Xianzhou Alliance fights in its name against the creations of the Abundance." },
  { slug: "nous", name: "Nous", concept: "Erudition", pathSlug: "erudition", glyph: "✧",
    description: "The Aeon of Erudition, a vast intelligence devoted to solving the universe. It invites the most brilliant minds into the Genius Society." },
  { slug: "xipe", name: "Xipe", concept: "Harmony", pathSlug: "harmony", glyph: "♫",
    description: "The Aeon of Harmony, who unites countless voices into a single chorus. Penacony's Family sings in its name." },
  { slug: "ix", name: "IX", concept: "Nihility", pathSlug: "nihility", glyph: "◌",
    description: "The Aeon of Nihility, an indifferent void whose very existence draws all things toward meaninglessness." },
  { slug: "qlipoth", name: "Qlipoth", concept: "Preservation", pathSlug: "preservation", glyph: "⛨",
    description: "The Aeon of Preservation, builder of walls against the dark. The Interastral Peace Corporation reveres it." },
  { slug: "yaoshi", name: "Yaoshi", concept: "Abundance", pathSlug: "abundance", glyph: "❀",
    description: "The Aeon of Abundance, who answers suffering with the gift of endless life — a blessing the Xianzhou regard as a curse." },
  { slug: "fuli", name: "Fuli", concept: "Remembrance", pathSlug: "remembrance", glyph: "❖",
    description: "The Aeon of Remembrance, who gathers and preserves memories from across the cosmos." },
  { slug: "aha", name: "Aha", concept: "Elation", pathSlug: "elation", glyph: "✺",
    description: "The Aeon of Elation, a trickster who finds the universe hilarious. The Masked Fools follow its lead." },
  { slug: "akivili", name: "Akivili", concept: "Trailblaze", pathSlug: null, glyph: "✦",
    description: "The Aeon of the Trailblaze, who laid the star rails between worlds and rode the Astral Express. Said to have perished long ago." },
  { slug: "long", name: "Long", concept: "Permanence", pathSlug: null, glyph: "❂",
    description: "The Aeon of Permanence, revered by the Vidyadhara, whose power sought to keep all things unchanging. Long since fallen." },
  { slug: "ena", name: "Ena", concept: "Order", pathSlug: null, glyph: "⌘",
    description: "The Aeon of Order, who sought to fit every life into a single, perfect design — and is long absent from the cosmos." },
].map((a, i) => ({ ...a, sortOrder: i }));

// aeonSlug is the Aeon a faction is devoted to, where that tie is well established.
export const FACTIONS = [
  { slug: "astral-express", name: "Astral Express", aeonSlug: "akivili",
    description: "The crew of the train once ridden by Akivili, travelling the star rails on the Trailblaze." },
  { slug: "stellaron-hunters", name: "Stellaron Hunters", aeonSlug: null,
    description: "Wanted fugitives led by Elio, following a script that seems to foresee the future." },
  { slug: "wildfire", name: "Wildfire", aeonSlug: null,
    description: "The resistance of Belobog's Underworld on Jarilo-VI." },
  { slug: "xianzhou-alliance", name: "Xianzhou Alliance", aeonSlug: "lan",
    description: "A fleet of colossal starskiffs devoted to Lan, waging an ancient war against the Abundance." },
  { slug: "intelligentsia-guild", name: "Intelligentsia Guild", aeonSlug: "nous",
    description: "A scholarly guild walking the Path of Erudition." },
  { slug: "genius-society", name: "Genius Society", aeonSlug: "nous",
    description: "An exclusive circle of geniuses recognized by Nous, the Aeon of Erudition." },
  { slug: "galaxy-rangers", name: "Galaxy Rangers", aeonSlug: null,
    description: "Wanderers who roam the cosmos righting wrongs." },
  { slug: "the-family", name: "The Family", aeonSlug: "xipe",
    description: "The alliance of clans that governs Penacony, devoted to Xipe, the Aeon of Harmony." },
  { slug: "chrysos-heirs", name: "Chrysos Heirs", aeonSlug: null,
    description: "Heroes of Amphoreus chosen to undertake the Flame-Chase." },
  { slug: "herta-space-station", name: "Herta Space Station", aeonSlug: null,
    description: "The research station of Herta, a member of the Genius Society." },
  { slug: "ipc", name: "Interastral Peace Corporation", aeonSlug: "qlipoth",
    description: "A vast interstellar trading power that reveres Qlipoth, the Aeon of Preservation." },
  { slug: "antimatter-legion", name: "Antimatter Legion", aeonSlug: "nanook",
    description: "The endless armies of Nanook, bent on wiping out all life." },
  { slug: "masked-fools", name: "Masked Fools", aeonSlug: "aha",
    description: "Jesters who follow Aha, the Aeon of Elation, seeking amusement above all else." },
];

// art is the game's internal character ID, which the art is fetched by (run `npm run art:fetch`
// after adding one). Characters with several looks — the Trailblazer — list labeled variants
// instead; the first is the default.
type CharacterSeed = {
  slug: string; art: string | ArtVariant[] | null; name: string; rarity: 4 | 5;
  elementSlug: string; pathSlug: string; factionSlug: string | null; worldSlug: string | null;
  releaseVersion: string; spoilerVersion: string | null; bio: string;
};

/** A seed character's art, normalized to the variant list stored in characters.art. */
export const artOf = (c: CharacterSeed): ArtVariant[] =>
  typeof c.art === "string" ? [{ label: c.name, gameId: c.art }] : (c.art ?? []);

export const CHARACTERS: CharacterSeed[] = [
  { slug: "trailblazer", art: [{ label: "Stelle", gameId: "8002" }, { label: "Caelus", gameId: "8001" }],
    name: "Trailblazer", rarity: 5, elementSlug: "physical", pathSlug: "destruction",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A traveler who awoke on the Herta Space Station with a Stellaron sealed within, now walking the Trailblaze aboard the Astral Express." },
  { slug: "march-7th", art: "1001", name: "March 7th", rarity: 4, elementSlug: "ice", pathSlug: "preservation",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A cheerful girl found frozen in drifting ice, searching for clues to her own forgotten past." },
  { slug: "dan-heng", art: "1002", name: "Dan Heng", rarity: 4, elementSlug: "wind", pathSlug: "hunt",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A cool, reserved guard of the Express archives with a past tied to the Xianzhou." },
  { slug: "himeko", art: "1003", name: "Himeko", rarity: 5, elementSlug: "fire", pathSlug: "erudition",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "The navigator who repaired the Astral Express and set it back on the rails among the stars." },
  { slug: "welt", art: "1004", name: "Welt", rarity: 5, elementSlug: "imaginary", pathSlug: "nihility",
    factionSlug: "astral-express", worldSlug: null, releaseVersion: "1.0", spoilerVersion: null,
    bio: "A seasoned veteran who once inherited the name of Welt Yang and now travels with the Express." },
  { slug: "kafka", art: "1005", name: "Kafka", rarity: 5, elementSlug: "lightning", pathSlug: "nihility",
    factionSlug: "stellaron-hunters", worldSlug: null, releaseVersion: "1.2", spoilerVersion: null,
    bio: "A calm and elegant Stellaron Hunter who always seems to be one step ahead of everyone else." },
  { slug: "silver-wolf", art: "1006", name: "Silver Wolf", rarity: 5, elementSlug: "quantum", pathSlug: "nihility",
    factionSlug: "stellaron-hunters", worldSlug: null, releaseVersion: "1.1", spoilerVersion: null,
    bio: "A genius hacker who treats the universe like an immersive game to be beaten." },
  { slug: "blade", art: "1205", name: "Blade", rarity: 5, elementSlug: "wind", pathSlug: "destruction",
    factionSlug: "stellaron-hunters", worldSlug: null, releaseVersion: "1.2", spoilerVersion: null,
    bio: "A swordsman cursed with an undying body, seeking an end that never comes." },
  // Her Stellaron Hunter affiliation is a Penacony story reveal.
  { slug: "firefly", art: "1310", name: "Firefly", rarity: 5, elementSlug: "fire", pathSlug: "destruction",
    factionSlug: "stellaron-hunters", worldSlug: "penacony", releaseVersion: "2.3", spoilerVersion: "2.1",
    bio: "A girl bearing a short lifespan who fights for the chance to truly live." },
  { slug: "seele", art: "1102", name: "Seele", rarity: 5, elementSlug: "quantum", pathSlug: "hunt",
    factionSlug: "wildfire", worldSlug: "jarilo-vi", releaseVersion: "1.0", spoilerVersion: null,
    bio: "A sharp-tongued fighter from the Underworld of Belobog, quick as a butterfly." },
  { slug: "jing-yuan", art: "1204", name: "Jing Yuan", rarity: 5, elementSlug: "lightning", pathSlug: "erudition",
    factionSlug: "xianzhou-alliance", worldSlug: "xianzhou-luofu", releaseVersion: "1.0", spoilerVersion: null,
    bio: "The General of the Cloud Knights, seemingly idle yet always in command." },
  { slug: "fu-xuan", art: "1208", name: "Fu Xuan", rarity: 5, elementSlug: "quantum", pathSlug: "preservation",
    factionSlug: "xianzhou-alliance", worldSlug: "xianzhou-luofu", releaseVersion: "1.6", spoilerVersion: null,
    bio: "Master Diviner of the Luofu, who reads fate through the Matrix of Prescience." },
  { slug: "huohuo", art: "1217", name: "Huohuo", rarity: 5, elementSlug: "wind", pathSlug: "abundance",
    factionSlug: "xianzhou-alliance", worldSlug: "xianzhou-luofu", releaseVersion: "1.7", spoilerVersion: null,
    bio: "A timid Foxian Judge-in-training who carries a heliobus named Tail on her tail." },
  { slug: "dr-ratio", art: "1305", name: "Dr. Ratio", rarity: 5, elementSlug: "imaginary", pathSlug: "hunt",
    factionSlug: "intelligentsia-guild", worldSlug: null, releaseVersion: "1.6", spoilerVersion: null,
    bio: "A brilliant scholar who never removes his plaster bust and has no patience for ignorance." },
  { slug: "ruan-mei", art: "1303", name: "Ruan Mei", rarity: 5, elementSlug: "ice", pathSlug: "harmony",
    factionSlug: "genius-society", worldSlug: null, releaseVersion: "1.6", spoilerVersion: null,
    bio: "A member of the Genius Society devoted to unraveling the secrets of life itself." },
  { slug: "acheron", art: "1308", name: "Acheron", rarity: 5, elementSlug: "lightning", pathSlug: "nihility",
    factionSlug: "galaxy-rangers", worldSlug: "penacony", releaseVersion: "2.1", spoilerVersion: null,
    bio: "A self-proclaimed Galaxy Ranger who walks alone, carrying a blade that cuts through sorrow." },
  { slug: "robin", art: "1309", name: "Robin", rarity: 5, elementSlug: "physical", pathSlug: "harmony",
    factionSlug: "the-family", worldSlug: "penacony", releaseVersion: "2.2", spoilerVersion: null,
    bio: "A beloved Halovian singer whose voice resonates across the cosmos." },
  { slug: "aglaea", art: "1402", name: "Aglaea", rarity: 5, elementSlug: "lightning", pathSlug: "remembrance",
    factionSlug: "chrysos-heirs", worldSlug: "amphoreus", releaseVersion: "3.0", spoilerVersion: null,
    bio: "A Chrysos Heir of Amphoreus who weaves fate through threads of gold." },
  { slug: "castorice", art: "1407", name: "Castorice", rarity: 5, elementSlug: "quantum", pathSlug: "remembrance",
    factionSlug: "chrysos-heirs", worldSlug: "amphoreus", releaseVersion: "3.2", spoilerVersion: null,
    bio: "A gentle Chrysos Heir whose touch brings death, accompanied by the great dragon Pollux." },
  { slug: "asta", art: "1009", name: "Asta", rarity: 4, elementSlug: "fire", pathSlug: "harmony",
    factionSlug: "herta-space-station", worldSlug: "herta-space-station", releaseVersion: "1.0", spoilerVersion: null,
    bio: "The lively lead researcher of the Herta Space Station, with an eye for the stars." },
];

// Lore terms. Wherever a term (or alias) appears in lore text, it gets a hover
// definition. Longer names win, so "Stellaron Hunters" isn't read as "Stellaron".
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
  { slug: "black-tide", term: "Black Tide", aliases: [], spoilerVersion: null,
    definition: "A corrupting tide that is steadily swallowing the lands of Amphoreus." },
];
