# Mobile architecture audit (before mobile implementation)

Date: 2026-08-30. Scope: the current Nyrava-Guardians checkout, its tracked source,
native/build configuration, public models/textures, route tree and dependency graph.
No native project exists at the audit point. Prior migration fixes are staged and
must be preserved. No remote Supabase changes are authorized in this phase.

## Preserve

React 19, TypeScript, Vite, TanStack routing, Three.js, React Three Fiber, Drei,
all current Guardian images/GLBs, the procedural island, classroom worlds,
terrain/region locks, buoyancy, jump physics, character facing and animation
selection, HUD challenge/reporting flows and sanitized Git history.
This is a native container adaptation, not React Native or a replacement website.

## Entry points and current working behavior

- `src/routes/isla.tsx` mounts the main full-screen Canvas; `isla-scene.tsx`
  implements terrain, instanced vegetation, landmarks, collectibles, Player,
  camera following, jump/gravity and swimming. Camera-relative WASD/arrows work.
- `src/routes/classroom.tsx` mounts the second Canvas; `classroom-scene.tsx`
  handles movement, portals, NPC stations and camera follow.
- `src/components/meta/character.tsx` loads/clones existing rigs, selects
  idle/walk/run/swim-fallback clips and interpolates with AnimationMixer.
- TanStack has 12 application routes plus root. `/isla` and `/classroom` are
  client-only, but the overall build is currently server-rendered. The current
  `dist/client` is not yet a standalone native package with an index shell.
- Latest pre-mobile build and typecheck pass; five configuration tests pass.
  Lint still fails (1,074 errors, seven warnings), mostly pre-existing formatting.

## Control defects

- Main Isla controls are hidden below `md`. A separate older HUD touch joystick
  also exists; it uses the first touch without ownership and has no camera pad.
  It must be replaced, not left active underneath the shared controls.
- Existing classroom joystick has one boolean rather than a pointer owner; a
  second touch can overwrite it. No dead zone or lost-capture/blur reset exists.
- Movement normalizes every nonzero joystick input to full speed, losing analog
  magnitude. Isla facing interpolation must be kept while fixing this.
- Isla camera drag is handled on the entire root, so HUD/joystick events can
  rotate the camera. No pointer owner/capture or cancellation recovery exists.
- Isla keyboard state is not cleared on blur/unmount, and keyboard handlers
  can steal input while a learner types in a form.
- Classroom camera/movement use a different sign convention from Isla.
- HUD panels and controls use fixed desktop offsets and may overlap on phones.

## Browser-only APIs and native adaptation

- `window`, `document`, Pointer Events, keyboard/wheel handlers and localStorage
  are WebView-capable but need safe-area, lifecycle and unavailable-storage guards.
- Web Audio is gesture-gated. Current ambient oscillators auto-resume and lack
  app pause/resume; repeated zone changes can unnecessarily rebuild audio nodes.
- Two independent speech implementations use browser SpeechRecognition. It is
  not reliable in Capacitor WebViews; the voice engine incorrectly claims it is
  listening when unavailable. Speech may be processed by the browser/OS service.
- SpeechSynthesis and HTMLAudio need explicit cancellation on suspension, and
  async responses/timeouts must not restart speech after leaving a scene.
- The classroom's TanStack server functions cannot run inside a bundled binary.
  Keep them server-side for web; native must fail clearly until an authenticated
  HTTPS API contract exists. Do not bundle provider keys or point server.url at
  a remote website as a substitute for a packaged app.
- Google Fonts and Drei's default font fetches are network dependencies. Package
  a font for 3D labels and use bundled/system UI fallbacks for offline startup.
- Supabase's HTTPS API works in a WebView; login, deep links, account isolation,
  secure token persistence and cloud merge policy still require a separate
  reviewed authentication implementation. No login UI currently exists.

## Assets and performance

Five KayKit GLBs total approximately 18.1 MB (each 3.59–3.66 MB), plus a 2.16 MB
guardian GLB. The floor textures total approximately 1.29 MB. Existing materials
and models must remain visually intact. Inspect GLB mesh/animation/texture
metadata during implementation; do not invent live draw-call measurements.

Risks: all Guardian models preload on import; 300x300 terrain subdivisions;
2,048-pixel shadow map; 1,400 grass instances plus flowers/bushes/boulders;
unculled instanced meshes and rigs; several point lights; DPR up to 2 in class;
vector allocations inside the Player frame loop. There is no postprocessing
pipeline. Add LOW/MEDIUM/HIGH budgets for DPR, shadow size and terrain/scatter
density while keeping HIGH visually equivalent. Avoid frame-by-frame React
state except semantic gait/proximity changes. Suspend Canvas when inactive.

## Child safety and privacy

Microphone must default off, explain that recognition may use an OS/browser
service, and require a deliberate guardian-enabled gesture; no resume-time mic
restart. No transcripts/keys in diagnostics. Keep local progress durable without
pretending it is secure cloud storage. Do not store future auth tokens in plain
native Preferences; choose Keychain/Keystore integration before native login.
Remote AI requires auth, rate limits, provider review and consent. No new child
account, backend or world features are part of this task.

`.env` is ignored and contains only the new project's public configuration.
`.env.example` contains empty variable names; no private AI/service-role key is
configured. Prior staged/history scans found no leaks. Native assets, local SDK
paths, keystores, provisioning profiles and generated builds must be ignored.

## Platform requirements

- Android: Capacitor 8, Android Studio 2025.2.1+, its JDK and SDK/API 36 toolchain;
  generate Gradle project with ID `com.nyrava.guardians`; no invented signing.
- iOS: Capacitor 8, macOS and Xcode 26+ for compilation/simulator/device signing.
  Attempt project generation on this Windows machine and report actual result;
  a generated directory is not proof of an iOS build. Prefer Swift Package Manager.
- Both: local bundled web shell, offline asset paths, route reload handling,
  lifecycle listeners, game-only landscape preference, safe-area HUD and system
  bar review. Non-game screens remain free to use portrait.

## Exact implementation sequence

1. Add Capacitor core/CLI/platforms plus App, Network, Haptics, Preferences and
   ScreenOrientation only for concrete lifecycle/storage/control requirements.
2. Add separate mobile SPA build and package validation; leave web build intact.
   Generate native projects, reject production server.url and private env leakage.
3. Centralize native services, local progress storage and gesture-gated permissions;
   integrate one root lifecycle owner and pause-safe audio/voice handling.
4. Share pure analog/camera math and pointer ownership between controls. Add
   left joystick, right look pad, jump/interact/hold-run buttons and interruption
   resets. Keep desktop keys/mouse and the existing collision/jump/swim model.
5. Add safe-area gameplay shell, portrait guidance, responsive HUD, quality
   budgets, visible loading and honest retryable errors. Preserve artwork.
6. Correct displayed lineup to Zoe/Jacob/Dayana/Sarah/Lex/Nova, keeping legacy
   saved-ID aliases so existing progress/assets do not break.
7. Run install/typecheck/lint/tests/web+mobile builds/native sync, then desktop
   and touch browser checks. Record limits for actual native/device verification.
8. Write build guide and README, scan staged/history/bundled content, commit and
   push only to the new repo. Optional web preview uses this same core afterward.

References: [Capacitor requirements](https://capacitorjs.com/docs/getting-started/environment-setup),
[Capacitor config](https://capacitorjs.com/docs/config),
[TanStack SPA shell](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode).
