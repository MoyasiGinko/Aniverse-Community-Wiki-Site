# Release Checklist

## Deployment
- [x] Next.js production scripts configured
- [x] App Router routes mapped for launch scope
- [x] API routes in place for auth/profile/watchlist/wiki/community/stats/moderation
- [x] Middleware protection enabled for sensitive pages

## Rollback
- [x] Keep previous deployment artifact for immediate rollback
- [x] Rollback command documented: redeploy previous stable commit/tag
- [x] Data file backup step defined for `data/db.json`

## Verification
- [x] Run production build in CI pipeline
- [x] Run smoke tests on auth/wiki/community/stats routes
- [x] Verify moderator and standard user role behavior
- [x] Validate dark/light theme and reduced-motion behavior
