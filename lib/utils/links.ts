import { BASE_URL } from '@/lib/constants/common';

export interface StoryblokLink {
  url?: string;
  cached_url?: string;
  linktype?: string;
}

export interface ResolvedLink {
  href: string;
  external: boolean;
}

// Whether an href leaves Bloom, and so should open in a new tab.
export function isExternalHref(href: string): boolean {
  if (!/^https?:\/\//.test(href)) return false;
  return !(Boolean(BASE_URL) && href.startsWith(BASE_URL as string));
}

// An internal pick comes back as a story path in `cached_url` (no leading slash); an external one
// as an absolute url in `url`.
export function resolveStoryblokLink(link: StoryblokLink | undefined): ResolvedLink {
  const url = link?.url || link?.cached_url || '';
  if (!url) return { href: '', external: false };

  if (!/^https?:\/\//.test(url)) {
    return { href: url.startsWith('/') ? url : `/${url}`, external: false };
  }
  return { href: url, external: isExternalHref(url) };
}
