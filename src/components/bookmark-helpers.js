/**
 * Pure bookmark helpers. No DOM or localStorage here, so Node can unit-test
 * them without a browser. Treat every stored value as untrusted.
 */

export const STORAGE_KEY = 'mona-bookmarks';
export const BOOKMARK_SEPARATOR = ' :: ';

const SLUG_PREFIX = 'mona-';
const SLUG_LENGTH = 6;
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[a-zA-Z0-9]+$/;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/** @param {string} value */
export function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Enter a URL to save.');

  const withScheme = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
  return parseHttpUrl(withScheme).href;
}

/**
 * @param {string | null} raw
 * @returns {{ url: string, slug: string }[]}
 */
export function parseBookmarks(raw) {
  const parsed = readJson(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    const bookmark = toBookmark(item);
    return bookmark ? [bookmark] : [];
  });
}

/** @param {{ url: string, slug: string }} bookmark */
export function formatBookmark(bookmark) {
  return `${bookmark.url}${BOOKMARK_SEPARATOR}${bookmark.slug}`;
}

/** @param {Set<string>} existingSlugs */
export function createSlug(existingSlugs) {
  let slug = nextSlug();
  while (existingSlugs.has(slug)) slug = nextSlug();
  return slug;
}

/** @param {string} value */
function parseHttpUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Enter a valid URL.');
  }

  const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
  if (!isHttp || !url.hostname) {
    throw new Error('Enter a valid HTTP or HTTPS URL.');
  }
  return url;
}

/** @param {string | null} raw */
function readJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @param {unknown} item */
function toBookmark(item) {
  if (!isRecord(item)) return null;
  if (typeof item.url !== 'string' || typeof item.slug !== 'string') return null;
  if (!SLUG_PATTERN.test(item.slug)) return null;

  try {
    return { url: normalizeUrl(item.url), slug: item.slug };
  } catch {
    return null;
  }
}

/** @param {unknown} value */
function isRecord(value) {
  return Boolean(value) && typeof value === 'object';
}

function nextSlug() {
  const bytes = crypto.getRandomValues(new Uint8Array(SLUG_LENGTH));
  const body = Array.from(bytes, (byte) => BASE62[byte % BASE62.length]).join('');
  return `${SLUG_PREFIX}${body}`;
}
