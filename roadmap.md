# Nyrava Guardians — Build Roadmap

Frontend foundation per starter package (visual/interactive layer; backend handoff to Antigravity).

- [x] Visual system: dark neon design tokens in src/styles.css (per-guardian colors)
- [x] Brand assets: crop Guardian portraits + logo + AI robot from reference image
- [x] Types + mock services (Guardian/World/Mission/Mastery/Builder/Intelligence contracts)
- [x] App shell with in-world navigation
- [x] Welcome / Guardian selection (/)
- [x] Guardian personalization (/personalize)
- [x] Guardian Home / HQ (/home)
- [x] Guardian World map (/world)
- [x] Academy (/academy)
- [x] Mission Hub with interactive scenario (/missions)
- [x] Intelligence Core (/core)
- [x] AI Builder with mock pipeline (/builder)
- [x] Head metadata per route + favicon
- [ ] Visual pass on mobile viewports
- [ ] Backend handoff: swap mock services for real providers (Antigravity)

- [ ] Replace robot avatar with humanoid armored guardian model (walk/idle animations, per-guardian armor tint)

## World 1 — Isla Central (big spec, staged)

- [ ] Humanoid armored avatar with working idle/walk/run animations (in progress)
- [ ] Isla Central island world: Central City, Forest of Wisdom, Knowledge Mountains, History Valley, Desert Zone, Emerald Beach, Infinite Ocean, Space Port, Academy interior
- [ ] Walkable spatial travel between regions (no click-to-teleport-only), paths/bridges/hidden areas
- [ ] Class 1 "Discover Isla Central": 5 Knowledge Crystals, clue system, 3-level hints
- [ ] Challenges: logic, memory, observation, safety, build, exploration
- [ ] Discovery system: celebration, collection log, XP, guardian reaction
- [ ] Locked areas unlocked by mastery/keys/puzzles (never by time)
- [ ] World map showing discovered/unexplored/locked, no collectible spoilers
- [ ] Class completion requires return to Academy + report
- [ ] Mastery evidence feeds Intelligence Core
- [ ] Keep service-boundary architecture (world data / mission data / progress / AI / mastery separated)

## Isla Central polish pass (Aug 30)

- [x] Bigger island world (scale terrain + regions), denser props
- [x] Immersive fullscreen layout for 3D routes (no site chrome overlap)
- [x] Fix avatar walking backwards (camera-relative input)
- [x] Camera modes: third-person / first-person (eyes), wheel zoom
- [x] Click-to-walk to a spot, jump (Space), sprint (Shift)
- [x] Avatar faces the way it walks using the rig's actual +Z forward axis
- [x] Remove the duplicate guide avatar from Isla Central
- [x] Restore armour textures on avatars (light neon wash instead of flat paint)
- [x] Fix props (trees/rocks) vanishing when the player walks up to them
- [ ] Next art pass: distinct per-guardian kid models

## Safe shared metaverse rooms

- [ ] Subscriber accounts and child-safe profiles with verified age bands and interests
- [ ] Live room presence so eligible Guardians appear together in the same classroom/world
- [ ] Age-banded, interest-aware room matching with strict capacity and separation rules
- [ ] Moderated text and voice communication with reporting, blocking, audit events, and guardian controls
- [ ] Safety-first matching algorithm with no unrestricted adult/minor or cross-age direct messaging
- [ ] Realtime avatar movement and room state synchronization

## Isla Central polish (Aug 30)

- [x] Swimming: enter the ocean, float, swim gait, reach offshore crystals
- [x] Avatar textures show through (no flat tint wash, gentle emissive rim)
- [x] Replace white block buildings with tropical palapa huts / island architecture
- [x] Arrow keys move the avatar alongside WASD

- [x] Kid-guardian KayKit avatar swap + island detail pass (grass, flowers, bushes, boulders, clouds, birds)
- [x] Richer avatar coloring + smaller nameplate text
- [x] Swim pose: face-down instead of on the back

- [x] Enterable furnished palapa huts (doorway, door leaf, bed/table/shelf, lantern)
- [x] History Valley: replace thin beige posts with large ruined columns and rubble
