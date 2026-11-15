import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug, formatBookmark, normalizeUrl, parseBookmarks } from '../src/components/bookmark-helpers.js';

test('normalizes URLs with or without https', () => {
  assert.equal(normalizeUrl('example.com/path'), normalizeUrl('https://example.com/path'));
  assert.throws(() => normalizeUrl('javascript://alert(1)'));
  assert.throws(() => normalizeUrl(''));
});

test('recovers from empty, corrupted, legacy and non-array storage', () => {
  for (const value of [null, '', '{bad json', '["https://example.com"]', '{}', 'null', '42']) {
    assert.deepEqual(parseBookmarks(value), []);
  }
});

test('keeps only valid bookmark objects from storage', () => {
  assert.deepEqual(parseBookmarks(JSON.stringify([
    { url: 'example.com', slug: 'mona-7fk2' },
    { url: 'javascript://evil', slug: 'mona-123' },
    { url: 123, slug: 'mona-123' },
    { url: 'https://example.com', slug: '<bad>' },
    null,
  ])), [{ url: 'https://example.com/', slug: 'mona-7fk2' }]);
});

test('formats a bookmark with the exact separator', () => {
  assert.equal(formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2');
});

test('generates short base62 slugs that do not collide with existing ones', () => {
  const slugs = new Set();
  for (let i = 0; i < 50; i++) {
    const slug = createSlug(slugs);
    assert.match(slug, /^mona-[a-zA-Z0-9]{6}$/);
    assert.equal(slugs.has(slug), false);
    slugs.add(slug);
  }
});
