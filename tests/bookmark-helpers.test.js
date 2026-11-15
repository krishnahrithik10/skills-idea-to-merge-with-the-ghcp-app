import test from 'node:test';
import assert from 'node:assert/strict';
import { createSlug, formatBookmark, normalizeUrl, parseBookmarks } from '../src/components/bookmark-helpers.js';

test('a URL with or without https normalises to the same saved value', () => {
  assert.equal(normalizeUrl('example.com/path'), 'https://example.com/path');
  assert.equal(normalizeUrl('https://example.com/path'), 'https://example.com/path');
});

test('rejects blank and non-http URLs', () => {
  assert.throws(() => normalizeUrl(''));
  assert.throws(() => normalizeUrl('javascript://alert(1)'));
});

test('empty, corrupted, legacy, and non-array storage recovers to an empty list', () => {
  const unusable = [null, '', '{bad json', '["https://example.com"]', '{}', 'null', '42'];

  for (const value of unusable) {
    assert.deepEqual(parseBookmarks(value), []);
  }
});

test('loading keeps only well-formed bookmark objects', () => {
  const stored = JSON.stringify([
    { url: 'example.com', slug: 'mona-7fk2' },
    { url: 'javascript://evil', slug: 'mona-123' },
    { url: 123, slug: 'mona-123' },
    { url: 'https://example.com', slug: '<bad>' },
    null,
  ]);

  assert.deepEqual(parseBookmarks(stored), [
    { url: 'https://example.com/', slug: 'mona-7fk2' },
  ]);
});

test('a saved bookmark formats as "<url> :: <slug>"', () => {
  const bookmark = { url: 'https://www.example.com', slug: 'mona-7fk2' };

  assert.equal(formatBookmark(bookmark), 'https://www.example.com :: mona-7fk2');
});

test('slugs are short, base62, prefixed, and unique', () => {
  const existing = new Set();

  for (let i = 0; i < 50; i++) {
    const slug = createSlug(existing);
    assert.match(slug, /^mona-[a-zA-Z0-9]{6}$/);
    assert.equal(existing.has(slug), false);
    existing.add(slug);
  }
});
