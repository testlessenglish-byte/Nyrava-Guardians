# Android-first build guide

Android is the current delivery target. iOS is scaffolded for a later phase.
Desktop remains supported through the same web app, not a separate desktop installer.

## Architecture and identity

- React / TypeScript / TanStack / Three.js remain the shared application.
- Capacitor 8 embeds the local `dist-mobile` assets. No remote `server.url`.
- App ID: `com.nyrava.guardians`; display name: Nyrava Guardians.
- Android project: `android/`; iOS Swift Package Manager project: `ios/App/`.
- Web build: Cloudflare-compatible `dist/server/index.js` + `dist/client/`.
- Mobile build: TanStack SPA prerenders an index shell, bundles routes, models and fonts.
  The temporary server used to produce that shell is NOT copied into Android.

## Prerequisites

Use Node 22.18+ or 24 and npm. For Android install Android Studio and its SDK
toolchain (the generated project targets API 36, minimum API 24). Use Studio's
bundled Java runtime. Configure its SDK location through Studio / the ignored
`android/local.properties`; never commit your local SDK path.

On this Windows machine, Android Studio, Java and the SDK were not found during
this work. The Gradle check failed because JAVA_HOME/java is absent. Project
generation and asset synchronization do NOT prove APK compilation succeeds.

## Environment

Copy the variable NAMES from `.env.example` to ignored `.env`. Fill only the
new project's public URL, ID and publishable key in the three `VITE_SUPABASE_*`
variables and their server counterparts. Current project ref:
`qkikkmrphpzfmuogeduh`. Never use the read-only old project's credentials.

VITE values are public and compiled into the binary. Never put service-role,
database, AI-provider, signing or access-token secrets there. Server-only optional
names in `.env.example` are not required to explore the world locally.
`build:mobile` validates the shell and scans packaged text assets for private-key
markers; a manual review and Git secret scan are still required before publishing.

## Web / desktop

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run lint
npm run build
```

Local URL: http://127.0.0.1:8080/. Desktop controls remain WASD/arrows, Shift to
run, Space to jump, E to interact, V to change view, and mouse drag for the camera.
After changing shared context modules during development, a full browser reload
may be needed to clear React fast-refresh state. Release builds do not use HMR.

## Build and run Android

```sh
npm install
npm run build:mobile
npx cap sync android
npm run mobile:android
```

In Android Studio, let Gradle finish syncing, select an emulator or an attached
Android phone, and click Run. A phone needs USB debugging and must explicitly
authorize the computer. Alternatively, after the toolchain is installed:

```sh
npm run mobile:run:android
```

To create a debug APK on Windows:

```powershell
npm run build:mobile
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

The expected output is `android/app/build/outputs/apk/debug/app-debug.apk`.
No APK was produced in this work. Debug APKs are for testing, not store releases.

`npm run mobile:sync` builds and synchronizes BOTH generated platforms.
For Android-only work prefer `npm run build:mobile` then `npx cap sync android`.
Existing platform folders are tracked: do not run `cap add` over them again.

## iOS later

The project was generated on Windows; it has not been compiled or run.
On a Mac with the Capacitor 8-supported Xcode toolchain:

```sh
npm install
npm run build:mobile
npx cap sync ios
npm run mobile:ios
# Or, after configuring a simulator/device:
npm run mobile:run:ios
```

Resolve Swift packages, select the signing team, then run from Xcode. Before
submission add/review the app privacy manifest, including Preferences'
UserDefaults required-reason declaration (CA92.1), and all actual SDK data usage.
Do not claim iOS readiness based on a generated folder or Android testing.

## Controls, graphics and audio

- Phones: left analog stick, separate right camera pad, hold Run, tap Use/Jump.
  Pointer ownership prevents one finger stealing another control.
- Gameplay requests landscape natively; normal screens allow portrait.
- Blur, hiding the page, route exit and native suspension reset movement/voice.
- LOW / MEDIUM / HIGH limit resolution, terrain detail, vegetation and shadows.
  LOW is chosen conservatively for devices reporting low/unknown resources.
- Game settings → Background music enables an original, gentle exploration theme.
  It uses short melodic/plucked notes, not the previous continuous hum.
  Music starts OFF at each launch, including when older saved settings enabled it.
  Music, effects and voice volumes are separate; speech reduces music volume.
- Music and voice stop on suspension. Microphone never resumes automatically.
- Fonts and existing GLBs are bundled; the music needs no downloaded recording.

## Permissions, storage and backend limits

No microphone permission is requested on startup. Browser recognition is optional
with a purpose explanation. Native speech is deliberately unavailable until a
reviewed native provider and consent flow exist; captions remain available.
Android has internet access and plugin-specific normal permissions; no recording
permission is added for a feature that is not implemented.

Progress/preferences use guarded web storage and native Preferences. These are
NOT encrypted credential storage. Android app backup is disabled. Native
Supabase session persistence is disabled until a Keychain/Keystore adapter exists.

Supabase configuration is present, but there is no application login UI.
Local exploration works without a Supabase session; cloud saves need one.
Before enabling accounts, fix account-scoped persistence and load/save ordering,
review the role/policy gaps described in MIGRATION_STATUS.md, and configure exact
web/native Auth callbacks. No remote SQL, Auth settings or old project were changed.

Classroom AI server functions cannot run inside a binary. Native chat reports
that its authenticated HTTPS service is not connected instead of sending requests
to a nonexistent local server. The web AI gateway still needs production provider
and server credentials, authentication, rate limiting and safety review.

## Release / device acceptance checklist

- Install/debug on a real Android phone; verify simultaneous two-thumb use plus jump.
- Check forward/back/diagonal/facing/run/idle, slopes, jump limits, water and locked regions.
- Test rotation, notches/system bars, keyboard, cancellation, interruptions and low memory.
- Cold-launch offline, revisit both worlds, resume after screen lock, verify saved progress.
- Confirm no music before opt-in, no doubled loops, stop on background, voice ducking.
- Measure frame time, draw calls and memory on target hardware; no measured FPS claim yet.
- Replace default native launcher/splash placeholders with reviewed existing branding.
- Add release signing outside Git, increment versions, and review store/privacy/child-safety requirements.
- Configure and test live auth/RLS/AI before representing the release as production-ready.

Dependency audit currently reports three moderate development-tool findings through
Capacitor CLI → xcode → uuid. No forced downgrade or broad dependency change was made.
Resolve or formally review them before a release; run `npm audit` again at that time.

References: [Capacitor Android](https://capacitorjs.com/docs/android),
[environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup),
[Preferences privacy requirements](https://capacitorjs.com/docs/apis/preferences),
[TanStack SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode).
