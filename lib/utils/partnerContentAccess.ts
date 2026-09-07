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

// Whether a story is visible to a viewer in the given locale: its language list must include the
// locale (a story with none set is treated as source-language English), and its
// `included_for_partners` must intersect the viewer's partners (an empty list means everyone).
export function storyMatchesLocaleAndPartnerAccess(
  story: FilterableStory,
  locale: string,
  userPartners: string[],
): boolean {
  const contentLanguage = locale === 'en' ? 'default' : locale;
  const languages: string[] | undefined = story?.content?.languages;
  const matchesLanguage = languages?.length
    ? languages.includes(contentLanguage)
    : contentLanguage === 'default';

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
