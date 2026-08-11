import { BASE_URL } from '@/lib/constants/common';

// Storyblok's multilink field, trimmed to what link resolution reads.
export interface StoryblokLink {
  url?: string;
  cached_url?: string;
  linktype?: string;
}

export interface ResolvedLink {
  href: string;
  // External links get a plain anchor and a new tab; internal ones go through the locale-aware
  // Link so the visitor keeps their language.
  external: boolean;
}

// Whether an href leaves Bloom, and so should open in a new tab. A relative path never does; an
// absolute url does unless it points back at Bloom itself.
export function isExternalHref(href: string): boolean {
  if (!/^https?:\/\//.test(href)) return false;
  return !(Boolean(BASE_URL) && href.startsWith(BASE_URL as string));
}

// Resolves a Storyblok multilink to something a card or button can link to. An internal pick comes
// back as a story path in `cached_url` (no leading slash); an external one as an absolute url in
// `url`.
export function resolveStoryblokLink(link: StoryblokLink | undefined): ResolvedLink {
  const url = link?.url || link?.cached_url || '';
  if (!url) return { href: '', external: false };

  if (!/^https?:\/\//.test(url)) {
    return { href: url.startsWith('/') ? url : `/${url}`, external: false };
  }
  return { href: url, external: isExternalHref(url) };
}
