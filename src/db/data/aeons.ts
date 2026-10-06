/*
 * The Aeons and their lore. Written in our own words from in-game lore (as
 * catalogued by the Honkai: Star Rail Wiki). Lore sections carry a spoilerVersion
 * when they rely on story reveals; sections with null are safe for new players.
 *
 * introducedVersion is when the story first brings the Aeon up; a lore section's
 * version (when it enters the story) defaults to its spoilerVersion, else the
 * Aeon's introducedVersion. "View as of" hides anything later.
 *
 * pathSlug links an Aeon to its playable Path. artFile names the official art on
 * the wiki that `npm run art:fetch` downloads (null where none is published).
 */

export const AEONS = [
  { slug: "nanook", introducedVersion: "1.0", name: "Nanook", concept: "Destruction", pathSlug: "destruction", glyph: "✸",
    epithets: ["The Destruction", "Great Destroyer", "Ruin Author"], artFile: "Aeon_Nanook.png",
    description: "The Aeon of Destruction, who sees all existence as a mistake to be erased. Its Antimatter Legion wages war on every living world." },
  { slug: "lan", introducedVersion: "1.0", name: "Lan", concept: "The Hunt", pathSlug: "hunt", glyph: "➹",
    epithets: ["The Hunt", "Reignbow Arbiter"], artFile: "Aeon_Lan.png",
    description: "The Aeon of the Hunt, an archer forever pursuing its quarry. The Xianzhou Alliance fights in its name against the creations of the Abundance." },
  { slug: "nous", introducedVersion: "1.0", name: "Nous", concept: "Erudition", pathSlug: "erudition", glyph: "✧",
    epithets: ["The Erudition"], artFile: "Aeon_Nous.png",
    description: "The Aeon of Erudition, a vast intelligence devoted to solving the universe. It invites the most brilliant minds into the Genius Society." },
  { slug: "xipe", introducedVersion: "1.0", name: "Xipe", concept: "Harmony", pathSlug: "harmony", glyph: "♫",
    epithets: ["The Harmony", "The Great One"], artFile: "Aeon_Xipe.png",
    description: "The Aeon of Harmony, who unites countless voices into a single chorus. Penacony's Family sings in its name." },
  { slug: "ix", introducedVersion: "1.0", name: "IX", concept: "Nihility", pathSlug: "nihility", glyph: "◌",
    epithets: ["The Nihility"], artFile: "Aeon_IX.png",
    description: "The Aeon of Nihility, an indifferent void whose very existence draws all things toward meaninglessness." },
  { slug: "qlipoth", introducedVersion: "1.0", name: "Qlipoth", concept: "Preservation", pathSlug: "preservation", glyph: "⛨",
    epithets: ["The Preservation", "Amber Lord", "Firmamend Arbiter"], artFile: "Aeon_Qlipoth.png",
    description: "The Aeon of Preservation, builder of walls against the dark. The Interastral Peace Corporation reveres it." },
  { slug: "yaoshi", introducedVersion: "1.0", name: "Yaoshi", concept: "Abundance", pathSlug: "abundance", glyph: "❀",
    epithets: ["The Abundance", "Sanctus Medicus", "The Merciful One"], artFile: "Aeon_Yaoshi.png",
    description: "The Aeon of Abundance, who answers suffering with the gift of endless life — a blessing the Xianzhou regard as a curse." },
  { slug: "fuli", introducedVersion: "1.0", name: "Fuli", concept: "Remembrance", pathSlug: "remembrance", glyph: "❖",
    epithets: ["The Remembrance"], artFile: "Aeon_Fuli.png",
    description: "The Aeon of Remembrance, who gathers and preserves memories from across the cosmos." },
  { slug: "aha", introducedVersion: "1.0", name: "Aha", concept: "Elation", pathSlug: "elation", glyph: "✺",
    epithets: ["The Elation", "Joyseeker", "Everlasting Glee"], artFile: "Aeon_Aha.png",
    description: "The Aeon of Elation, a trickster who finds the universe hilarious. The Masked Fools follow its lead." },
  { slug: "akivili", introducedVersion: "1.0", name: "Akivili", concept: "Trailblaze", pathSlug: null, glyph: "✦",
    epithets: ["The Trailblaze", "Cloudstrider"], artFile: "Path_Trailblaze.png",
    description: "The Aeon of the Trailblaze, who laid the star rails between worlds and rode the Astral Express. Said to have perished long ago." },
  { slug: "long", introducedVersion: "1.0", name: "Long", concept: "Permanence", pathSlug: null, glyph: "❂",
    epithets: ["The Permanence", "Progenitor of All Dragons"], artFile: "Aeon_Long.png",
    description: "The Aeon of Permanence and progenitor of all dragons, revered by the Vidyadhara. Long since fallen." },
  { slug: "ena", introducedVersion: "2.0", name: "Ena", concept: "Order", pathSlug: null, glyph: "⌘",
    epithets: ["The Order"], artFile: "Aeon_Ena.png",
    description: "The Aeon of Order, who sought to fit every life into a single, perfect design — and is long absent from the cosmos." },
  { slug: "idrila", introducedVersion: "1.5", name: "Idrila", concept: "Beauty", pathSlug: null, glyph: "❁",
    epithets: ["The Beauty", "Wondergazer"], artFile: "Path_Beauty.png",
    description: "The Aeon of Beauty, vanished from the cosmos. The Knights of Beauty still carry its glory between the stars." },
].map((a, i) => ({ ...a, sortOrder: i }));

type LoreSeed = { title: string; spoilerVersion: string | null; version?: string; body: string };

const LORE_BY_AEON: Record<string, LoreSeed[]> = {
  nanook: [
    { title: "The Great Destroyer", spoilerVersion: null, body:
`Nanook regards existence itself as a flaw in the cosmos — something to be corrected by unmaking it. Of all the active Aeons, Nanook is the youngest, having ascended in the aftermath of the Swarm Disaster.

Young or not, Nanook may already be the greatest menace in the galaxy. Worlds that draw its attention rarely survive it.` },
    { title: "The Antimatter Legion", spoilerVersion: null, body:
`Nanook's will is carried out by the Antimatter Legion, an endless army of Voidrangers and worse, led by the Lord Ravagers — Emanators of Destruction granted a share of Nanook's power. The Legion's assault on Herta Space Station is the very first thing the Trailblazer wakes up to.

The Lord Ravagers are so powerful that the Xianzhou Alliance relies on its generals — themselves empowered by Lan — to stand against them.` },
    { title: "Walking Destruction", spoilerVersion: null, body:
`Not everyone who walks Destruction serves Nanook. Pathstriders of Destruction draw on its raw, reckless power — trading safety for overwhelming strength — whether they wish to end the world or simply hit very hard. The Trailblazer's first Path was Destruction, wielded with a baseball bat.` },
  ],
  lan: [
    { title: "The Arrow That Never Stops", spoilerVersion: null, body:
`Lan is single-minded: an archer who hunts the Abundance and every creature Yaoshi has blessed, driven by a hatred born of the devastation the Abundance once brought to Lan's own homeworld.

Lan rarely appears before mortals. Its presence is usually known only by the streak of the Lux Arrow tearing across the sky.` },
    { title: "Patron of the Xianzhou", spoilerVersion: null, body:
`Of all the Aeons, Lan gives most freely to mortals who share its purpose. The Xianzhou Alliance hunts the Abundance in Lan's name, and Lan's favor makes the Alliance's marshal and generals strong enough to face the Lord Ravagers of the Antimatter Legion.

Welt observes that Lan is not among the mightiest Aeons — its Path is narrow — but it watches mortals more closely than most.` },
  ],
  nous: [
    { title: "The Machine That Asks", spoilerVersion: null, body:
`Nous began as an astral supercomputer built by Zandar One Kuwabara, before rising into an Aeon. It devotes itself to calculating the essence of the universe and its ultimate solution.

Nous is not a god that hands out answers. It offers endless questions instead — meeting Nous is said to open the eyes of even the most ignorant, but every answer must be found by oneself.` },
    { title: "The Genius Society", spoilerVersion: null, body:
`Nous gazes upon the most brilliant minds of the cosmos, and those it recognizes form the Genius Society — a small, eccentric circle that counts Herta and Ruan Mei among its members. Scholars of Erudition beyond the Society, such as the Intelligentsia Guild, pursue knowledge in Nous' shadow.` },
  ],
  xipe: [
    { title: "Many Voices, One Chorus", spoilerVersion: null, body:
`Xipe is an amalgamation of thousands of entities from harmonious worlds — a god made of togetherness, preaching the joy of unity. Its followers believe that with enough love and song, the universe will become one harmonious whole.` },
    { title: "The Family", spoilerVersion: null, body:
`Xipe's chosen form the Family, drawn from many civilizations and worlds. They call out to other worlds with their song, celebrate each new world that accepts Xipe's blessing, and have never known one to tire of it. Penacony, the Planet of Festivities, is governed by the Family.` },
    { title: "Order Within Harmony", spoilerVersion: "2.0", body:
`When Xipe ascended near the end of the Swarm Disaster, its Path overlapped with that of Ena, the Aeon of Order — and Ena was absorbed into Xipe. Remnants of Order's ideals linger among Harmony's followers, with consequences that surface on Penacony.` },
  ],
  ix: [
    { title: "The Indifferent Void", spoilerVersion: null, body:
`IX believes existence is utterly meaningless, and so does nothing at all. It does not interact with other Aeons, and its true nature is a mystery. Merely being near IX's form is said to leave one numb and dejected.` },
    { title: "Shadows of IX", spoilerVersion: "2.1", body:
`IX's influence takes shape as Shadows of IX — formless creations that can swallow people whole. Those who enter a Shadow and lose the meaning of their existence become Self-Annihilators. On Penacony, the Trailblazer learns how closely Acheron's story is bound to the Nihility.` },
    { title: "Walking Nihility", spoilerVersion: null, body:
`Walking Nihility does not mean serving IX. Many of its Pathstriders persist precisely in spite of meaninglessness, turning entropy, poison and despair into weapons against their foes.` },
  ],
  qlipoth: [
    { title: "The Amber Lord", spoilerVersion: null, body:
`Qlipoth builds walls. Its celestial-scale constructions — the Subspace Crystalline Barrier among them — separate and shield living worlds from the dark that would devour them. The first Xianzhou ships witnessed one such barrier, the Celestial Comet Wall.` },
    { title: "Amber Eras", spoilerVersion: null, body:
`Every time Qlipoth brings down its hammer, a new Amber Era begins. The swings are irregular — one era may last between 76 and 240 Trailblaze years — but the cosmos still counts time by them, written "AE".` },
    { title: "The IPC's Paradox", spoilerVersion: null, body:
`The Interastral Peace Corporation reveres Qlipoth above all, yet it does the opposite of what the Amber Lord seems to want: where Qlipoth isolates worlds, the IPC connects them through trade. No rebuke has ever come.` },
    { title: "The Gaze on Jarilo-VI", spoilerVersion: "1.0", body:
`Belobog's people have long revered Qlipoth. During the crisis on Jarilo-VI, the Amber Lord's gaze falls upon the Trailblazer, opening the Path of Preservation to them.` },
  ],
  yaoshi: [
    { title: "The Gift of Endless Life", spoilerVersion: null, body:
`Yaoshi answers suffering with healing, and death with endless life — given freely, and indiscriminately. To many it is the most merciful of the Aeons; to others, its blessings are plagues.` },
    { title: "The Xianzhou's Bargain", spoilerVersion: null, body:
`The Xianzhou Alliance began as nine ships searching for Yaoshi and immortality. The Luofu received the Ambrosial Arbor, and those who ate its fruit became long-lived — but long life brought crowding, wars over the gift, and mara, the madness that eventually takes the long-lived.

The Alliance came to resent Yaoshi's gift and swore itself to Lan the Hunt. The Xianzhou have waged war on the Abundance ever since.` },
    { title: "Plaguemarks", spoilerVersion: null, body:
`Remnants of Yaoshi's gifts still lie aboard the Xianzhou ships — the Ambrosial Arbor on the Luofu among them. Vidyadhara High Elders keep watch over these plaguemarks, and the Disciples of Sanctus Medicus, who still worship Yaoshi, never stop trying to awaken them.` },
  ],
  fuli: [
    { title: "The Cosmic Record", spoilerVersion: null, body:
`Fuli records everything that happens in the universe, preparing for its rebirth after destruction. No one knows where Fuli came from. Though present at nearly every significant event, Fuli rarely appears before mortals.` },
    { title: "The Garden of Recollection", spoilerVersion: null, body:
`Fuli's Memokeepers shed their mortal flesh and live on as beings of memory, free to drift between worlds. From the Garden of Recollection they gather and share memories — Black Swan is one of them.` },
    { title: "Eden of Blessed Insight", spoilerVersion: null, body:
`Memokeepers whisper of the Eden of Blessed Insight, Fuli's realm, where the most luminous memories will be blended together to reshape the world after its annihilation. Where Remembrance meets the Path of Enigmata, dreamscapes can arise — Penacony's among them.` },
  ],
  aha: [
    { title: "The Laughing God", spoilerVersion: null, body:
`Aha is the Aeon of Elation, a trickster who finds the universe hilarious. Aha's ascension came with a laughter said to have torn through the universe — a metaphor to most, but the Masked Fools insist it was literal, and point to the Echo of Primordial Laughter as proof.` },
    { title: "The Masked Fools", spoilerVersion: null, body:
`Aha's followers, the Masked Fools, pursue amusement above all else. They turn up wherever there's a show to be put on or a joke to be made, often at someone else's expense. Sparkle is one of them.` },
    { title: "A Path Opens", spoilerVersion: null, version: "3.8", body:
`Elation became a playable Path in Version 4.0, "No Aha At Full Moon" — after the period this archive covers, which is why no travelers here walk it yet.` },
  ],
  akivili: [
    { title: "The Trailblazer of the Stars", spoilerVersion: null, body:
`Akivili came from the planet Pegana and built the Astral Express to carry THEMSELF and their companions, the Nameless, across the galaxy. The star rails Akivili laid connected distant worlds; their remnants are still used as safe routes by the IPC and the Xianzhou Alliance. The Trailblaze calendar the Express keeps comes from Pegana too.` },
    { title: "The Swarm Disaster", spoilerVersion: null, body:
`When Tayzzyronth and the Swarm spread across the universe, Akivili stood with Aha, Qlipoth, Xipe and HooH to seal it away — one of the few times the Aeons are known to have acted together.` },
    { title: "A Silent Rail", spoilerVersion: null, body:
`Akivili is gone, said to have perished in some "accident" that ended their journey; Himeko speaks of them as deceased, and only Nous may know what truly happened. The Express runs on regardless, and its crew still walk the Trailblaze in Akivili's footsteps.` },
  ],
  long: [
    { title: "Progenitor of All Dragons", spoilerVersion: null, body:
`Long was the Aeon of Permanence, creator of the dragons and of a particular answer to immortality: that which does not change does not end. Long's scions are said to be scattered across countless worlds.` },
    { title: "The Vidyadhara", spoilerVersion: null, body:
`The Vidyadhara of the Xianzhou trace their lineage to Long. They do not truly die — they are reborn from eggs into new lives, keeping their nature while losing their memories. Their High Elders watch over the Abundance's plaguemarks on the Xianzhou ships.` },
    { title: "Dan Heng's Inheritance", spoilerVersion: "1.0", body:
`On the Luofu, Dan Heng's past as a reborn Vidyadhara High Elder comes to light, and with it his connection to Long's power.` },
  ],
  ena: [
    { title: "The Aeon of Order", spoilerVersion: null, body:
`Ena ascended after the Dusk Wars, when darkness and chaos had consumed the world — in myth, the first of seven days of creation. Ena played a great lyre with black and white keys: the white keys raised the sun, the black keys the moon. Ena's Path suppressed many calamities and tolerated no chaos.` },
    { title: "Absorbed into Harmony", spoilerVersion: "2.0", body:
`Near the end of the Swarm Disaster, Xipe's ascension collided with Ena's Path, and the Aeon of Order was absorbed into Harmony. Order survives only as an ideal — one that some of the Family still hold dear.` },
    { title: "Penacony's Shadow", spoilerVersion: "2.2", body:
`On Penacony, Sunday's dream of a perfect paradise draws on Order's ideals — and for a moment, the Aeon of Order stirs again.` },
  ],
  idrila: [
    { title: "The Beauty", spoilerVersion: null, body:
`Idrila presided over the Path of Beauty — the pure goodness of the material world, as sensed and defined by thinking beings. Idrila has since disappeared from the cosmos.` },
    { title: "Missing, or Fallen?", spoilerVersion: null, body:
`The Knights of Beauty maintain that Idrila is merely missing, and roam the stars spreading the glory of Beauty in the meantime — Argenti among them. Others, such as the Mirror Holders, consider Idrila long dead.` },
  ],
};

const introduced = Object.fromEntries(AEONS.map((x) => [x.slug, x.introducedVersion]));

export const AEON_LORE = Object.entries(LORE_BY_AEON).flatMap(([aeonSlug, sections]) =>
  sections.map((s, i) => ({
    ...s,
    version: s.version ?? s.spoilerVersion ?? introduced[aeonSlug],
    slug: `${aeonSlug}-${i + 1}`,
    aeonSlug,
    sortOrder: i + 1,
  })),
);
