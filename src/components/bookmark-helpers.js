const slugPattern = /^mona-[a-zA-Z0-9]+$/;

/** @param {string} value */
export function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Enter a URL to save.');

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  let url;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error('Enter a valid URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
    throw new Error('Enter a valid HTTP or HTTPS URL.');
  }
  return url.href;
}

/** @param {string | null} value */
export function parseBookmarks(value) {
  if (!value) return [];
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    if (!item || typeof item !== 'object' ||
        typeof item.url !== 'string' || typeof item.slug !== 'string' ||
        !slugPattern.test(item.slug)) return [];
    try {
      const url = normalizeUrl(item.url);
      return [{ url, slug: item.slug }];
    } catch {
      return [];
    }
  });
}

/** @param {{url: string, slug: string}} bookmark */
export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

/** @param {Set<string>} existingSlugs */
export function createSlug(existingSlugs) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let slug;
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    slug = `mona-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
  } while (existingSlugs.has(slug));
  return slug;
}
