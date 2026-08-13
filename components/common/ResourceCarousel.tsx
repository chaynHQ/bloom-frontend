'use client';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_CAROUSEL_PAGED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import filterResourcesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { RelatedContentCard } from '../cards/RelatedContentCard';
import { ResourceCard } from '../cards/ResourceCard';
import { CardCarousel } from './CardCarousel';

export interface ResourceCarouselProps {
  resourceTypes?: string[];
  // Either you can pass the data down if you already have it or you can pull from the storyblok API
  resources?: ISbStoryData[];
}
function resourceCard(story: ISbStoryData, locale: string) {
  const href = getDefaultFullSlug(story.full_slug, locale);
  const { component, name, duration, preview_image } = story.content;

  switch (component) {
    case 'resource_short_video':
    case 'resource_single_video':
      return (
        <ResourceCard
          title={name}
          category={
            component === 'resource_short_video'
              ? RESOURCE_CATEGORIES.SHORT_VIDEO
              : RESOURCE_CATEGORIES.SINGLE_VIDEO
          }
          href={href}
          duration={duration}
          image={preview_image}
        />
      );
    case 'resource_conversation':
      return (
        <RelatedContentCard
          title={story.name}
          href={href}
          category={RESOURCE_CATEGORIES.CONVERSATION}
          duration={duration}
        />
      );
    default:
      return null;
  }
}

const ResourceCarousel = ({ resources = [] }: ResourceCarouselProps) => {
  const userId = useTypedSelector((state) => state.user.id);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const locale = useLocale(); // Get the current locale
  const referralPartner = useCookieReferralPartner();

  const carouselStories = useMemo(() => {
    const userPartners = userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
    return filterResourcesForLocaleAndPartnerAccess(resources, locale, userPartners) || [];
  }, [userId, partnerAccesses, locale, partnerAdmin?.partner, referralPartner, resources]);

  if (resources.length < 1 || carouselStories.length === 0) {
    return <div></div>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <CardCarousel controls eventName={RESOURCE_CAROUSEL_PAGED}>
        {carouselStories.flatMap((story, index) => {
          const card = resourceCard(story, locale);
          return card ? [<Box key={index}>{card}</Box>] : [];
        })}
      </CardCarousel>
    </Box>
  );
};

export default ResourceCarousel;
