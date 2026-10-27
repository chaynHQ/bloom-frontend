import { PartnerContent } from '@/lib/constants/partners';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';

// The partner audiences the current viewer belongs to, lowercased to match a story's
// `included_for_partners`. Covers a partner admin, redeemed access codes, a pre-login referral
// hint, and the 'public' audience — which applies to anyone not scoped to a specific partner
// (logged out with no referral, or logged in with no partner access).
export function getUserContentPartners(
  partnerAdminPartner: PartnerContent | null,
  partnerAccesses: PartnerAccess[],
  referralPartner: string | null,
  userId: string | null,
): string[] {
  const partners = new Set<string>();

  if (partnerAdminPartner) partners.add(partnerAdminPartner.name.toLowerCase());
  if (userId) partnerAccesses.forEach((access) => partners.add(access.partner.name.toLowerCase()));
  if (referralPartner && !userId) partners.add(referralPartner.toLowerCase());

  const isPublicViewer = (!userId && !referralPartner) || (Boolean(userId) && partners.size === 0);
  if (isPublicViewer) partners.add('public');

  return [...partners];
}

interface FilterableStory {
  content?: Record<string, any> | null;
}

// Whether a signed-out visitor, and so a search engine, can open a story: content pages only open
// partner-only content to that partner's members. Session pages gate on their course's partners.
// Mirrors the pages' gate (hasAccessToPage), where an empty list is closed to signed-out visitors,
// not the library listing's filter, where it means everyone.
export function isPublicContent(includedForPartners: string[] | undefined): boolean {
  return (includedForPartners ?? []).some((partner) => partner.toLowerCase() === 'public');
}

// A story's `languages` must include the locale (English is Storyblok's `default`); a story with
// none set is treated as source-language English.
export function storyAvailableInLocale(languages: string[] | undefined, locale: string): boolean {
  const contentLanguage = locale === 'en' ? 'default' : locale;
  return languages?.length ? languages.includes(contentLanguage) : contentLanguage === 'default';
}

// Whether a story is visible to a viewer in the given locale (see `storyAvailableInLocale`) and its
// `included_for_partners` intersects the viewer's partners (an empty list means everyone).
function storyMatchesLocaleAndPartnerAccess(
  story: FilterableStory,
  locale: string,
  userPartners: string[],
): boolean {
  const matchesLanguage = storyAvailableInLocale(story?.content?.languages, locale);

  const includedForPartners: string[] = story?.content?.included_for_partners ?? [];
  const partners = userPartners.map((partner) => partner.toLowerCase());
  const matchesPartner =
    includedForPartners.length === 0 ||
    includedForPartners.some((partner) => partners.includes(partner.toLowerCase()));

  return matchesLanguage && matchesPartner;
}

export function filterStoriesForLocaleAndPartnerAccess<T extends FilterableStory>(
  stories: T[],
  locale: string,
  userPartners: string[],
): T[] {
  return stories.filter((story) => storyMatchesLocaleAndPartnerAccess(story, locale, userPartners));
}
