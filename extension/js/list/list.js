import {Videos, Streams} from './mediatypes.js';
import {elements} from './elements.js';
import {settings} from '../settings.js';
import {Pagination} from '../utils/pagination.js';
import {utils} from '../utils/utils.js';



const twitchGames = ["Counter-Strike: Global Offensive", "Fortnite", "World of Warcraft", "League of Legends", "IRL", "Hearthstone", "PLAYERUNKNOWN'S BATTLEGROUNDS", "Destiny 2", "Dota 2", "SCUM", "Overwatch", "Battlefield V", "Casino", "Tom Clancy's Rainbow Six: Siege", "Escape From Tarkov", "Grand Theft Auto V", "Barbie and the Magic of Pegasus", "Path of Exile", "Dead by Daylight", "Clash Royale", "Heroes of the Storm", "Old School RuneScape", "Always On", "Football Manager 2018", "Two Point Hospital", "Poker", "FIFA 19", "Talk Shows", "Creative", "Minecraft", "World of Tanks", "Music", "StarCraft II", "Rocket League", "Dragon Quest XI", "Princess Connect! Re: Dive", "Monster Hunter World", "Age of Empires II", "Black Desert Online", "Dead Frontier 2", "Resident Evil 7 biohazard", "Smite", "Slay the Spire", "Lineage II", "Magic: The Gathering", "Summoners War: Sky Arena", "Fallout 4", "7 Billion Humans", "Warframe", "Realm Royale", "The Elder Scrolls: Legends", "Europa Universalis IV", "Dark Souls II: Scholar of the First Sin", "Ultimate Fishing Simulator", "Tibia", "Retro", "Tekken 7", "FIFA 18", "They Are Billions", "World of Warships", "Gwent: The Witcher Card Game", "Steam", "Total War: Warhammer II", "Heroes of Might and Magic III: The Shadow of Death", "Rust", "Paladins", "Quake Champions", "Warcraft III: The Frozen Throne", "My Summer Car", "osu!", "Street Fighter V", "ARK", "Pok\u00e9mon Ultra Sun/Ultra Moon", "Arena of Valor", "Graveyard Keeper", "NHL 19", "SpyParty", "Monster Hunter Generations Ultimate", "Divinity: Original Sin II", "Heroes of Newerth", "Pro Evolution Soccer 2019", "For Honor", "FINAL FANTASY XIV Online", "Twitch Plays", "Overcooked! 2", "Hollow Knight", "Super Mario Maker", "The King of Fighters '98: The Slugfest", "The King of Fighters '94", "Dark Souls III", "Diablo III: Reaper of Souls", "Unravel 2", "The Messenger", "Russian Fishing 4", "Pok\u00e9mon Omega Ruby/Alpha Sapphire", "Command & Conquer: Red Alert 2", "The Elder Scrolls Online", "NBA 2K19", "Games + Demos", "Darksiders II", "Uncharted 4: A Thief's End", "HITMAN", "The Jackbox Party Pack 4", "The Legend of Zelda: The Wind Waker HD", "Northgard", "Call of Duty: Black Ops II", "Catherine", "Shadows: Awakening", "FTL: Faster Than Light", "Metro: Last Light", "Soul Worker", "Mabinogi", "Forza Horizon 3", "Duelyst", "Assassin's Creed Syndicate", "Trove", "The Crew 2", "Super Mario Odyssey", "APB Reloaded", "BeamNG.Drive", "Final Fantasy XV", "The Witcher 2: Assassins of Kings", "Injustice 2", "Borderlands: The Pre-Sequel!", "Golden Sun: The Lost Age", "Social Eating", "World of Tanks Console", "Dark and Light", "Super Mario 64 DS", "CABAL Online", "Dragon Age: Inquisition", "Mass Effect 3", "DCS World", "Alundra", "Super Mario Galaxy", "Xenoblade Chronicles 2", "Pok\u00e9mon Yellow: Special Pikachu Edition", "Portal 2", "PlanetSide 2", "Puzzle & Dragons", "Fishing Planet", "Free Fire: Battlegrounds", "Just Dance 2018", "State of Decay 2", "Celeste", "Minion Masters", "Call of Duty: Infinite Warfare", "Layers of Fear", "BattleTech", "I Wanna Be The Guy", "NBA Live 19", "Middle-earth: Shadow of War", "Planet Coaster", "BBO2 Online", "Emily Wants to Play Too", "Fallout 3", "Mafia III", "Empyrion: Galactic Survival", "Shenmue I & II", "Foul Play", "The Lord of the Rings Online", "Frostpunk", "Tree of Savior", "Horizon Zero Dawn", "Albion Online", "Call of Duty: Black Ops 4", "Honkai Impact 3", "Wizard101", "Absolver", "Thief: The Dark Project", "Bless Online", "Battle Brothers", "Kingdom Rush", "Phoenix Wright: Ace Attorney", "Asterix and Obelix", "XCOM 2", "Total War: Attila", "Stronghold Crusader", "Mega Man X Anniversary Collection", "The Long Dark", "THE iDOLM@STER", "Oddworld: Abe's Exoddus", "Painkiller: Overdose", "SOS", "Five Nights at Freddy's 3", "Nickelodeon: Rocket Power - Beach Bandits", "Z", "Mega Man Legacy Collection 2", "Guitar Hero", "Marvel vs. Capcom Infinite", "F\u00fatbol", "Jubeat", "Guild Wars: Eye of the North", "Super Street Fighter II Turbo", "Dead Island Riptide", "Ascendant One", "Yet Another Research Dog", "Art of War: Red Tides", "iOS Gaming", "From TV Animation - Slam Dunk: I Love Basketball", "Assassin's Creed", "Forge of Empires", "Forts", "I Am Bread", "Line Rider JavaScript", "Dominions 5: Warriors of the Faith", "Penumbra: Overture", "Tank Force", "Pro Evolution Soccer 2017", "Draft Day Sports: Pro Football 2016", "Classic Collection: Adventure/Fantasy", "Mr. Robot and His Robot Factory", "FIFA 14", "Pok\u00e9mon Play It!", "Trine 2", "slither.io", "Hurtworld", "Snake", "Garou: Mark of the Wolves", "Farm Together", "Little Inferno", "Ninja Gaiden Black", "Rising Storm 2: Vietnam", "Legend of Mana", "Warspear Online", "Owlboy", "Bloodborne: The Old Hunters", "The Walking Dead - The Final Season", "Chaos on Deponia", "Agents of Mayhem", "FAR: Lone Sails", "Ninja Blade", "Sonic Adventure", "Lightning Returns: Final Fantasy XIII", "Kero Blaster", "Dragon Quest Heroes II", "Galactic Civilizations III", "UnEpic", "Castlevania: Harmony of Dissonance", "Conan", "Cat Quest", "Baby Hands", "SimCity: Cities of Tomorrow", "Machinarium", "Sonic and the Secret Rings", "Styx: Master of Shadows", "Wild West Online", "Skiing", "Conquer Online", "Storyteller", "Street Fighter II': Champion Edition", "Duke Nukem", "Avorion", "Guitar Hero: Warriors of Rock", "Dying Light: Bad Blood", "Baldur's Gate II: Throne of Bhaal", "Test Drive: Off-Road: Wide Open", "Clicker Heroes", "Final Fantasy XV Pocket Edition", "Tetris The Grand Master 3: Terror Instinct", "Gothic II", "Duke Nukem 3D", "Dark Wizard", "Wii Sports", "Habbo Hotel", "Grand Chase for kakao", "Dungreed", "Death end re;Quest", "Five Nights at Freddy's 4: The Final Chapter", "Stonehearth", "Day of Defeat: Source", "Dungeon of the Endless", "Die Young", "Small Radios Big Televisions", "Disgaea 5: Alliance of Vengeance", "Fe", "We Were Here Too", "Dragon Oath", "Titan Quest", "S.T.A.L.K.E.R.: Clear Sky", "Marvel vs. Capcom 3: Fate of Two Worlds", "Legends of Aria", "World End Syndrome", "Cossacks 3", "Victor Vran", "Arizona Sunshine", "Dissidia Final Fantasy NT", "Counter-Strike: Source", "Fallout 2", "The Long Reach", "Dragon Quest V: Hand of the Heavenly Bride", "Etterna", "LEGO Harry Potter: Years 1-4", "Halo: Reach", "Animal Crossing", "Dead Rising 4", "Freestyle Street Basketball 2", "Ultimate General: Civil War", "Pok\u00e9mon Pinball: Ruby & Sapphire", "Zelda II: The Adventure of Link", "Little Nightmares", "Ys: The Oath in Felghana", "Batman: The Enemy Within - The Telltale Series", "AMBER: Journeys Beyond", "Halo Wars 2", "Mass Effect: Andromeda", "Moonfall", "Crash Bandicoot: Warped", "Call of Duty 2", "Resident Evil: Director's Cut", "Divinity: Original Sin", "Nyan Cat: Lost in Space", "Malkyrs: Arenas Of Eternity", "Darkwood", "Total War: Shogun 2", "Baldur's Gate", "Far Cry: Primal", "Deus Ex: Human Revolution Director's Cut", "Honkai Impact", "Cry Of Fear", "Trailmakers", "Fractured Lands", "Blackjack", "Age of Wonders III", "Final Fantasy XII: The Zodiac Age", "Far Cry 4", "EA Sports UFC 2", "Banished", "Shadow Warrior 2", "Live", "Hacknet", "DTXMania XG", "Sonic Adventure 2: Battle", "The Legend of Dark Witch", "Avernum", "Hot Lava", "I Wanna Be the Co-Op", "Kirby Super Star", "Divinity II: Ego Draconis", "Zwift", "The Surge", "Final Fantasy III", "Robot Arena: Design & Destroy", "Cultures", "Xenogears", "Spiral Knights", "Lara Croft Tomb Raider: Anniversary", "Gravity Rush 2", "This War of Mine", "Aura Kingdom", "IL-2 Sturmovik: Battle of Stalingrad", "AER", "Witch Hunt", "Job Simulator: The 2050 Archives", "Resident Evil 2", "Resident Evil: Revelations", "Karaoke Joysound", "Castle Clash", "Mario and Luigi: Bowser's Inside Story + Bowser Jr.'s Journey", "Ys: Memories of Celceta", "428: In the Blocked City, Shibuya", "Kathy Rain", "Dragon Age: Origins - Awakening", "Fantasy Earth Zero", "Skyforge", "Mario Party 3", "The Banner Saga", "Saints Row IV", "Choice Chamber", "God Hand", "The Settlers II: Veni, Vidi, Vici", ".hack//G.U. Last Recode", "Indiana Jones and the Fate of Atlantis", "Lost Ark Online", "Far Cry 3: Blood Dragon", "X-Plane 11", "Riders of Icarus", "Spacelords", "Minimax Tinyverse", "The Elder Scrolls III: Morrowind", "The Red Strings Club", "Dishonored 2", "Darksiders", "Impossible Creatures", "Life Is Strange: Before the Storm", "Halo: Combat Evolved", "MapleStory M", "Miscreated", "Pok\u00e9mon HeartGold/SoulSilver", "Shin Megami Tensei: Persona 4", "Tales from the Borderlands", "Wreckfest", "Idle Champions of the Forgotten Realms", "Astroneer", "Rules of Survival", "Revelation Online", "Town of Salem", "Mario Tennis Aces", "MapleStory 2", "Dragon Nest", "Killing Floor: Incursion", "Far Cry 3", "Vampyr", "Slime Rancher", "Warcraft III: Reign of Chaos", "Dead Rising", "Light Fall", "Raiders of the Broken Planet", "The Legend of Zelda: Phantom Hourglass", "Mount & Blade: Warband", "WWE SuperCard", "Ash of Gods", "Shadow Tactics: Blades of the Shogun", "Metal Gear Solid 2: Sons of Liberty", "Batman: Arkham Origins", "Dead Space 3", "Azure Striker Gunvolt", "S.T.A.L.K.E.R.: Call of Pripyat", "Depth", "Duke Nukem 3D: 20th Anniversary World Tour", "The Flame in the Flood", "Star Wars: Knights of the Old Republic", "Gears of War", "Tales of Xillia 2", "Doki Doki Literature Club", "Soccer Spirits", "Education Series: General Knowledge Builder", "The Talos Principle", "Project CARS 2", "Rayman", "Tomb Raider (1996)", "Danganronpa V3: Killing Harmony", "Sid Meier's Civilization VI", "ArcheAge", "The Lord of the Rings: The Battle for Middle-earth", "Super Meat Boy", "Crypt of the NecroDancer", "TRAIN SIMULATOR 2018", "F1 2017", "World of Final Fantasy", "The Order: 1886", "Marvel Future Fight", "Borderlands: The Handsome Collection", "Super Mario World 2: Yoshi's Island", "Dreadnought", "Pok\u00e9mon Black/White", "Comedy Night", "Surviving Mars", "Super Mario Bros.", "Vampire: The Masquerade - Bloodlines", "Fable", "Rend", "Baldur's Gate II: Shadows of Amn", "Warhammer Online: Age of Reckoning", "Breath of Fire IV", "Uncharted: The Nathan Drake Collection", "Dream Daddy: A Dad Dating Simulator", "Age of Empires: Definitive Edition", "Dead Island: Definitive Collection", "Hellblade", "Keep Talking and Nobody Explodes", "Clicker Heroes II", "Satellite Reign", "BATMAN - The Telltale Series", "Captain Tsubasa: Dream Team", "Dark Souls II", "Dragon Age II", "SpeedRunners", "Poly Bridge", "Batman: Arkham Knight", "Plants vs. Zombies: Garden Warfare 2", "This Is the Police 2", "Trine 3: The Artifacts of Power", "Fractured Space", "Mario + Rabbids Kingdom Battle", "The Vanishing of Ethan Carter", "Middle-earth: Shadow of Mordor", "Lobotomy Corporation | Monster Management Simulation", "Hay Day", "Sniper Elite 4", "King's Quest", "Grand Theft Auto: Episodes from Liberty City", "Batman: Arkham Asylum", "Dead In Vinland", "Drakensang Online", "testinggame", "SuperPower 2", "Cryostasis", "Assassin's Creed III", "Deponia: The Complete Journey", "DJMAX Respect", "Supraland", "Quiplash", "Crashday Redline Edition", "Cataclysm: Dark Days Ahead", "Love Live! School Idol Festival", "Slaves to Armok II: Dwarf Fortress", "Monopoly", "Pok\u00e9mon Diamond/Pearl", "Castle Clash", "AER", "Lara Croft Tomb Raider: Anniversary", "Karaoke Joysound", "Fantasy Earth Zero", "Spacelords", "Onmyoji Arena", "Shining Resonance", "Far Cry 4", "428: In the Blocked City, Shibuya", "Final Fantasy XII: The Zodiac Age", "Banished", "SpongeBob SquarePants: Battle for Bikini Bottom", "Shadow Warrior 2", "Mario Party 3", "Five Nights at Freddy's", "The Banner Saga", "EA Sports UFC 2", "Spiral Knights", "Passpartout: The Starving Artist", "Resident Evil: Revelations", "I Wanna Be the Co-Op", "WSOP", "Postal 2", "Lords of the Fallen", "Monolith", "Heroes of Might and Magic IV", "GunZ The Duel", "Stationeers", "Star Wars: Episode I - Racer", "Prince of Persia", "South Park: The Stick of Truth", "Players Unknown Battle Grand", "S4 League", "Brothers: A Tale of Two Sons", "Pok\u00e9mon Battle Revolution", "Mega Man X6", "RiME", "Galaxy Online 2", "Last Day On Earth: Survival", "Cube World", "Dead or Alive 5 Last Round", "Crowntakers", "Age of Empires", "ReCore", "Hue", "LEGO The Lord of the Rings", "LEGO Star Wars: The Complete Saga", "We Were Here", "Final Fantasy Mystic Quest", "Beyond Good & Evil", "War Dragons", "Moonlight Blade", "Castlevania II: Simon's Quest", "Rayman 3: Hoodlum Havoc", "Sleeping Dogs", "Overlord: Raising Hell", "Life is Feudal: Your Own", "Warhammer: End Times \u2013 Vermintide", "Tropico 5", "Mortal Online", "Bloodstained: Curse of the Moon", "Ratchet & Clank: Size Matters", "Icewind Dale: Enhanced Edition", "Exanima", "Harry Potter and the Deathly Hallows: Part 1", "Resident Evil Zero HD", "Sword Legacy: Omen", "Naruto Shippuden: Ultimate Ninja Storm 3 Full Burst", "Shantae: Half-Genie Hero", "Lockheed Martin: Prepar3D", "The Spiral Scouts", "3on3 FreeStyle", "Pinball", "Sword Art Online: Integral Factor", "Metal Gear Solid", "Quiz RPG: The World of Mystic Wiz", "Dragon Ball XenoVerse", "The Legend of Zelda: Twilight Princess", "Donkey Kong 64", "Ken Follett's The Pillars of the Earth", "Super Buster Bros.", "Ben and Ed: Blood Party", "GORN", "To the Moon", "Pok\u00e9mon Trading Card Game", "The Legend of Zelda: Ocarina of Time 3D", "Yoshi's Story", "Digimon World: Next Order", "Monster Hunter Frontier Z", "Rabi-Ribi", "The Black Death", "Tennis", "Lethal League", "Faeria", "Vikings: Wolves of Midgard", "Fable III", "Mega Man X3", "Gex: Enter the Gecko", "TrackMania Turbo", "Dungeon of the Endless", "FIFA 14", "Endless Frontier", "The Secret of Monkey Island", "Super Castlevania IV", "Looping", "SOS", "R.B.I. Baseball 18", "Let Them Come", "Farm Together", "N++", "Ascendant One", "Saints Row 2", "Sonic Adventure", "Ninja Gaiden Black", "Ultimate Chicken Horse", "Tactics Ogre: Let Us Cling Together", "From TV Animation - Slam Dunk: I Love Basketball", "Dominions 5: Warriors of the Faith", "Dungreed", "Basketball", "Golf It!", "We Were Here Too", "Let's Draw!", "Battle Ground", "Jade Cocoon: Story of the Tamamayu", "The Wolf Among Us", "Pok\u00e9mon Quest", "Party Hard", "Dead Rising 3", "Classic Collection: Adventure/Fantasy", "Jurassic World: Alive", "Rogue Galaxy", "Stern Pinball Arcade", "Grand Chase for kakao", "Stonehearth", "Wii Sports", "Alicia Online", "Guild Wars: Eye of the North", "Conarium", "Pok\u00e9mon Gold/Silver", "Cat Quest", "XCOM: Enemy Unknown", "Dead Frontier", "Oddworld: Abe's Exoddus", "Five Nights at Freddy's 3", "Nox", "Lightning Returns: Final Fantasy XIII", "Mortal Kombat", "Onrush", "Test Drive: Off-Road: Wide Open", "Counter-Strike: Condition Zero", "UnEpic", "Live a Live", "Five Nights at Freddy's 4: The Final Chapter", "Forts", "Marvel vs. Capcom Infinite", "Dying Light: Bad Blood", "GAMES Interactive", "Red Dead Redemption: Undead Nightmare", "Warspear Online", "Day of Defeat: Source", "Bugs Bunny Lost in Time", "Jubeat", "Bloons Adventure Time TD", "Boxing Fight", "Assassin's Creed", "Granny", "Diddy Kong Racing", "Grip", "Destroy All Humans!", "Broforce", "Mr. Robot and His Robot Factory", "Dragon Oath", "Ultima Online: Renaissance", "Draft Day Sports: Pro Football 2016", "Zombies", "Grand Theft Auto 2", "Saints Row", "Guitar Hero: Warriors of Rock", "Small Radios Big Televisions", "Solitaire", "Monopoly Family Fun Pack", "GoldenEye 007", "Wolfenstein: The Old Blood", "Sacred", "Wasteland 2", "Fire Emblem Fates", "Bus Simulator 18", "The King of Fighters XIV", "The Binding of Isaac: Rebirth", "Phoenix Wright: Ace Attorney - Justice For All", "Dig Or Die", "Fire Emblem: The Sacred Stones", "The Legend of Heroes: Trails of Cold Steel", "Jurassic World: The Game", "Yooka-Laylee", "Borderlands", "Deus Ex: Mankind Divided", "Eradicator", "Back to Bed", "Wolfenstein II: The New Colossus", "La-Mulana", "Orcs Must Die! 2", "Star Trek: Bridge Crew", "Warzone", "World of Warplanes", "Metal Gear 2: Solid Snake", "Puzzle", "WarRock", "Need for Speed: Hot Pursuit", "Pok\u00e9mon Trading Card Game Online", "Gang Beasts", "Secret World Legends", "War for the Overworld", "Just Survive", "The Simpsons: Hit & Run", "007: Nightfire", "Gothic", "Dragonica", "Sword Art Online: Hollow Realization", "Supreme Commander: Forged Alliance", "Steep", "Hitman 2: Silent Assassin", "Subsistence", "Neverwinter Nights", "Bus Driver Simulator 2018", "Liftoff", "Project Zomboid", "DiRT Rally", "Devil May Cry 4", "Dungeons 3", "Marble Racing", "Battle Chasers: Nightwar", "One Piece: Pirate Warriors 3", "The Legend of Zelda", "Mega Man 6", "Move or Die", "Rage", "The Last Guardian", "Watch Dogs", "Dragon Quest Monsters: Terry no Wonderland 3D", "Mafia", "The Amazing Spider-Man 2", "Shogi", "PC Building Simulator", "Home Sweet Home", "WildStar", "The Jackbox Party Pack 2", "Black Mesa", "Captain Toad: Treasure Tracker", "Brawlout", "DDTANK", "Cry Of Fear", "Deus Ex: Human Revolution Director's Cut", "Honkai Impact", "Prototype", "Baldur's Gate", "The Long Reach", "DanMachi: Memoria Freese", "Pyre", "Natural Selection II", "Nyan Cat: Lost in Space", "Max Payne 2: The Fall of Max Payne", "Hatsune Miku: Project Diva Future Tone", "Halo: Reach", "Cossacks 3", "Call of Duty 2", "Sdorica -sunset-", "Ultimate General: Civil War", "Trailmakers", "Star Wars: Jedi Knight - Jedi Academy", "RaceRoom Racing Experience", "Age of Wonders III", "Blackjack", "Riders of Icarus", "Gorogoa", "Arizona Sunshine", "Fractured Lands", "Anarchy Arcade", "AMBER: Journeys Beyond", "Animal Crossing", "Final Fantasy: Brave Exvius", "Naruto Shippuden: Ultimate Ninja Storm 4", "Tom Clancy's Ghost Recon: Wildlands", "Final Fantasy X", "Mario Tennis Aces", "skribbl.io", "Dungeon Hunter Champions", "Call of Duty: Modern Warfare Remastered", "NieR Automata", "Spyro the Dragon", "Resident Evil 5", "Prey", "S.T.A.L.K.E.R.: Shadow of Chernobyl", "Border Break", "Unturned", "The Legend of Heroes: Trails of Cold Steel II", "Puyo Puyo Tetris", "Titanfall 2", "MapleStory 2", "Pok\u00e9mon Colosseum", "Kingdom Hearts HD II.5 Remix", "Half-Life: Counter-Strike", "Pok\u00e9mon Crystal", "Mafia II", "NHL 18", "Death Road to Canada", "Identity V", "Final Fantasy IV", "AO Tennis", "Cuisine Royale", "Gary Grigsby's War in the East", "Company of Heroes: Tales of Valor", "Resident Evil 6", "Rivals of Aether", "Obscure: The Aftermath", "My Time at Portia", "Let It Die", "SCP: Secret Laboratory", "Final Fantasy IX", "Artifact", "A Way Out", "Half-Life 2", "La-Mulana 2", "Need for Speed", "Unreal Engine", "Danganronpa: Trigger Happy Havoc", "Assetto Corsa", "MU Legend", "Awesomenauts", "Virtual Reality", "Zone of the Enders: The 2nd Runner", "Destiny", "Animal Crossing: Pocket Camp", "Fear the Wolves", "Inside", "Dishonored", "Grand Theft Auto III", "ShellShock Live", "\u014ckami", "Batman: Arkham City", "Dragon Age: Origins", "Into the Breach", "Total War: ARENA", "Backgammon", "Gartic", "IRONSIGHT", "Resident Evil: Revelations 2", "Dragon's Dogma: Dark Arisen", "Shadow of the Colossus", "Battle of the Immortals", "State of Mind", "Mass Effect", "The Alchemist Code", "Mega Man X", "Alan Wake", "Final Fantasy VIII", "Bayonetta", "Rogue Legacy", "Spider-Man: The Movie", "The Universim", "Pok\u00e9mon FireRed/LeafGreen", "VA-11 HALL-A", "Everspace", "Warhammer 40,000: Inquisitor Martyr", "Red Dead Redemption", "Star Wars: Galaxy of Heroes", "Battlefield 3", "The Elder Scrolls IV: Oblivion", "Donkey Kong Country", "Vindictus", "Flyff - Fly For Fun", "Starbound", "Alice: Madness Returns", "Post Scriptum: The Bloody Seventh", "Monster Hunter 4 Ultimate", "Growtopia", "BioShock 2", "Trials Fusion", "DC Universe Online", "Yu-Gi-Oh! Legacy of the Duelist", "Pinstripe", "Castlevania: Symphony of the Night", "Ori and the Blind Forest", "Geometry Dash", "Black Squad", "Black Survival", "Ni no Kuni II: Revenant Kingdom", "Tomb Raider", "Dungeons & Dragons Online", "XCOM 2: War of the Chosen", "Far Cry 5", "Darwin Project", "The Walking Dead", "Metro Redux", "Detroit: Become Human", "Donkey Kong Country 2: Diddy's Kong Quest", "Undertale", "Boundless", "Gran Turismo Sport", "MLB The Show 18", "WWE 2K18", "Knights Chronicle", "The Evil Within 2", "Friday the 13th: The Game", "Payday 2", "Persona 5", "BlazBlue Cross Tag Battle", "surviv.io", "Left 4 Dead 2", "Sid Meier's Civilization VI: Rise & Fall", "Kantai Collection", "Dying Light", "Ultima Online", "Super Mario Sunshine", "Metal Gear Solid V: The Phantom Pain", "Grim Dawn", "Fist of the North Star", "Assassin's Creed Origins", "Prison Architect", "Board Games", "Guild Wars", "Programming", "Heroes & Generals", "Getting Over It", "Until Dawn", "Donut County", "Entropia Universe", "Granblue Fantasy", "Garry's Mod", "Alliance of Valiant Arms", "Final Fantasy XIII", "Pok\u00e9mon Platinum", "Resident Evil", "Aliens Versus Predator", "Grand Theft Auto: Vice City", "Gothic II: Night of the Raven", "The Legend of Zelda: Majora's Mask", "Game Development", "Yu-Gi-Oh! Forbidden Memories", "Yakuza 0", "Golf With Your Friends", "Firewall Zero Hour", "Digimon Story: Cyber Sleuth", "Don't Starve Together", "Space Engineers", "Star Trek Online", "Crossout", "Battlefield 4", "Resident Evil 3: Nemesis", "Stellaris", "Warhammer: Vermintide 2", "Tales of Berseria", "Call of Duty: Ghosts", "Rocksmith 2014", "Awkward", "Final Fantasy XI Online", "Nine Parchments", "BioShock Infinite", "Elsword", "Flat Heroes", "Spore", "zombsroyale.io", "Call of Duty: Modern Warfare 3", "I Wanna Be The Boshy", "Eco", "Yakuza Kiwami", "Human: Fall Flat", "The iDOLM@STER Cinderella Girls: Starlight Stage", "Kingdom Come: Deliverance", "Titan Souls", "Age of Empires III: The Asian Dynasties", "Guitar Hero III: Legends of Rock", "EverQuest", "Papers, Please", "Fighting EX Layer", "Devil May Cry 4: Special Edition", "Go", "Call of Duty: Black Ops", "Spyro 2: Ripto's Rage", "Spelunky", "NOISZ", "Serious Sam: The First Encounter", "Pixel Puzzles Ultimate", "Kingdom Hearts", "Sonic Heroes", "Pac-Man", "THE iDOLM@STER MILLION LIVE! THEATER DAYS", "Legendary", "Breath of Fire III", "Jurassic Park", "Lara Croft and the Guardian of Light", "Kingdom Hearts HD 1.5 ReMIX", "SEGA Mega Drive & Genesis Classics", "The Binding of Isaac", "Tokimeki Memorial 2", "Metal Gear Solid 2: Substance", "Mount & Blade Warband: Viking Conquest", "Agatha Knife", "Resident Evil Zero", "Necropolis", "Final Fantasy Tactics", "Broken Sword: The Shadow of the Templars", "HoPiKo", "Worlds Adrift", "Summer Carnival '92: Recca", "Blizzard", "Tomba!", "America's Army: Proving Grounds", "Cultist Simulator", "Spider-Man: Shattered Dimensions", "Resogun", "Trainz: A New Era", "Monster Super League", "Axiom Verge", "Star Trek Adversaries", "Shenmue II", "Fable Anniversary", "Bloons TD 5", "Pavlov VR", "Stronghold Kingdoms", "Disney's Magical Quest Starring Mickey & Minnie", "WWE 2K15", "Dark Cloud 2", "Suikoden II", "Die Siedler: Das Erbe der K\u00f6nige (Gold Edition)", "Fallout", "Ants", "Naruto Shippuden: Ultimate Ninja Storm Revolution", "Mad Games Tycoon", "Pok\u00e9mon Black/White Version 2", "Critical Ops", "Battlefield Hardline", "Chasm", "Destiny Knights", "Umbrella Corps", "Uno", "JoJo's Bizarre Adventure", "White Noise 2", "Suikoden V", "Fable II", "Car Mechanic Simulator 2015", "System Shock", "Agony", "Resident Evil: Survivor", "Robot", "Watch Dogs 2", "Future Unfolding", "Sonic the Hedgehog", "Anno 1404", "Bullet Girls Phantasia", "This Is the Police", "WWE SLAM: Card Trader", "Star Conflict", "NaissanceE", "Blue Reflection", "Call of Duty: World at War", "Force of Will - TCG", "Mario Party 2", "Jotun", "Pro Evolution Soccer 2018", "Touhou 08 - Imperishable Night", "SimAirport", "Hive Jump", "Polybius", "Natural Selection", "Skyrim: Very Special Edition", "Max Payne", "Aim Hero", "Pok\u00e9mon Sun/Moon", "Saint Seiya: Soldiers' Soul", "Monster Hunter Online", "Xenoblade Chronicles", "Piposh", "Pro Evolution Soccer 2016", "Jak II", "Shin Megami Tensei: Persona 3 FES", "The Great Merchant", "Observer", "Dragon Quest VIII: Journey of the Cursed King", "Special Forces", "King of Kings 3", "Doom 3: Resurrection of Evil", "Touhou 10 - Mountain of Faith", "Gems of War", "Child of Light", "Pok\u00e9mon Shuffle", "Tactical Monsters Rumble Arena", "Knives Out", "Forgotton Anne", "Kirby & The Amazing Mirror", "Aim Hero", "Animal", "Mantis Burn Racing", "Warlords: Battlecry II", "Spintires: MudRunner", "Claybook", "Napoleon: Total War", "TV Station Manager", "Mega Man X4", "Flipping Death", "Kingdoms and Castles", "Just Cause 3", "X-Morph: Defense", "Long Live the Queen", "Metal Gear Survive", "Oblivion", "Pit People", "Bully", "Final Fantasy: The 4 Heroes of Light", "Pitfall!", "Chivalry: Medieval Warfare", "Observer", "Monster Hunter Online", "Mirror's Edge Catalyst", "RPG Maker", "Yakuza 3", "Dragon Slayer Gaiden", "Tower of Saviors", "Dungeons of Dredmor", "Special Force", "Pro Evolution Soccer 2016", "Professor Layton and the Curious Village", "Asphalt 9: Legends ", "FIFA 98: Road to World Cup", "Xenoblade Chronicles", "Zombie Army Trilogy", "Heroes Evolved", "Bendy and the Ink Machine", "The Legend of Zelda: Oracle of Seasons", "Dragon Warrior II", "Radio Active", "Orwell", "Stalker Online", "Sonic Blast Man II", "Stock Market: The Game", "Rampage Knights", "Jak II", "Hello Kitty Online", "The Legend of Zelda: Four Swords Adventures", "Dragon Quest VII: Eden no Senshitachi", "Monopoly Plus", "Battlefield: Bad Company 2", "From TV Animation - Slam Dunk: I Love Basketball", "Agents of Mayhem", "SimCity: Cities of Tomorrow", "Wild West Online", "The Powerpuff Girls: Chemical X-Traction", "Street Fighter II': Champion Edition", "Medal of Honor: Allied Assault", "Tenhou", "Dominions 5: Warriors of the Faith", "Kennedy Approach", "Mordheim: City of the Damned", "Bugs Bunny Lost in Time", "ShootMania Storm", "Snake", "Ultima Online: Renaissance", "UnEpic", "Grip", "Nickelodeon: Rocket Power - Beach Bandits", "Art of War: Red Tides", "Granny", "Forsaken World", "Conker's Bad Fur Day", "Sonic Adventure", "Lightning Returns: Final Fantasy XIII", "Tetris The Grand Master 3: Terror Instinct", "NBA Live 18", "Sonic and the Secret Rings", "Party Hard", "Solitaire", "Yet Another Research Dog", "Mega Man Legacy Collection 2", "Dead Island Riptide", "The Wolf Among Us", "Brawl Stars", "Forts", "iOS Gaming", "Oddworld: Abe's Exoddus", "Grand Theft Auto IV", "Academia: School Simulator", "Super Mario 64", "Battlefield 1", "Metroid Prime", "Neverwinter", "The Legend of Zelda: A Link to the Past", "Dirty Bomb", "The Forest", "Fallout: New Vegas", "Company of Heroes 2", "Blood Bowl 2", "BioShock", "Mount Your Friends", "Wrestling", "Super Smash Bros. Melee", "Life Is Strange", "Outlast 2", "Space Rangers HD: A War Apart", "Halo 5: Guardians", "StarCraft", "Need for Speed: Most Wanted (2005)", "Diablo II: Lord of Destruction", "MechWarrior Online", "Resident Evil HD Remaster", "Warface", "Yu-Gi-Oh! Duel Links", "We Happy Few", "Dofus", "Hearts of Iron IV", "iRacing.com", "Zula", "Star Wars Battlefront II", "Conan Exiles", "Plants vs. Zombies", "War Thunder", "Subnautica", "Stocks And Bonds", "Sid Meier's Civilization V", "Raft", "Motorsport Manager", "Battlerite", "House Flipper", "Kerbal Space Program", "The Last of Us", "Factorio", "The Witcher", "Corpse Party", "Grand Theft Auto: San Andreas", "Cities: Skylines", "Super Smash Bros. for Wii U", "Azur Lane", "Alien: Isolation", "Aion", "Star Wars: The Old Republic", "Mega Man X Anniversary Collection 2", "Pok\u00e9mon Red/Blue", "Modern Warfare 2", "Planet Alpha", "Girls Frontline", "Oxygen Not Included", "Mario Kart 8", "Dauntless", "Last Tide", "A Hat in Time", "Insurgency: Sandstorm", "Brawlhalla", "Supreme Ruler 2020: Global Crisis", "Super Metroid", "Tom and Jerry: Fists of Furry", "Project Highrise", "Octopath Traveler", "Vainglory", "Music For Everyone", "Total War: Rome II", "Silkroad Online", "Might & Magic: Elemental Guardians", "Pokk\u00e9n Tournament", "Jurassic World Evolution", "Crash Bandicoot: N. Sane Trilogy", "Tera", "Cuphead", "Resident Evil 4", "Mu Online", "Final Fantasy X/X-2 HD Remaster", "Deceit", "Wolfenstein: The New Order", "DragonBall Z: Dokkan Battle", "Clash of Clans", "God of War III", "Doom", "Little Dragons Cafe", "Dragon Quest Builders", "Plants vs. Zombies: Heroes", "American Truck Simulator", "F1 2018", "Banjo-Kazooie", "The Jackbox Party Pack 3", "Pinstripe", "Castlevania: Symphony of the Night", "testinggame", "Cryostasis", "Mad Max", "Insurgency", "Deponia: The Complete Journey", "Warhammer Online: Age of Reckoning", "Lara Croft Tomb Raider: The Angel of Darkness", "DJMAX Respect", "Supraland", "Batman: Arkham Asylum", "The Stanley Parable", "SuperPower 2", "Pok\u00e9mon Diamond/Pearl", "Warhammer 40,000: Space Marine", "King's Bounty: The Legend", "Resident Evil: Outbreak", "Dead In Vinland", "Digimon Masters", "Hay Day", "Love Live! School Idol Festival", "Burnout Paradise", "Far Cry", "Monopoly", "Silent Hill 3", "Sniper Elite 4", "Theme Hospital", "Not Tonight", "Heavy Metal Machines", "Islands of Nyne: Battle Royale", "Tony Hawk's Pro Skater", "Drakensang Online", "Mega Man Zero 3", "Hand Simulator", "Ultimate Custom Night", "SOMA", "South Park: The Fractured But Whole", "Enslaved: Odyssey to the West", "The Golf Club 2019 Featuring PGA Tour", "Anime Land", "Yu-Gi-Oh! Online", "Coloring Pixels", "NBA 2K17", "Breath of Fire: Dragon Quarter", "Star Wars: Galaxies - An Empire Divided", "Defiance 2050", "Mega Man X2", "Guacamelee! 2", "Salt and Sanctuary", "de Blob 2", "Ninjin: Clash of Carrots", "New Super Mario Bros. Wii", "Startup Company", "Dragon Quest VI: Realms of Revelation", "Sword Art Online: Fatal Bullet", "Psychonauts", "Freedom Planet", "Toontown Online", "ELEX", "SHIFT 2: Unleashed", "Catlateral Damage", "Metroid Prime 3: Corruption", "Saints Row: The Third", "Limbo", "Ys VIII: Lacrimosa of Dana", "S.K.I.L.L.: Special Force 2", "Sonic Generations", "Call of Duty 4: Modern Warfare", "Super Mario Galaxy 2", "Indie Game Sim", "Cyberdimension Neptunia: 4 Goddesses Online", "Tom Clancy's Ghost Recon", "Roll20 Virtual Tabletop", "Assassin's Creed: Rogue", "Dark Age of Camelot", "Broken Age", "The Binding of Isaac: Rebirth", "Rappelz", "Phoenix Wright: Ace Attorney - Justice For All", "Fire Department 2", "Errant: Hunter's Soul", "Nippon Marathon", "Heroes of Hammerwatch", "Unreal Tournament", "Harry Potter and the Philosopher's Stone", "Ultra Street Fighter IV", "The Walking Dead: A New Frontier", "Monopoly One", "Diablo", "Wolfenstein: The Old Blood", "Rayman Legends", "Wasteland 2", "GoldenEye 007", "Every Party", "Half-Life", "Domina", "Monopoly Family Fun Pack", "Fire Emblem: The Sacred Stones", "Left 4 Dead", "R2Beat", "Bus Simulator 18", "X-Morph: Defense", "Pathologic", "Max Payne", "Splatoon", "Quake Live", "Nebula Realms", "Silent Hill", "Asphalt 9: Legends ", "Silent Hunter III", "Ratchet & Clank", "Imperivm: Great Battles of Rome", "NBA 2K14", "Diep.io", "Saint Seiya: Soldiers' Soul", "Oblivion", "Dungeons of Dredmor", "Magic: The Gathering Online", "Pit People", "Racing", "The Sims 3", "TV Station Manager", "Battlefield: Bad Company 2", "Forgotton Anne", "Hello Kitty Cutie World", "Final Fantasy: The 4 Heroes of Light", "Latale", "Polybius", "The Legend of Zelda: Four Swords Adventures", "Defiance", "Pitfall!", "Priston Tale", "Radio Active", "Metal Gear Solid: Peace Walker", "The Settlers II: 10th Anniversary", "Adventure Quest", "Basic Programming", "Dragon Warrior II", "Night in the Woods", "Mahjong", "Napoleon: Total War", "Dragon Slayer Gaiden", "Natural Selection", "Lands of Lore: Guardians of Destiny", "Professor Layton and the Curious Village", "The Legend of Zelda: Oracle of Seasons", "Microsoft Flight Simulator X: Acceleration", "Wakfu", "Endless Legend", "Penumbra: Black Plague", "Endless Space 2", "Knives Out", "Long Live the Queen", "Bendy and the Ink Machine", "FIFA 98: Road to World Cup", "Mario Kart: Double Dash!!", "The Legend of Heroes: Trails in the Sky", "Monster Hunter Online", "Bully", "Standoff Multiplayer", "The Great Merchant", "Top Shop", "Railway Empire", "Hello Kitty Online", "Dragon Quest VIII: Journey of the Cursed King", "Production Line", "Mirror's Edge Catalyst", "Special Force", "Touhou 10 - Mountain of Faith", "Stalker Online", "Fire Emblem: Fuuin no Tsurugi", "Senran Kagura: Estival Versus", "Mega Man X4", "Yakuza 3", "Dino Crisis", "Stock Market: The Game", "Dragon Quest Heroes I\u30fbII for Nintendo Switch", "Aim Hero", "Romance of the Three Kingdoms", "Flipping Death", "Shin Megami Tensei: Persona 3 FES", "Saints Row IV: Re-Elected", "Counter-Strike Online", "Top Eleven", "RPG Maker", "Sword Art Online: Memory Defrag", "Skate 3", "Kritika Online", "The Great Green Mouse Disaster", "Jak II", "Panzar: Forged By Chaos", "Observer", "Kingdoms and Castles", "NothingElse", "Chivalry: Medieval Warfare", "Black Mirror II: Reigning Evil", "Rusty Lake Hotel", "Skyrim: Very Special Edition", "Monstrum", "Dreamfall Chapters", "Child of Light", "Warhammer 40,000: Inquisitor Martyr", "Final Fantasy", "Pikmin 2", "Trials Fusion", "Post Scriptum: The Bloody Seventh", "Yu-Gi-Oh! Legacy of the Duelist", "DC Universe Online", "Guilty Gear Xrd REV 2", "Thief", "World of Tanks Blitz", "Starbound", "Empire: Total War", "Kartrider", "Monster Hunter 4 Ultimate", "Killer Instinct", "Paper Mario", "Dead Space 2", "Staxel", "Naval Action", "Kingdoms of Amalur: Reckoning", "Mario Kart Wii", "The Walking Dead: Season Two", "Super Monkey Ball 2", "The Legend of Zelda: The Wind Waker", "BlazBlue: Central Fiction", "Crusader Kings II", "Cards Against Humanity", "DragonBall Xenoverse 2", "Dead Island", "Chrono Trigger", "Kingspray Graffiti VR", "Naruto Shippuden: Narutimate Blazing", "Legend of Legaia", "Mobile Legends: Bang bang", "Shenmue", "Viscera Cleanup Detail", "Deathgarden", "Evoland 2: A Slight Case of Spacetime Continuum Disorder", "Ring Of Elysium", "Creativerse", "CardLife", "The Isle", "Valkyria Chronicles", "Fire Emblem Mobile", "Attack on Titan 2", "Thumper", "Friends Marble", "The Escapists 2", "Guild of Dungeoneering", "Silent Hill 2", "The Legend of Heroes: Zero no Kiseki Evolution", "Medieval Engineers", "Spider-Man", "Tom Clancy's Rainbow 6: Patriots", "Assassin's Creed Unity", "BattleCON Online", "RollerCoaster Tycoon 2", "Business Tour", "Game Dev Tycoon", "Valiant Hearts: The Great War", "Tales of Symphonia", "Anna", "Pok\u00e9mon Mystery Dungeon: Explorers of Sky", "The Last Remnant", "Tabletop Simulator", "Dungeon Defenders II", "Doom II: Hell on Earth", "The Evil Within", "Robocraft", "Closers Online", "Stick Fight: The Game", "Spyro: Year of the Dragon", "Atelier Sophie: The Alchemist of the Mysterious Book", "XCOM: Enemy Within", "Metro 2033", "Empire TV Tycoon", "Super Ghouls 'N Ghosts", "Dead Space", "Need for Speed Payback", "Echo Arena", "Firewatch", "Beyond: Two Souls", "Deep Rock Galactic", "Squad", "Resident Evil: Outbreak - File #2", "Sniper Elite III", "Warlords Awakening", "Under Night In-Birth Exe:Late[st]", "Lineage 2: Revolution", "Perfect World", "For the King", "Portal", "Summer Lesson", "Rock Band 4", "Paper Mario: The Thousand-Year Door", "Wurm Unlimited", "Metal Gear Solid 2: Sons of Liberty", "Gears of War", "Shadow Tactics: Blades of the Shogun", "Vampyr", "The Legend of Zelda: Link's Awakening DX", "The Legend of Zelda: Ocarina of Time 3D", "Men of War: Assault Squad 2", "Shantae: Half-Genie Hero", "Harry Potter and the Deathly Hallows: Part 1", "Super Buster Bros.", "Sparkle 2", "Deus Ex", "Sword Legacy: Omen", "Magicite", "Quantum Break", "Risen", "The Spiral Scouts", "3on3 FreeStyle", "Furi", "To the Moon", "Vikings: Wolves of Midgard", "LEGO Star Wars: The Complete Saga", "Stationeers", "Faeria", "Sleeping Dogs", "Star Wars: Episode I - Racer", "Quiz RPG: The World of Mystic Wiz", "Life is Feudal: Your Own", "Fable III", "ReCore", "Prince of Persia", "The Legend of Zelda: Twilight Princess", "Gears of War 2", "Castlevania II: Simon's Quest", "Icewind Dale: Enhanced Edition", "Disney Epic Mickey 2: The Power of Two", "Guacamelee!", "Bloodstained: Curse of the Moon", "Lords of the Fallen", "Card Games", "S4 League", "Pinball", "Danganronpa 2: Goodbye Despair", "Zero Time Dilemma", "The Banner Saga 3", "Tyranny", "Castlevania", "Pok\u00e9mon Battle Revolution", "Death's Gambit", "We Were Here", "Saga", "Ben and Ed: Blood Party", "Umbrella Corps", "Advance Wars 2: Black Hole Rising", "Tetris Attack", "Battlefield Hardline", "Q.U.B.E. Director's Cut", "Bloons TD 5", "Zombi", "Pac-Man", "Call of Duty: World at War", "Kingdom Hearts", "Talisman", "Agony", "Summer Carnival '92: Recca", "Robot", "Metroid: Zero Mission", "Worlds Adrift", "Fallout", "JoJo's Bizarre Adventure", "Pro Evolution Soccer 2018", "Agatha Knife", "One Piece Treasure Cruise", "Metal Gear Solid 2: Substance", "inFamous: Second Son", "Shenmue II", "Will To Live Online", "Deemo", "System Shock", "Megadimension Neptunia VII", "Werewolves \u72fc\u4eba\u6bba", "Clue/Cluedo The Classic Mystery Game", "Need for Speed Underground", "Element4l", "Jurassic Park", "Game of Thrones: A Telltale Game Series", "Age of Empires III", "Future Unfolding", "Grim Fandango", "Uno", "Titanfall", "Flintstones", "Mount & Blade Warband: Viking Conquest", "Dark Cloud 2", "Monster Super League", "Pavlov VR", "SimAirport", "Spider-Man: Shattered Dimensions", "Destiny Child", "Warhammer 40,000: Gladius - Relics of War", "Resident Evil Zero", "Resident Evil: Survivor", "Pixel Puzzles Ultimate", "Naruto to Boruto: Shinobi Striker", "Games + Demos", "Madden NFL 19", "Tom Clancy's The Division", "Mobile Suit Gundam: Battle Operation 2", "Call of Duty: Black Ops III", "Rise of the Tomb Raider", "Guild Wars 2", "Green Hell", "Call of Duty: WWII", "H1Z1", "Terraria", "Dragon Ball FighterZ", "VRChat", "CASE 2: Animatronics Survival", "Dead Cells", "Sea of Thieves", "NBA 2K18", "Darkest Dungeon", "Enter the Gungeon", "RuneScape", "No Man's Sky", "Punch Club", "Chess", "Shadowverse", "The Elder Scrolls V: Skyrim", "EVE Online", "Mortal Kombat X", "Dungeon Fighter Online", "Arma 3", "EA Sports UFC 3", "Hunt: Showdown", "Euro Truck Simulator 2", "Need for Speed: SHIFT", "Blade and Soul", "PUBG MOBILE", "RimWorld", "The Legend of Zelda: Ocarina of Time", "Resident Evil: Code: Veronica X", "Mist Survival", "The Sims 4", "Marvel's Spider-Man", "FIFA Online 4", "Metin 2", "DayZ", "Stardew Valley", "7 Days to Die", "The Binding of Isaac: Afterbirth", "The Witcher 3: Wild Hunt", "Throne of Lies: The Online Game of Deceit", "Super Mario World", "Splatoon 2", "Farming Simulator 17", "Demon's Souls", "Infestation: The New Z", "Wario's Woods", "Strange Brigade", "Dungeons & Dragons", "Knight Online", "theHunter: Call of the Wild", "ROBLOX", "MapleStory", "Personal Trainer: Cooking", "Yakuza Kiwami 2", "Patapon", "EarthBound", "Elite: Dangerous", "M.U.G.E.N", "Prime World", "Pok\u00e9mon Emerald", "Silent Hill: Downpour", "Meeple Station", "Halo: The Master Chief Collection", "Fate/Grand Order", "God of War", "Borderlands 2", "The Legend of Zelda: Breath of the Wild", "Kingdom Hearts HD I.5 + II.5 Remix", "Team Fortress 2", "TrackMania\u00b2 Stadium", "Black Desert Mobile", "Star Citizen", "Dark Souls", "Nioh", "Final Fantasy VII", "Ragnarok Online", "Cyphers Online", "Eternal", "Metal Gear Solid 4: Guns of the Patriots", "Crypto", "NHL 17", "SNK HEROINES Tag Team Frenzy", "Bloodborne", "Gears of War 4", "Epic 7", "Tricky Towers", "Outlast", "Heavy Rain", "FIFA 17", "Beat Saber"];


class Channels{
    constructor(){
        this.initChannels();
        this.channelsMaxSize = 200;
    }
    initChannels(){
        let storageChannels = utils.storage.getItem("channels") || [];
        this.channels = storageChannels;
        let channel, elem;
        for(channel of this.channels){
            elem = this.makeChannelLink(channel);
            elements.linkList.appendChild(elem);
        }
    }

    makeChannelLink(channel){
        let channelElem = document.createElement("div");
        channelElem.className = "link-list__item " + channel;
        channelElem.innerHTML = `<a href="${location.pathname}?perPage=30&page=1&type=archive&channel=${channel}" class="link-list__link">${channel}</a><span class="link-list__remove"> X</span>`;
        return channelElem;
    }

    updateChannels(channel){
        this.removeChannel(channel);
        this.channels.unshift(channel);
        if(this.channels.length >= this.channelsMaxSize){
            this.channels.pop();
        }
        utils.storage.setItem("channels", this.channels);
        this.updateChannelsElem(channel);
    }

    updateChannelsElem(channel){
        let channelElem = elements.linkList.querySelector(".link-list__item."+channel);
        if(!channelElem){
            channelElem = this.makeChannelLink(channel);
        }
        elements.linkList.insertBefore(channelElem, elements.linkList.firstChild);
    }

    removeChannel(channel){
        let index = this.channels.indexOf(channel);
        if(index>=0){
            this.channels.splice(index, 1);
            utils.storage.setItem("channels", this.channels);
            this.removeChannelElem(channel);
        }
    }

    removeChannelElem(channel){
        let item = document.querySelector(".link-list__item." + channel);
        item.remove();
    }
}


const typeNames = {
    "live": "Live",
    "archive": "Past Broadcasts",
    "highlight": "Highlights",
    "upload": "Uploads"
}
const defaultParams = {
    perPage: 30,
    page: 1,
    type: "live",
    game: ""
};

class Ui{
    constructor(){
        this.channels = new Channels();
        this.pagination = new Pagination(elements.paginationPages);
        new Awesomplete(elements.optionsChannel, {list: this.channels.channels, autoFirst: true, minChars: 1});
        new Awesomplete(elements.optionsGame, {list: twitchGames, autoFirst: true, minChars: 1});
        this.handlers();
        if(!this.loadFromGET() && settings.clientId.length){
            this.load(defaultParams, true);
        }
    }

    handlers(){
        elements.importButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.import();
        });

        elements.importFollowsButton.addEventListener("click", e=>{
            e.preventDefault();
            let p = utils.importFollows();
            p.then(names=>{
                if(names && names.length){
                    names.map(name=>this.channels.updateChannels(name));
                }
            });
        });

        elements.wlButton.addEventListener("click", e=>{
            e.preventDefault();
            this.loadWatchLater();
        });


        elements.exportButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.export();
        });

        elements.clientIdButton.addEventListener("click", e=>{
            e.preventDefault();
            utils.promptClientId();
        });
        elements.form.addEventListener("submit", (e)=>{
            e.preventDefault();
            let params = this.loadParams();
            this.load(params, true);
        });
        elements.optionsType.addEventListener("input", e=>{
            elements.optionsPage.value = 1;
            this.updateFormElements();
        });
        this.updateFormElements();
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__link"){
                let channel = e.target.textContent;
                elements.optionsChannel.value = channel;
                let params = this.loadParams();
                this.load(params, true);
            }
        });
        elements.linkList.addEventListener("click", (e)=>{
            e.preventDefault();
            if(e.target.className === "link-list__remove"){
                let channel = e.target.previousElementSibling.textContent;
                this.channels.removeChannel(channel);
            }
        });
        elements.paginationPages.addEventListener("click", (e)=>{
            let elem = e.target;
            if(elem.className === "pagination-page"){
                this.changePage(parseInt(elem.textContent));
            }
            else if(elem.classList.contains("pagination-page-gap")){
                let direction;
                if(elem.previousSibling.textContent === "1"){
                    direction = -1;
                }
                else{
                    direction = 1;
                }
                this.pagination.rotate(direction);
            }
        });

        document.addEventListener("keydown", e=>{
            if(e.ctrlKey || e.altKey)return;
            if(e.keyCode === 9){
                e.preventDefault();
                let i;
                if(e.shiftKey){
                    i = -1;
                }
                else{
                    i = 1;
                }
                this.changeSelectedCard(i);
            }
            else if(e.keyCode === 37){
                if(this.media && this.media.getter && !this.loading && this.media.getter.page > 1){
                    this.changePage(this.media.getter.page - 1);
                }
            }
            else if(e.keyCode === 39){
                if(this.media && this.media.getter && !this.loading && this.media.getter.page < this.media.getter.lastPage){
                    this.changePage(this.media.getter.page + 1);
                }
            }
        });
    }

    loadWatchLater(){
        this.clean();
        this.media = new Videos(null, true);
        elements.channelTitleChannel.textContent = "Watch Later";
        elements.channelTitleInfo.textContent = "";
        history.replaceState("watchlater", "twitch-list | Watch Later", "?type=watchlater");
        document.title = "Watch Later";
    }

    updateFormElements(){
        let type = elements.optionsType.options[elements.optionsType.selectedIndex].value;
        let hideElems, showElems;
        if(type === "live"){
            elements.linkList.style.display = "none";
            hideElems = elements.form.querySelectorAll(".search-option.search-option--vod");
            showElems = elements.form.querySelectorAll(".search-option.search-option--live");
        }
        else{
            elements.linkList.style.display = "flex";
            hideElems = elements.form.querySelectorAll(".search-option.search-option--live");
            showElems = elements.form.querySelectorAll(".search-option.search-option--vod");

        }
        let elem;
        for(elem of hideElems){
            elem.style.display = "none";
        }
        for(elem of showElems){
            elem.style.display = "inline-block";
        }
    }

    changePage(page){
        let params = {
            "type": this.media.getter.type,
            "perPage": this.media.getter.perPage,
            "page": page
        };
        if(this.media.getter.type === "live"){
            params["game"] = this.media.getter.game;
        }
        else{
            params["channel"] = this.media.getter.channel;
        }
        this.load(params, false);
    }


    clean(){
        this.selectedCard = undefined;
        elements.paginationPages.innerHTML = "";
        elements.resultList.innerHTML = "";
        elements.channelTitleInfo.textContent = "";
        elements.channelTitleChannel.textContent = "";
    }

    changeSelectedCard(i){
        let selected, cont;
        let cards = elements.resultList.children.length;
        if(!cards)return;
        if(this.selectedCard === undefined){
            this.selectedCard = 0;
        }
        else{
            selected = elements.resultList.children[this.selectedCard];
            cont = selected.querySelector(".img-container");
            this.selectedCard += i;
            if(this.selectedCard>=cards){
                this.selectedCard = 0;
            }
            else if(this.selectedCard<0){
                this.selectedCard = cards-1;
            }
            selected.classList.remove("video-card--selected");
            cont.classList.remove("animated")
        }
        selected = elements.resultList.children[this.selectedCard];
        cont = selected.querySelector(".img-container");
        selected.classList.add("video-card--selected");
        if(cont.classList.contains("can-animate")){
            cont.classList.add("animated");
        }
        selected.querySelector(".ext-player-link").focus();
        selected.scrollIntoView();
    }

    loadParams(){
        let type = elements.optionsType.options[elements.optionsType.selectedIndex].value;
        let params = {
            perPage: parseInt(elements.optionsLimit.value),
            page: parseInt(elements.optionsPage.value),
            "type": type
        };
        if(type === "live"){
            params["game"] = elements.optionsGame.value;
        }
        else{
            params["channel"] = elements.optionsChannel.value;
        }
        return params;
    }

    loadFromGET(){
        let params = utils.getStrToObj();
        let type = params["type"] || defaultParams["type"];
        if(type === "watchlater"){
            this.loadWatchLater();
            return true;
        }
        if(params){
            params["perPage"] = parseInt(params["perPage"]) || defaultParams["perPage"];
            params["page"] = parseInt(params["page"]) || defaultParams["page"];
            if(type === "live"){
                params["game"] = params["game"] || defaultParams["game"];
            }
            else{                
                params["type"] = type;
            }
            this.updateOptionsElem(params);
            this.updateFormElements();
            this.load(params, true);
            return true;
        }
        else{
            return false;
        }
    }

    updateOptionsElem(params){
        elements.optionsType.value = params.type;
        elements.optionsLimit.value = params.perPage;
        elements.optionsPage.value = params.page;
        if(params.type === "live"){
            elements.optionsGame.value = params.game;
        }
        else{
            elements.optionsChannel.value = params.channel;
        }
    }

    replaceState(params){
        let getStr = utils.objToGetStr(params);
        history.replaceState(params, "twitch-list | " + params.channel, getStr);
    }

    updateResultsTitle(channel, success){
        if(success){
            let total = this.media.getter.total;
            let page = this.media.getter.page;
            let perPage = this.media.getter.perPage;
            if(this.media.getter.type !== "live"){
                let currentFrom = (page-1)*perPage+1;
                let currentTo = page*perPage;
                currentTo = currentTo>total ? total : currentTo;
                let typeName = typeNames[this.media.getter.type];
                document.title = channel + " " + typeName;
                elements.channelTitleChannel.textContent = `${channel}`;
                elements.channelTitleInfo.textContent = `Showing ${typeName} ${currentFrom}-${currentTo} of ${total}`;
            }
            else{
                let game = this.media.getter.game;
                let text = "Live Channels";
                document.title = "Live Channels";
                elements.channelTitleChannel.textContent = text;
                if(game.length){
                    elements.channelTitleInfo.textContent = game;
                }
            }
        }
        else{
            if(channel){
                elements.channelTitleChannel.textContent = `<${channel}>`;
                elements.channelTitleInfo.textContent = `No videos found`;
            }
            else{
                elements.channelTitleChannel.textContent = `<No Live Channels could be found>`;
                elements.channelTitleInfo.textContent = "page number probably too high";
            }
        }
    }

    load(params, first){
        this.loading = true;
        this.clean();
        if(first){
            if(!params){
                params = defaultParams;
            }
            if(params.type === "live"){
                this.media = new Streams(params);
            }
            else{
                this.media = new Videos(params);
            }
        }
        else{
            this.updateOptionsElem(params);
            this.updateFormElements();
        }

        let loaded = this.media.load(params.page);
        loaded.then(success => {
            if(success){
                this.updatePagination();
                if(first && params.channel){
                    this.channels.updateChannels(success);
                }
                this.updateResultsTitle(success, true);
            }
            else{
                this.updateResultsTitle(params.channel, false);
            }
            this.replaceState(params);
            this.loading = false;
        });
    }

    updatePagination(){
        this.pagination.update(this.media.getter.lastPage, this.media.getter.page);
    }
}

export {Ui};


