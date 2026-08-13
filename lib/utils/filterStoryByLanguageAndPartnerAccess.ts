// Any story with Storyblok content on it: a full ISbStoryData, or a trimmed LibraryStory.
interface FilterableStory {
  content?: Record<string, any> | null;
}

const filterResourcesForLocaleAndPartnerAccess = <T extends FilterableStory>(
  resources: T[],
  locale: string,
  userPartners: string[],
): T[] => {
  const contentLanguagesString = locale === 'en' ? 'default' : locale;
  const partners = userPartners.map((partner) => partner.toLowerCase());

  return resources.filter((resource) => {
    const languages: string[] | undefined = resource?.content?.languages;
    // A story with no languages set is treated as source-language (English) content.
    const matchesLanguage = languages?.length
      ? languages.includes(contentLanguagesString)
      : contentLanguagesString === 'default';

    const includedForPartners: string[] = resource?.content?.included_for_partners ?? [];
    const matchesPartner =
      includedForPartners.length === 0 ||
      includedForPartners.some((partner) => partners.includes(partner.toLowerCase()));

    return matchesLanguage && matchesPartner;
  });
};

export default filterResourcesForLocaleAndPartnerAccess;
