# Guardian Progression Architecture

Status: **PROTOTYPE** for the public anonymous test journey.

The physical board in Isla opens a bilingual progression map. Mission attempts and valuable rewards are created and checked by TanStack server functions. The browser sends only a mission ID and selected answers; XP, credits, badges, shields, and scoring rules are chosen by the server. Anonymous progress is encrypted/signed in an HttpOnly cookie and uses grant IDs plus one-use attempts for replay protection. Production school accounts will require durable transactional storage and identity migration; no remote Supabase schema or policy was changed in this phase.

Implemented: Basic Shield onboarding, Phishing Defense vertical slice, one-time fixed rewards, prerequisite visibility, inventory/equipment state, all seven shield gates, EN/ES board UI.

Prototype: anonymous cookie persistence, temporary N-mark shield visuals, bounded Builder Home.

Architected for future: durable student profiles, multi-device merge, verified credential service, final shield models.
