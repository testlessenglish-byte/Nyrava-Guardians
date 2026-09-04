# Nyrava Guardians

Interactive digital-safety academy built with React, TanStack Start, Three.js and Supabase.
The maintained repository is https://github.com/testlessenglish-byte/Nyrava-Guardians.

## Local development

Use Node.js 22.18+ (or Node.js 24) and npm. Copy the empty variable names from
`.env.example` into an ignored `.env` and configure the new Supabase project's
public URL and publishable key in both `SUPABASE_*` and `VITE_SUPABASE_*` variables.
Never put server credentials in `VITE_*` values. Public Vite values are compiled
into the browser build; server-only values must also be configured in hosting.

Run `npm install`, then `npm run dev`. The local URL is http://127.0.0.1:8080/.
Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` separately.
Tests cover public Supabase configuration, analog/camera input, pointer ownership,
quiet audio startup and soundtrack lifecycle; they are not a complete app/device suite.
The Cloudflare-compatible deployment artifact is generated in `dist/` and Sites
metadata is maintained in `.openai/hosting.json`.

## Preview limitations

This is a migration preview, not a production-ready release. Supabase is configured
for the new project, but the app has no sign-in/onboarding UI yet. Progress remains
on this browser without a Supabase session. Classroom AI/voice still require the
old provider integration to be replaced, and some product screens use mock services.

See [MIGRATION_STATUS.md](MIGRATION_STATUS.md) for database verification, Auth/RLS
blockers, environment requirements, and remaining independent-platform work.
Do not change the old repository or its Supabase project. Do not reapply recorded
migrations or rewrite shared Git history to resolve application errors.

## Android first, iOS later

The same app supports desktop browsers and an Android Capacitor container.
Run `npm run build:mobile`, `npx cap sync android`, then `npm run mobile:android`
to open Android Studio. `npm run mobile:run:android` builds and runs on a configured
device/emulator. Android Studio, its SDK and Java are required; no APK is included.

The generated iOS project is reserved for later: on a Mac, build mobile assets,
run `npx cap sync ios`, then `npm run mobile:ios` to open Xcode.
`npm run mobile:sync` synchronizes both platforms after building.

See [Mobile build guide](docs/MOBILE_BUILD_GUIDE.md) for environment variables,
permissions, Android/iOS commands, signing and store prerequisites, testing limits
and remaining backend work. [Architecture audit](docs/MOBILE_ARCHITECTURE_AUDIT.md)
records the pre-change inspection.

## Sound

The continuous background hum has been removed. In either playable world, open
Game settings and enable Background music for the original exploration melody.
Music starts off each launch and has its own volume, separate from effects/voice.
No microphone is enabled automatically.
