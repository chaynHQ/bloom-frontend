import { ISbStoryData } from '@storyblok/react/rsc';

const filterResourcesForLocaleAndPartnerAccess = (
  resources: ISbStoryData[],
  locale: string,
  userPartners: string[],
) =>
  resources.filter((resource: ISbStoryData) => {
    const contentLanguagesString = locale === 'en' ? 'default' : locale;
    return (
      resource?.content?.languages?.includes(contentLanguagesString) &&
      (resource?.content?.included_for_partners?.length === 0 ||
        userPartners.some((partner) => {
          return resource.content.included_for_partners
            .map((p: string) => p.toLowerCase())
            .includes(partner.toLowerCase());
        }))
    );
  });

export default filterResourcesForLocaleAndPartnerAccess;
