import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('global stylesheet includes reduced motion guard', () => {
  const css = readFileSync('src/index.css', 'utf8');
  assert.equal(css.includes('@media (prefers-reduced-motion: reduce)'), true);
});

test('theme toggle component exists', () => {
  const component = readFileSync('src/components/ThemeToggle.jsx', 'utf8');
  assert.equal(component.includes('aniverse_theme'), true);
});

test('next config includes remote image optimization', () => {
  const nextConfig = readFileSync('next.config.mjs', 'utf8');
  assert.equal(nextConfig.includes('remotePatterns'), true);
  assert.equal(nextConfig.includes('optimizePackageImports'), true);
});
