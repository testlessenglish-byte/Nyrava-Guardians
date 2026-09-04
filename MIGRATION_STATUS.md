# Migration and preview status — 2026-08-30

## Verified migration

The maintained repository is `testlessenglish-byte/Nyrava-Guardians`. The original
repository remains read-only, with local remote `old-readonly` push-disabled.
There are five preserved branches, no tags, and 186 source commits in the
previously sanitized history. The initial migration removed tracked environment
credentials from history, so migrated hashes differ from the original history.
No further history rewrite is part of this setup.

The new Supabase project is **qkikkmrphpzfmuogeduh**. Its dashboard is healthy;
`supabase/config.toml` and the ignored local environment point to this project.
The dashboard has these four migration versions and matching filenames:

- 20260830093426
- 20260830093447
- 20260830171250
- 20260830180000

The public schema contains 27 tables. RLS is enabled on all 27. The two realtime
tables are `room_members` and `room_messages`. The `guardian_state` self-insert,
self-update and self/guardian-read policies were verified in the dashboard.
No remote SQL, resets, links, schema changes or Auth setting changes were made
during this continuation. Historical migration entries are recorded, but they
do not by themselves prove every policy's behavior. Role-based integration
testing remains required. No local CLI project-ref link was found; the dashboard
also reports no Supabase GitHub integration, which is not required for API use.

## Environment and security

The local environment has all six public project variables from `.env.example`:
`SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and their
`VITE_` counterparts. No service-role or AI-provider credential is configured.
Vite public variables must exist at build time. Private credentials belong only
in the hosting service's server environment, never Git or `VITE_*` variables.
The unused admin client requires `SUPABASE_SERVICE_ROLE_KEY` only if an admin
feature is implemented. Browser configuration now rejects secret/service-role
keys and produces a clear error instead of referencing undefined `process`.

## Remaining blockers (priority order)

1. **No application sign-in/onboarding UI.** Cloud saves need a Supabase user
   session; without one the app remains local-only. Site-owner access is not a
   Supabase login. Implement a reviewed guardian/learner onboarding flow and
   configure exact production Auth redirect URLs before testing real accounts.
2. **Account-scoped persistence needs work before enabling login.** Existing
   device storage is not account-scoped. Cloud loads/saves run concurrently and
   the current XP-based merge can overwrite a newer cloud state. Add an explicit
   load-before-save phase and account-switch handling, then test two users.
3. **RLS/schema feature gaps.** The fourth migration's public
   `is_approved_guardian` helper is a self-equality placeholder, unlike the real
   helper in the private schema. `ai_requests`, `audit_events`, `missions`,
   `safety_events`, `world_change_events` and `world_objects` have RLS but no
   policies in the migration files. Do not bypass RLS to hide this; define the
   intended role matrix and add a new reviewed migration. Preserve applied SQL.
   Roles/memberships/safety settings also lack an implemented trusted onboarding
   path. Seed data and any old users/files/content were not copied by schema SQL.
4. **AI/voice provider hardening.** Gemini is connected server-side and the
   Groq/Gemini router is available. Provider keys are now managed through the
   protected admin console and encrypted at rest. Rate limits and expanded safety
   validation remain required before broad public traffic. Never embed provider keys in JS.
5. **Generated types and integration coverage.** Current database types cover
   all 27 table names and the cloud-save columns. They were not regenerated from
   the live database in this continuation. Regenerate after any reviewed schema
   fix, and test anonymous, learner, guardian, moderator and admin behavior.
6. **Quality baseline.** The initial build passed; initial lint reported 14,072
   errors and 7 warnings, mostly formatting/line endings. Typecheck and test
   scripts were absent. Scripts and focused public-config tests now exist.
   These are not a complete application or RLS test suite. Large 3D bundle
   warnings and deprecated TanStack APIs need follow-up, not a broad redesign.

## Independent platform status

| Item                                                  | Decision                     | Status                                                    |
| ----------------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| React, TypeScript, TanStack, Three.js, assets and SQL | KEEP                         | Preserved                                                 |
| Legacy Vite wrapper                                   | REPLACE                      | Replaced by explicit standard plugins and Sites packaging |
| Editor auth-session broker                            | REPLACE                      | Origin-local Supabase storage; no parent-frame forwarding |
| Error-reporting hooks                                 | REMOVE from active app       | Detached from root; historical helper retained unused     |
| Cloud-specific configuration errors                   | REPLACE                      | Independent environment guidance                          |
| Legacy AI gateway                                     | REPLACE                      | Replaced by direct server-side provider integrations      |
| Legacy cron-specific secret names                     | REMOVE                       | Obsolete helper and variables removed                     |
| Historical Bun/editor files                           | REMOVE from active toolchain | Removed; maintained path uses npm                         |
| Legacy README/agent sync instructions                 | REPLACE                      | Updated for the independent repository                    |

## Reference documentation

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database types](https://supabase.com/docs/guides/api/rest/generating-types)
- [TanStack hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
