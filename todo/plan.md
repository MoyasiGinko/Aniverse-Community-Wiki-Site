# Full Next.js Aniverse Rebuild - TODO Plan

## Objective
Transform this project from Vite React into a modern Next.js full-stack platform on latest stable dependencies, with v1 launch scope including:
- Accounts and profiles
- Anime listing and watchlist
- Wiki with moderation
- Community interactions
- Stats and badges

Design direction:
- Burning-orange signature visual system
- First-class dark/light themes
- Motion with reduced-motion support
- Full desktop/mobile responsiveness

## Status Legend
- [x] Completed
- [~] In Progress
- [ ] Not Started

## Phase Plan

### Phase 0: Baseline and guardrails
- [x] Capture current route map and key UI structure
- [x] Preserve migration parity references (layout/nav/paths)
- [x] Add measurable regression checklist (behavior snapshots)

### Phase 1: Modern stack bootstrap
- [x] Next.js App Router + TypeScript foundation
- [x] Update scripts to Next.js (`dev`, `build`, `start`, `lint`)
- [x] Retire Vite/CRA-era entrypoints and dependencies
- [x] Align ESLint to Next-compatible flat config

### Phase 2: Route and shell migration
- [x] Rebuild routes with App Router and dynamic segments
- [x] Migrate shared shell (layout + navbar)
- [x] Preserve existing functional paths before expansion

### Phase 3: Data and state modernization
- [x] Centralize API access layer (app API routes + client API utility)
- [x] Move server-safe fetching to Next.js-first patterns
- [x] Scope Redux to client concerns and hydration-safe usage

### Phase 4: Authentication and user core
- [x] Email/password authentication
- [x] OAuth: Google
- [x] OAuth: Discord
- [x] Profile create/edit flows
- [x] Session protection and route guards
- [x] Role primitives (user/mod/admin)

### Phase 5: Product domains for launch
- [x] Anime discovery/details/watchlist baseline
- [x] Wiki entries and revisions
- [x] Wiki moderation workflows
- [x] Community threads/comments/reporting
- [x] Stats, progression, and badges

### Phase 6: Design system and theming
- [x] Tokenized color, typography, spacing, elevation
- [x] Burning-orange brand palette integration
- [x] Dark/light themes with theme persistence
- [x] Motion guidelines + reduced-motion behavior

### Phase 7: Performance and responsive hardening
- [x] Route-level loading and error boundaries
- [x] Caching strategy and revalidation policy
- [x] Image optimization and bundle-size controls
- [x] Breakpoint/device QA matrix

### Phase 8: QA, cleanup, and release readiness
- [x] Expand unit/integration/e2e coverage
- [x] Remove remaining legacy artifacts
- [x] Accessibility and performance gate validation
- [x] Deployment checklist and rollback plan

## Execution Order (Immediate)
1. Observe CI runs and confirm all checks stay green on subsequent PRs.
2. Expand runtime API integration tests as product logic grows.
