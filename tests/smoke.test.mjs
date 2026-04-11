import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('critical feature routes exist', () => {
  const required = [
    'app/auth/page.tsx',
    'app/profile/page.tsx',
    'app/profile/edit/page.tsx',
    'app/wiki/page.tsx',
    'app/community/page.tsx',
    'app/stats/page.tsx',
    'app/moderation/page.tsx',
  ];

  for (const route of required) {
    assert.equal(existsSync(route), true, `Missing route: ${route}`);
  }
});

test('critical API endpoints exist', () => {
  const required = [
    'app/api/auth/login/route.ts',
    'app/api/auth/register/route.ts',
    'app/api/auth/oauth/route.ts',
    'app/api/profile/route.ts',
    'app/api/watchlist/route.ts',
    'app/api/wiki/route.ts',
    'app/api/community/threads/route.ts',
    'app/api/stats/route.ts',
    'app/api/moderation/reports/route.ts',
  ];

  for (const endpoint of required) {
    assert.equal(existsSync(endpoint), true, `Missing endpoint: ${endpoint}`);
  }
});
