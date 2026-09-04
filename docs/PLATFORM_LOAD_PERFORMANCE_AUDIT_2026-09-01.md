# Nyrava Guardians — Platform Load & Rendering Audit

Date: 2026-09-01
Branch: `codex/platform-load-performance-recovery`
Scope: route loading, 3D viewport integrity, startup cost, auth/progress hydration, Sites build consistency.

## Executive result

The repeated broken-page reports are not one isolated classroom bug. The repository had several shared platform-level causes that could make different pages appear wrong, load slowly, or behave inconsistently even when their individual scene code was valid.

## Root causes found

### 1. Incomplete immersive-route classification

`AppShell` treated only `/isla` and `/classroom` as full-screen 3D routes. `/missions`, `/city`, and `/home-hq` are also real-time Canvas/gameplay routes, but they were mounted through the standard application header/sidebar/mobile navigation shell.

Impact:

- competing fixed/sticky layers over 3D canvases;
- incorrect pointer/touch areas;
- inconsistent viewport measurements;
- visual pages that look clipped or laid out differently from their scene design;
- mobile navigation layered over game controls.

Fix: one central `isImmersiveGameRoute()` definition now drives both the application shell and runtime gameplay mode.

### 2. Gameplay runtime disagreed with the router

`PlatformRuntime` also treated only `/isla` and `/classroom` as gameplay. Mission Hub, Digital City, and Home HQ therefore did not receive the same gameplay-active body state, orientation behavior, audio gesture handling, and input reset lifecycle.

Fix: runtime now uses the same route classifier as `AppShell`.

### 3. Production Sites build could switch into mobile SPA mode during TanStack prerendering

`vite.config.ts` previously interpreted `TSS_PRERENDERING=true` as proof that the build was a mobile build. TanStack Start can set that variable during its own production build lifecycle. That meant one build could reload the config in a different mode, changing SPA/Nitro/Sites plugin behavior mid-build.

Impact: inconsistent build output and a plausible source of deployment/build mismatch.

Fix: mobile mode is now selected only by explicit `--mode mobile` or the `build:mobile` npm lifecycle event. Production Sites builds remain production Sites builds through the entire build.

### 4. Automatic quality was too aggressive

Desktop machines were automatically started at `HIGH`: DPR 1.6, 2048 shadow maps, 300 terrain segments and 100% scatter. Isla alone contains thousands of scattered world instances and large terrain geometry. Automatically choosing the heaviest preset increases first-scene GPU/CPU setup and frame cost before the player has chosen a quality preference.

Fix: automatic selection now starts capable devices at `MEDIUM`; `HIGH` remains available when explicitly selected. Low-end devices still start at `LOW`.

### 5. Guardian cloud synchronization could race local state

After local Guardian state became hydrated, the provider immediately enabled cloud saving while the initial cloud read was still in flight. On a slow connection, the debounced local write could race the cloud read and risk stale progress/identity synchronization.

Fix:

- local progress still hydrates first so gameplay does not wait on the network;
- cloud writes are withheld until the initial cloud read finishes;
- current in-session avatar/name/progress takes precedence over stale cloud defaults;
- completed mission sets are merged safely;
- the voice engine is no longer part of the initial Guardian-provider bundle solely to set locale; locale synchronization is deferred/lazy.

### 6. Duplicate initial account hydration work

`AuthProvider` starts `getSession()` and also subscribes to auth state changes. The same initial session can reach both paths and previously could trigger duplicate profile/role reads.

Fix: account hydration is deduplicated by session token so identical startup events do not repeat the same profile/role queries.

### 7. Mobile navigation definition did not match its item count

The standard mobile shell rendered eight navigation destinations inside a six-column grid. This could wrap or overlap unpredictably.

Fix: mobile navigation is now a horizontally scrollable row with stable item widths.

## Asset/load observations

Guardian character GLB files are large. The active KayKit models are roughly 3.6 MB each, with the older guardian file roughly 2.1 MB. The current Character component correctly loads models on demand rather than preloading all Guardians, so this audit does not replace or redesign the approved avatars. A classroom can still need multiple model downloads when the player and teacher use different rigs; that cost is expected and should be handled by caching rather than changing character design.

Isla uses instancing for much of its vegetation/ground cover, which is the right direction, but the world is still materially heavier than the dashboard/application routes. Starting at Medium quality is therefore the safer default.

## Deployment finding

The repository's `.openai/hosting.json` still points to the existing Nyrava Guardians Sites project. The live `chatgpt.site` screenshots repeatedly showed UI that did not match the latest merged source, indicating that code correctness and live publication state have been two separate problems. This branch fixes build-mode consistency so future production builds cannot accidentally switch into mobile SPA mode during TanStack prerendering.

A merge alone still does not prove that the live Sites project has republished the newest commit. After this branch passes typecheck/tests/build and is merged, the live site must be verified against the new build.

## Required verification before merge

Run:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

Then manually verify:

1. `/isla`, `/classroom`, `/missions`, `/city`, and `/home-hq` all occupy the full viewport with no standard header/sidebar/mobile nav layered over them.
2. `/home`, `/academy`, `/account`, `/admin`, `/builder`, and `/core` retain the standard application shell.
3. Classroom opens with the selected Guardian and wall-mounted lesson board from current source.
4. Mission Hub, Digital City and Home HQ use the same game lifecycle/input behavior as Isla/Classroom.
5. First visit to Isla starts at Medium quality unless the user has explicitly saved another setting.
6. Sign-in/account state loads once without duplicated profile/role requests.
7. Guardian identity appears immediately from local storage and cloud synchronization does not replace the active local choice.
8. Production `npm run build` completes with Sites/Nitro production configuration; `npm run build:mobile` still produces the mobile SPA output.

## Do not regress

- Do not replace or redesign Guardian/avatar models.
- Do not alter auth credentials, API keys, Supabase project configuration, admin access, progression scoring or certificates.
- Do not enable microphone/voice automatically.
- Do not create a new Sites project or change the existing hosting project ID as part of this repair.
