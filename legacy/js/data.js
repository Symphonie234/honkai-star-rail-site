/* =========================================================
   Site content. Edit here to add or change entries —
   main.js renders everything from these arrays.
   Characters can take an optional `image` path
   (e.g. "assets/characters/kafka.webp") to replace the
   placeholder initial.
   ========================================================= */

const PATHS = [
  { id: "destruction",  name: "Destruction",  icon: "✸", aeon: "Nanook",
    blurb: "Those who walk Destruction wield overwhelming power, trading safety for raw strength. Durable frontliners who deal heavy damage." },
  { id: "hunt",         name: "The Hunt",     icon: "➹", aeon: "Lan",
    blurb: "Hunters pursue a single target with relentless precision, specializing in powerful single-target damage." },
  { id: "erudition",    name: "Erudition",    icon: "✧", aeon: "Nous",
    blurb: "Seekers of knowledge who unleash attacks across the whole field, excelling against groups of enemies." },
  { id: "harmony",      name: "Harmony",      icon: "♫", aeon: "Xipe",
    blurb: "Harmony unites many voices into one, empowering allies with buffs that amplify the whole team." },
  { id: "nihility",     name: "Nihility",     icon: "◌", aeon: "IX",
    blurb: "Followers of Nihility weaken their foes with debuffs and damage over time, turning entropy into a weapon." },
  { id: "preservation", name: "Preservation", icon: "⛨", aeon: "Qlipoth",
    blurb: "Guardians of Preservation shield their allies, absorbing harm so the team can endure." },
  { id: "abundance",    name: "Abundance",    icon: "❀", aeon: "Yaoshi",
    blurb: "Abundance restores and sustains. Healers who keep the team standing through any battle." },
  { id: "remembrance",  name: "Remembrance",  icon: "❖", aeon: "Fuli",
    blurb: "Keepers of Remembrance summon memosprites — companions forged from memory — to fight alongside them." },
];

const ELEMENTS = [
  { id: "physical",  name: "Physical",  desc: "Bleed — damage based on the target's max HP." },
  { id: "fire",      name: "Fire",      desc: "Burn — deals Fire damage over time." },
  { id: "ice",       name: "Ice",       desc: "Freeze — target is frozen and skips its turn." },
  { id: "lightning", name: "Lightning", desc: "Shock — deals Lightning damage over time." },
  { id: "wind",      name: "Wind",      desc: "Wind Shear — stacking damage over time." },
  { id: "quantum",   name: "Quantum",   desc: "Entanglement — delays the target's action." },
  { id: "imaginary", name: "Imaginary", desc: "Imprisonment — delays and slows the target." },
];

const CHARACTERS = [
  { name: "Trailblazer", element: "physical",  path: "destruction",  rarity: 5, faction: "Astral Express",
    bio: "A traveler who awoke on the Herta Space Station with a Stellaron sealed within, now walking the Trailblaze aboard the Astral Express." },
  { name: "March 7th",   element: "ice",       path: "preservation", rarity: 4, faction: "Astral Express",
    bio: "A cheerful girl found frozen in drifting ice, searching for clues to her own forgotten past." },
  { name: "Dan Heng",    element: "wind",      path: "hunt",         rarity: 4, faction: "Astral Express",
    bio: "A cool, reserved guard of the Express archives with a past tied to the Xianzhou." },
  { name: "Himeko",      element: "fire",      path: "erudition",    rarity: 5, faction: "Astral Express",
    bio: "The navigator who repaired the Astral Express and set it back on the rails among the stars." },
  { name: "Welt",        element: "imaginary", path: "nihility",     rarity: 5, faction: "Astral Express",
    bio: "A seasoned veteran who once inherited the name of Welt Yang and now travels with the Express." },
  { name: "Kafka",       element: "lightning", path: "nihility",     rarity: 5, faction: "Stellaron Hunters",
    bio: "A calm and elegant Stellaron Hunter who always seems to be one step ahead of everyone else." },
  { name: "Silver Wolf", element: "quantum",   path: "nihility",     rarity: 5, faction: "Stellaron Hunters",
    bio: "A genius hacker who treats the universe like an immersive game to be beaten." },
  { name: "Blade",       element: "wind",      path: "destruction",  rarity: 5, faction: "Stellaron Hunters",
    bio: "A swordsman cursed with an undying body, seeking an end that never comes." },
  { name: "Firefly",     element: "fire",      path: "destruction",  rarity: 5, faction: "Stellaron Hunters",
    bio: "A girl bearing a short lifespan who fights for the chance to truly live." },
  { name: "Seele",       element: "quantum",   path: "hunt",         rarity: 5, faction: "Wildfire",
    bio: "A sharp-tongued fighter from the Underworld of Belobog, quick as a butterfly." },
  { name: "Jing Yuan",   element: "lightning", path: "erudition",    rarity: 5, faction: "Xianzhou Luofu",
    bio: "The General of the Cloud Knights, seemingly idle yet always in command." },
  { name: "Fu Xuan",     element: "quantum",   path: "preservation", rarity: 5, faction: "Xianzhou Luofu",
    bio: "Master Diviner of the Luofu, who reads fate through the Matrix of Prescience." },
  { name: "Huohuo",      element: "wind",      path: "abundance",    rarity: 5, faction: "Xianzhou Luofu",
    bio: "A timid Foxian Judge-in-training who carries a heliobus named Tail on her tail." },
  { name: "Dr. Ratio",   element: "imaginary", path: "hunt",         rarity: 5, faction: "Intelligentsia Guild",
    bio: "A brilliant scholar who never removes his plaster bust and has no patience for ignorance." },
  { name: "Ruan Mei",    element: "ice",       path: "harmony",      rarity: 5, faction: "Genius Society",
    bio: "A member of the Genius Society devoted to unraveling the secrets of life itself." },
  { name: "Acheron",     element: "lightning", path: "nihility",     rarity: 5, faction: "Galaxy Ranger",
    bio: "A self-proclaimed Galaxy Ranger who walks alone, carrying a blade that cuts through sorrow." },
  { name: "Robin",       element: "physical",  path: "harmony",      rarity: 5, faction: "Penacony",
    bio: "A beloved Halovian singer whose voice resonates across the cosmos." },
  { name: "Aglaea",      element: "lightning", path: "remembrance",  rarity: 5, faction: "Amphoreus",
    bio: "A Chrysos Heir of Amphoreus who weaves fate through threads of gold." },
  { name: "Castorice",   element: "quantum",   path: "remembrance",  rarity: 5, faction: "Amphoreus",
    bio: "A gentle Chrysos Heir whose touch brings death, accompanied by the great dragon Pollux." },
  { name: "Asta",        element: "fire",      path: "harmony",      rarity: 4, faction: "Herta Space Station",
    bio: "The lively lead researcher of the Herta Space Station, with an eye for the stars." },
];

const WORLDS = [
  { name: "Herta Space Station", color: "var(--cyan)",
    desc: "A research station housing curios from across the cosmos — and the place where the Trailblaze begins." },
  { name: "Jarilo-VI", color: "var(--ice)",
    desc: "A planet locked in eternal winter, where the last city of Belobog stands against the Fragmentum." },
  { name: "The Xianzhou Luofu", color: "var(--gold)",
    desc: "A colossal starskiff of the Xianzhou Alliance, home to long-lived peoples and ancient secrets." },
  { name: "Penacony", color: "var(--violet)",
    desc: "The Planet of Festivities, where guests drift through a dazzling Dreamscape of endless celebration." },
  { name: "Amphoreus", color: "var(--fire)",
    desc: "A world of myth and Titans, where Chrysos Heirs pursue the Flame-Chase to reclaim their gods' fire." },
];
