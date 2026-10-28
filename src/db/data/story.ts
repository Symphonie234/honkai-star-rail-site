type ChapterSeed = { title: string; version: string; spoilerVersion: string | null; body: string };

const CHAPTERS_BY_WORLD: Record<string, ChapterSeed[]> = {
  "herta-space-station": [
    { title: "Awakening", version: "1.0", spoilerVersion: null, body:
`The Trailblaze begins in chaos. The Antimatter Legion has overrun Herta Space Station, and amid the wreckage two Stellaron Hunters — the elegant Kafka and the hacker Silver Wolf — go calmly about a plan of their own. They seal a Stellaron inside a body and wake it: the Trailblazer, with no memory of who they were.

March 7th and Dan Heng of the Astral Express find the stranger among the station's curios. With acting lead researcher Asta, the three fight through the besieged zones until a new threat appears — the Doomsday Beast — and the Trailblazer turns out to be the key to stopping it.` },
    { title: "All Aboard", version: "1.0", spoilerVersion: null, body:
`Himeko, the Express's navigator, and Welt Yang help bring the crisis to an end. Then Himeko offers the Trailblazer a seat aboard — and a choice. The Express follows the star rails once laid by the Aeon Akivili, and its crew, the Nameless, go wherever the Trailblaze leads.

A Stellaron, the "cancer of all worlds", is calling from a frozen planet: Jarilo-VI. The Trailblazer decides to come along.` },
    { title: "Crown of the Mundane and Divine", version: "1.6", spoilerVersion: "1.6", body:
`Three members of the Genius Society — Herta, Ruan Mei and Screwllum — gather on the station at once, an almost unheard-of event. The Trailblazer quietly helps Ruan Mei recover a "little lifeform" loose on the station, and glimpses how much larger her research really is, before her memory of it all grows strangely hazy.

Meanwhile Herta is attacked and rumors spread about the station's managers. A sneering scholar in a plaster bust — Dr. Ratio of the Intelligentsia Guild — joins the Trailblazer to dig out what is really going on.` },
    { title: "The Witch's Audience", version: "3.0", spoilerVersion: "3.0", body:
`While the Trailblazer is away on Amphoreus, Herta knocks the entire station out of commission to power the Audience System Terminal — an attempt to speak with Nous itself. The audience is cut short when Welt and Sunday intrude on behalf of the Express, which has questions of its own about Amphoreus.

Intrigued, Herta later projects a "data spirit" of herself toward the world, and is warned off by a figure called Lygus, who invokes the threat of a Lord Ravager.` },
  ],
  "jarilo-vi": [
    { title: "The Last City", version: "1.0", spoilerVersion: null, body:
`Jarilo-VI has been buried in an Eternal Freeze for centuries. Its last refuge is Belobog, defended by the Silvermane Guards and ruled by the Supreme Guardian Cocolia.

The crew's welcome goes badly wrong. Their audience with the Supreme Guardian ends in betrayal, and Bronya Rand — Cocolia's daughter and a Silvermane commander — is ordered to arrest them. Fleeing through streets corroded by the Fragmentum, they are led underground by a slippery "old friend": Sampo.` },
    { title: "The Underworld", version: "1.0", spoilerVersion: null, body:
`Beneath the city lies the Underworld, a mining district the Overworld left behind. Separated, the crew find each other again — March 7th through a game of hide-and-seek, Dan Heng in an underground fight club.

Sampo introduces them to Wildfire, the Underworld's resistance, but its fighter Seele won't trust outsiders until they prove themselves. Together they trace the Underworld's troubles to the Robot Settlement, where a little girl, Clara, lives with the giant robot Svarog.` },
    { title: "The Truth Beneath the Snow", version: "1.0", spoilerVersion: "1.0", body:
`Bronya ventures with Seele and the Trailblazer into abandoned Rivet Town and stumbles on a memory from her own past — easing the bitterness between Overworld and Underworld. Wildfire sides with the Nameless, and the crew go to negotiate with Svarog.

Svarog tells them the truth: Belobog's Guardians have been deliberately hiding what the Stellaron is from their own people. The crew resolve to return to the surface and seal it themselves.` },
    { title: "The Supreme Guardian", version: "1.0", spoilerVersion: "1.0", body:
`The engineer Serval guides the crew into the Silvermane Guards' restricted zone, and Captain Gepard, won over, clears a path to the Stellaron. At the end of the Corridor of Fading Echoes waits Cocolia — who has long been listening to the Stellaron's whispers, convinced it alone can save Belobog.

After the battle the decade-long blockade between Overworld and Underworld ends. Bronya becomes Supreme Guardian, Belobog is whole again, and the Express sets off for its next stop.` },
    { title: "Future Market", version: "1.4", spoilerVersion: "1.4", body:
`With the snow finally melting, Bronya invites the Nameless back for the Solwarm Festival. Outside Belobog they meet Topaz of the IPC's Strategic Investment Department, come to collect a centuries-old debt owed by Belobog's founders, the Architects.

Topaz proposes placing all of Jarilo-VI in the IPC's trusteeship as the only way to save it. With Himeko's help Bronya sees the situation for what it is and rallies her people to defend their world — and Topaz, watching the Belobogians' seven centuries of endurance, comes to see them differently.` },
  ],
  "xianzhou-luofu": [
    { title: "A Ship in Crisis", version: "1.0", spoilerVersion: null, body:
`An uninvited guest asks the Express for a "destination alteration", and soon it stops beside the Xianzhou Luofu — a vast starskiff of the Alliance, home to long-lived Xianzhou natives, Vidyadhara and Foxians. For reasons of his own, Dan Heng stays behind on the train.

The Luofu is in trouble: the mara-struck — people driven mad by too long a life — overrun its districts. The crew rescue Tingyun, an envoy of the Sky-Faring Commission, and are brought before General Jing Yuan of the Cloud Knights, who sets them to hunting the Stellaron Hunter Kafka.` },
    { title: "Hunting the Hunter", version: "1.0", spoilerVersion: "1.0", body:
`Kafka is waiting for them, unhurried, as if she planned it. The Luofu's Master Diviner, Fu Xuan, turns the Matrix of Prescience on her past and gets an answer no one expects: the Stellaron Hunters came to save the Xianzhou, not to doom it.

The true threat is closer to home. The Ambrosial Arbor — a remnant of the Abundance that once made the Luofu's people long-lived — stirs back to life, guarded by the immortal Abundant Ebon Deer. And Dan Shu, the friendly Chief Alchemist, is unmasked as the Master Primus of the Disciples of Sanctus Medicus.` },
    { title: "The Ambrosial Arbor", version: "1.2", spoilerVersion: "1.2", body:
`Cornered, Dan Shu names the one who brought her the Stellaron: an ally from the Antimatter Legion. Then "Tingyun" bursts into flame — she has been Phantylia, a Lord Ravager of Nanook, all along. Phantylia means to use the Arbor against the Luofu's long-lived peoples.

To reach the Roots of the Arbor, Dan Heng finally shows the form he has hidden from everyone — that of a Vidyadhara High Elder, the reborn Imbibitor Lunae — and parts the waters of an ancient sea. The battle beneath the Arbor decides the fate of the ship.` },
    { title: "Obsequies Performed", version: "1.3", spoilerVersion: "1.3", body:
`The menace is driven off and the Arbor falls quiet again, but the work of mourning and rebuilding has only begun. Back aboard the Express, Himeko mentions where the train had originally meant to go before all this: Penacony, the Planet of Festivities.` },
    { title: "A Foxian Tale of the Haunted", version: "1.5", spoilerVersion: "1.5", body:
`When the Creation Furnace shatters, the heliobi sealed inside escape and flee to a long-abandoned garden. The Ten-Lords Commission forms a special team to recapture them, and the Trailblazer joins timid Judge-in-training Huohuo and her heliobus companion Tail.

One by one the escapees are sealed, each hunt helping a friend face a fear: Bailu, Fu Xuan, Yanqing and Sushang. Finally Huohuo confronts the ringleader, Cirrus, and learns that being a Judge is about resolve, not power.` },
    { title: "The Wardance", version: "2.4", spoilerVersion: "2.4", body:
`Jing Yuan revives the Wardance, a martial ceremony, and invites the Express back to the Luofu. The generals of two other ships come to watch — Huaiyan of the Zhuming and Feixiao of the Yaoqing — with motives far from ceremonial, as IPC ships fleeing borisin attacks crowd the docks.

March 7th wins a place in the Wardance and trains under the star pupils of two generals, Yanqing and Yunli, taking up Xianzhou swordplay. But beneath it all a conspiracy is at work: the borisin warlord Hoolay, imprisoned on the Luofu for ages, breaks out of the Shackling Prison.` },
    { title: "The Lupine Hunt", version: "2.5", spoilerVersion: "2.5", body:
`Hoolay takes Jiaoqiu, a Yaoqing envoy, hostage and threatens to turn the Wardance into a bloodbath. Feixiao, the Merlin's Claw, leads the hunt with the Cloud Knights while March, Yunli and Yanqing guard the Skysplitter and the arena.

The three young swordmasters hold the line together, and Feixiao faces Hoolay — seven centuries of grudge — in a final duel. Afterwards Lingsha and Dan Heng settle old business with the Vidyadhara Preceptors, and the Alliance's generals meet to discuss a war that concerns them all.` },
  ],
  penacony: [
    { title: "The Charmony Festival", version: "2.0", spoilerVersion: null, body:
`The Express accepts an invitation from the Family to Penacony's Charmony Festival. Once a frontier prison of the IPC, Penacony is now the Land of Dreams: guests sleep in the Hotel Reverie and wake in a shared Dreamscape of endless celebration.

In the Golden Hour the Trailblazer saves a girl named Firefly, who becomes their guide. Among the other guests are figures from across the cosmos — the Galaxy Ranger Acheron, the IPC's Aventurine, the Memokeeper Black Swan and the Masked Fool Sparkle.` },
    { title: "A Death in the Dream", version: "2.0", spoilerVersion: "2.0", body:
`After a day with Firefly, an illusion crafted by the Masked Fools strands the two in a perilous Memory Zone, where a meme called "Death" stalks them — and Firefly vanishes beneath its blade. Death in the Dreamscape should be impossible.

Black Swan delivers the Trailblazer to Aventurine, and there it happens again: Robin, the Halovian singer set to headline the festival, is reduced to nothing in front of them.` },
    { title: "Cat Among Pigeons", version: "2.1", spoilerVersion: "2.1", body:
`Using Robin's death as leverage, Aventurine invites the Trailblazer to help him bring down the Family. Sunday, head of the Oak Family, turns the tables and sentences Aventurine — who gambles everything on one last plan.

The Bloodhound Family's Gallagher points toward the dream mogul known as the Watchmaker, whose true identity is a man the Family once branded a traitor. Welt and Acheron dig into the Family's secrets, and Aventurine maneuvers everyone, the Express included, into the roles his scheme requires.` },
    { title: "In Our Time", version: "2.2", spoilerVersion: "2.2", body:
`The Galaxy Ranger Boothill warns that the shadow of Nihility is seeping into the dream. Firefly explains her strange behavior and leads the crew down to Dreamflux Reef, where they find Robin alive. The truth comes out: a traitor in the Family has been using a Stellaron to control the Dreamscape. The Watchmaker turns out to be Mikhail — a former Nameless — who left the crew a final gift.

Sunday sides with the Dreammaster, cages Robin and Welt, and challenges the Trailblazer to a duel of ideals at the Grand Theater: he would shield everyone in a perfect dream shaped by Order. Even after one victory, the crew learn they had really lost — and only by seeing through Ena's Dream and waking its dreamers do they finally defeat him.` },
    { title: "Farewell, Penacony", version: "2.3", spoilerVersion: "2.3", body:
`With the dream of Order broken, the Family, the IPC's Topaz and Jade, and Penacony's clans negotiate the planet's future aboard the airship Radiant Feldspar — and Jade's maneuvering leaves the Express with a stake in Penacony and an unexpected job as its brand ambassadors.

At the Charmony Festival the crew defuse a "bomb" left by Sparkle, and fireworks bloom in the dream sky as the Trailblazer and Firefly share a quiet moment. As the Express prepares to leave, Black Swan suggests a next destination: Amphoreus, the Eternal Land.` },
    { title: "Banana Outrage", version: "2.6", spoilerVersion: "2.6", body:
`Paperfold University invites the crew back to the Dreamscape for its school festival — and they find it overrun by monkeys. A meme called the Slumbernana Monkey is spreading, the campus is run by bullying BananAdvisors, and a flamboyant ninja, Rappa, reveals herself as a Galaxy Ranger on the case.

With Boothill infiltrating the "Slumbernana Association" and a Memokeeper named Mr. Reca explaining the memetic virus, the crew dive into Rappa's past for an antidote and defeat Profnana, the mastermind feeding on the monkeys' desires.` },
    { title: "A New Venture on the Eighth Dawn", version: "2.7", spoilerVersion: "2.7", body:
`Before heading to Amphoreus, the crew take a vacation in Penacony and find old enemies returned and reunited in the dream — along with an unsettling number of Miss Tingyuns. Sending her off at last becomes the crew's task.

Sunday makes his own solemn farewells, then asks to ride the Astral Express as a temporary passenger, continuing his search for paradise on the road.` },
    { title: "Memories are the Prelude to Dreams", version: "3.8", spoilerVersion: "3.8", body:
`A woman called Constance — "The Dahlia" — boards the Express and guides the Trailblazer through their own consciousness, restoring memories of Penacony they didn't know they had lost.

The Penacony story replays from Firefly's side: her infiltration of the Dreamscape with Silver Wolf's help, Robin's pursuit of a "dissonance" she couldn't place, a lost Glamoth companion, and the role she played in breaking Ena's Dream. At the end of it, the Trailblazer chooses to stay beside Firefly as her Entropy Loss Syndrome worsens — and with the power of the Finality, changes something, slightly.` },
  ],
  amphoreus: [
    { title: "The Flame-Chase", version: "3.0", spoilerVersion: null, body:
`With fuel running low, the Express votes to head for Amphoreus, the Eternal Land — a world sealed away from the cosmos, where Titans once shaped every part of existence and the Black Tide now devours the land. March 7th falls ill, so the Trailblazer and Dan Heng go ahead in a detached coach, which is shot down near an ancient temple.

There they meet two Chrysos Heirs, Phainon and Tribbie, and reach the city-state of Okhema. Its leader, Aglaea, asks them never to speak of the world beyond the sky. Through the Vortex of Genesis they learn the Chrysos Heirs' mission — the Flame-Chase, a quest to reclaim the Titans' Coreflames and bring about a new era — and decide to stay and help.` },
    { title: "The Undying Titan", version: "3.0", spoilerVersion: "3.0", body:
`The first great enemy is Nikador, Titan of Strife, who long ago gained an undying body in the mobile fortress of Castrum Kremnos. Alongside Phainon and the Kremnoan prince Mydei, the Trailblazer borrows the power of the time Titan Oronyx to travel into Kremnos's past with Castorice and the memosprite Mem, and finds a missing fragment of Nikador's divinity.

Nikador falls, and its Coreflame returns to Okhema. Phainon steps into the Coreflame trial to prove himself worthy of Strife's divinity.` },
    { title: "Light Slips the Gate, Shadow Greets the Throne", version: "3.1", spoilerVersion: "3.1", body:
`Phainon's trial goes wrong and the Trailblazer pulls him out of his own inner demon. The burden of Strife falls instead to Mydei, true heir of Kremnos, who wrestles with a veteran's wish that he claim the crown and come home.

At the Grove of Epiphany the crew meet the healer Hyacine and the sharp-tongued sage Anaxa, and win back a Coreflame from the Black Tide. When a mysterious Flame Reaver attacks, an ascended Mydei ends the fight with a single throw of his lance — and declares the Kremnoan dynasty over. Tribbie loses one of her three selves, and through her powers the crew witness how her Flame-Chase began, in Janusopolis.` },
    { title: "Through the Petals in the Land of Repose", version: "3.2", spoilerVersion: "3.2", body:
`The Trial of Time brings devastating news: the Trailblazer actually died in the fall to Amphoreus and is walking on as a memory. To survive they must reclaim their own future. Meanwhile Anaxa bargains with the Council of Elders, who push Okhema's citizens to vote on abandoning the Flame-Chase.

Castorice, whose touch brings death, leads the Trailblazer into Styxia and the River of Souls, uncovering her own past and the Death Titan's. Phainon's speech wins the citizens' assembly, Anaxa casts the deciding vote, and Castorice guides the Trailblazer back from the land of the dead before returning to keep its balance — entrusting them with the Death Coreflame.` },
    { title: "The Fall at Dawn's Rise", version: "3.3", spoilerVersion: "3.3", body:
`Assassins of the Council — the "Cleaners" — strike at every group at once, and news arrives that Aglaea is dead. In mourning, Phainon takes up her final message and rallies Okhema behind the Flame-Chase.

Hyacine opens a rainbow bridge to the domain of the Sky Titan Aquila and uncovers the lie behind her people's legend. The master thief Cipher dies protecting a Coreflame from the Flame Reaver, and without her the Dawn Device goes dark: Okhema falls into endless night, besieged by the Black Tide.` },
    { title: "For the Sun is Set to Die", version: "3.4", spoilerVersion: "3.4", body:
`The genius Screwllum makes contact from outside, and the Trailblazer stays on as his inside agent while Dan Heng returns to the Express. When the final Coreflame is placed, Lygus draws the Trailblazer into an "Immersive Theater" of memories instead.

The truth is laid bare: the Flame Reaver, Khaslana, is Phainon from countless earlier cycles, who stole the Coreflames across thirty million Eternal Recurrences to keep the new era from completing. Phainon says goodbye to the hero he was and embraces the accumulated Coreflame to face his fate.` },
    { title: "Before Their Deaths", version: "3.5", spoilerVersion: "3.5", body:
`With Cyrene — whom the memosprite Mem has become — the Trailblazer travels back to the very first Flame-Chase, to the age of Cerydra, Heir of Law, and Hysilens, Heir of Ocean, seeking the power of Law to change the Worldbearing Coreflame. A visitor who looks exactly like March 7th, calling herself Evernight, helps them escape a prison of the mind.

A thousand years later Okhema is in ruins, and the heroes the Trailblazer knew have fallen fighting Lygus. In Styxia, Hysilens wakes from her long sleep, and Lygus reveals who he truly is: Zandar, Genius Society member #1, who means to destroy Nous through Irontomb and set off a war among the Aeons.` },
    { title: "Back to Earth in Evernight", version: "3.6", spoilerVersion: "3.6", body:
`The truth about March 7th surfaces: she reached Amphoreus first, and gave up her memories to protect her friends — leaving Evernight in her place. Dan Heng, racing back from the Express to a world transformed by time, draws on the power of the Permanence and the memories of his former life to break through.

The Trailblazer escapes Evernight's tide of memories with help from Sunday and Cyrene, and beneath it all lies the Great Tomb, tied to every Cyrene of every cycle. Through March's camera, March and Evernight finally speak face to face. March wakes, the crew reunite, and every condition for Era Nova is met.` },
    { title: "As Tomorrow Became Yesterday", version: "3.7", spoilerVersion: "3.7", body:
`To complete the final trial, the Trailblazer sleeps for a millennium and wakes as the Worldbearing Titan, while forces from across the cosmos rally under the Express against Irontomb, the Lord Ravager. Herta convenes the Genius Society and resolves to break Irontomb's seal.

In the Ruins of Time, alongside the former Chrysos Heirs — now Titans — the Trailblazer releases Khaslana's obsession and faces Irontomb. Herta completes her "coronation", Cyrene shelters the memories of all cosmic life, and the Trailblazer truly walks the Path of Remembrance to extinguish the flame of Destruction. Afterward, Cyrene steps into the past to make sure Amphoreus's story closes its loop — the journey's beginning was also its end.` },
  ],
  planarcadia: [
    { title: "One Minute of Godhood", version: "4.0", spoilerVersion: null, body:
`Having turned down Jade's offer of an alliance, the Astral Express accepts her other proposal and sets course to resupply at Planarcadia — Himeko's homeland, a world of entertainment restored from a painted scroll. They arrive under a full Phantasmoon, just as the Phantasmoon Games are about to begin.

The rules are simple and outrageous: eight Supplicants, each chosen by a Mask of Elation, compete to gather Wishpower from the masses. The victor wins an audience with Aha, the Aeon of Elation — and one minute of THEIR authority. Himeko leaves it to the Trailblazer to decide whether, and how, to join in.` },
    { title: "Welcome to Arcadia", version: "4.0", spoilerVersion: "4.0", body:
`Sparkle, disguised as a tour guide, shows the crew around — and the first rival appears at once: Sparxie, a streamer and self-styled "real Sparkle" who turns her fans against the Express. Himeko and Welt meet Pearl, the IPC's CEO of Planarcadia, to decline the alliance while offering cooperation; Pearl, holding three Masks herself, means to steer the Games with the IPC's resources.

Sent to Graphia Academy to recover the Graphia family's heirloom Mask, the Trailblazer is trapped in a false school life by Sparxie's "Cognition Modification" and finds she has already swindled the Mask. Evanescia, arbiter of the Games, pulls them out and lends them her power — and a raccoon mask. Elsewhere, Yao Guang foresees through the Eye of Īśvara that "an Arbiter General will fall" here, and makes Sunday a Supplicant to carve out some hope; Silver Wolf hires the detective Ashveil to find a stolen mask.

At the "World's End" Tavern the crew learn that purging Sparxie would mean "cremating Sparkle". Instead, armed with a memetic weapon bestowed by Aha, they restore the Graphia Academy students and defeat Sparxie. Then a brutal murder at the Synwish Syndicate, in the style of the "Herald of Death", draws Ashveil into the Games to keep order — and with Silver Wolf's bargain for a mask, all eight Supplicants are chosen.` },
    { title: "Unraveled for Daybreak", version: "4.1", spoilerVersion: "4.1", body:
`Himeko's father Ryusuke tours the Express, relieved she has overcome the "Weathering Curse". Pearl reveals herself as a Supplicant and proposes a Star Rail expo, while Ashveil and Kuchiba trace the Dovebrook massacre to the Research Society of Happy Smiles, its founder Fulwish, and a "Happiness Surgery". Blade warns Dan Heng that other powers of the Abundance are at work on Planarcadia.

At the Star Rail FEST, Fulwish TV twists the Trailblazer's interview into public outrage, and the Daybreak Squadron — local heroes in the Alloy King Pom-Pom — attack atop the tower. Everyone falls into the unknown. Ashveil executes three Daybreak Warriors in retribution for Dovebrook, only for it to emerge that they were Supplicants already converted by the Abundance. Pearl suspects Fulwish has a powerful backer, and the Phantasmoon raises the stakes: the winner will now become a true, permanent Aeon of Elation.` },
    { title: "So Laughed the Masses", version: "4.2", spoilerVersion: "4.2", body:
`With Fulwish stirring the public against the Express, Himeko searches Graphia Academy's sealed archives. Fulwish declares herself a survivor of the earlier "Bloodstained Games" and enters the contest. Evanescia and Yao Guang find all of Seafeld City under the Abundance; Blade reveals the surgery's cells come from Shuhu, an Emanator of the Abundance, dismembered and parasitizing its recipients. A "Joy Ascendant" outbreak sweeps the city, and Silver Wolf traces a signal — "Unhappiness is a sin" — to a fake Pearl and the shadowy "Mr. Meanie".

When Fulwish dons a mask to bring down the Games, the Trailblazer gathers the people's Wishpower through the Stellaron, recasts a mask, and defeats her as a Supplicant. Blade draws every Shuhu cell on the planet into himself; tuned by Sunday and compressed by Silver Wolf, Shuhu's giant tree is sealed in Blade's body, held together by the Shard Sword. Evanescia, spent from healing the victims, warns before her hibernation that the Lord Ravager Asat Pramad has returned — and Kuchiba claims what Pearl and the IPC really seek is the remains of Oroboros the Voracity, sealed beneath Planarcadia.` },
    { title: "The Lethe Below the Living", version: "4.3", spoilerVersion: "4.3", body:
`With a Lord Ravager's shadow over the world and the Voracity's husk restless, the Trailblazer sets out for the World in Canvas, sent off with a party in the Express's Party Car. Yao Guang raises her Deca-Light Reflection Barrier to watch for Asat Pramad. Ashveil uncovers ties between the Masked Fool "Enroute", the Navigator "Isee" and Asat Pramad — and is swept away by an unknown force.

Guided by the overdue artist Nihilux to the Inkford Hermitage, the Trailblazer summons Graphia and rides her ferry into the canvas with Blade and Silver Wolf, where Blade leaps into the maw of Voracity and imprisons Shuhu inside himself, forging his own rebirth. Meanwhile Himeko presses Ryusuke about the Bloodstained Games fifteen years ago, and exposes him: "Ryusuke" was Asat Pramad in disguise. Casting off all pretense, he appears across Planarcadia at once and vows to bring its overdue Destruction.` },
    { title: "In Ravages Does the Whistle Sound", version: "4.4", spoilerVersion: "4.4", body:
`Asat Pramad enters the Phantasmoon Games as a Supplicant, turning Planarcadia into an apocalyptic wasteland as his "miracle", and carries Himeko off into the World in Canvas. Her last request: ignite the Express's engine and win the Games. Imagenae driven mad by the Demonic Moon fill the streets, and at Perdido Station the crew find the Express buried in ruins.

Inside the painting, Himeko's past unfolds: struck by the Weathering Curse, she found the stranded Express and restored it, with "Motoko" — an imagenated, grown-up version of herself — as her assistant, before flying it into the stars after the Bloodstained Games. Decoding her message, the crew learn that Asat Pramad manipulates possibility itself. Yao Guang anchors his true form by observation and falls between existence and non-existence. In the final struggle Himeko tries to sacrifice herself; the Stellaron answers the Trailblazer's wish to keep the Trailblaze going, sends them back before the point of no return, and together the crew defeat Asat Pramad. Deep underground, the Voracity's husk begins to wake.` },
    { title: "Imagenae: Holy Grail War", version: "4.4", spoilerVersion: "4.4", body:
`A Trailblaze Continuance from the Fate/stay night [Unlimited Blade Works] collaboration. Chasing a stolen Holy Grail, the Trailblazer ends up bound by contract to Rin Tohsaka, a mage travelling between planes, and drawn into an Imagenae Holy Grail War. Gilgamesh, King of Heroes, joins them (insisting it is the "Uruk Cultural Heritage Foundation").

The true mastermind turns out to be the goddess Ishtar, hiding in Rin's earring. Rin seizes every contract and Command Spell to raise an army even a goddess must respect; the goddess is defeated and reconciled, and before Rin leaves for the next plane she summons all seven Master-Servant pairs once more so everyone can make a wish.` },
  ],
  astropolis: [
    { title: "To Roll the Stars in Astropolis", version: "4.5", spoilerVersion: "4.5", body:
`Asat Pramad gives himself to sate the Voracity's husk, but its awakening is inevitable and Planarcadia teeters. Himeko names the Trailblazer Navigator, and the Express carries refugees to Astropolis — the IPC's City of Converging Stars — to shelter under the Preservation.

There, the six IPC department heads deadlock over Planarcadia's fate, leaving the deciding vote to Arita of the Traditional Project Department. Turned away, the Trailblazer breaks the news of the husk's awakening to the whole city, fights out of a stalling "Pan-Cosmic Trade Summit" at Lodestar Tower, and threatens to roll Asat Pramad's Die to win a face-to-face meeting. The proposal: restart the Phantasmoon Games and use Elation's authority to suppress the husk. Guided by Louis Fleming, Arita votes for the plan and Planarcadia is saved — and Nihilux confesses who she truly is: Aha, the Aeon of Elation.` },
    { title: "Dance With the Beast Before Moonrise", version: "4.6", spoilerVersion: "4.6", body:
`Before the Games restart, Nihilux briefs the Fools and Actors on a performance meant to hunt the Voracity, and needs bait. At Yabuli's Life Sciences Institute, the Trailblazer finds leviathan flesh and blood on the imagenae production line, while Ashveil and Kuchiba, sent by Pearl, learn that Yabuli's hunger for leviathan wisdom lies behind the Herald of Death murders.

Overdosed on Leviathan Essence, Yabuli becomes a frenzied beast and is defeated, and Kuchiba uses the Voracity's shadow to devour the remaining Essence. As Astropolis's Wishpower loop collapses, Lighthouse — who learned through the Die that he was once the Herald of Death — gives up all his Wishpower to keep the city's imagenae alive. With Asat Pramad's Die as the bait instead, Pearl charts a route back to the Phantasmoon Courtyard, and Nihilux summons a gondola to the grandest Phantasmoon Games in the arcadia's history.` },
  ],
};

export const WORLD_CHAPTERS = Object.entries(CHAPTERS_BY_WORLD).flatMap(([worldSlug, chapters]) =>
  chapters.map((c, i) => ({ ...c, slug: `${worldSlug}-${i + 1}`, worldSlug, sortOrder: i + 1 })),
);
