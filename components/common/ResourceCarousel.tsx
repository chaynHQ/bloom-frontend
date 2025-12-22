'use client';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useTypedSelector } from '@/lib/hooks/store';
import filterResourcesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { RelatedContentCard } from '../cards/RelatedContentCard';
import { ResourceCard } from '../cards/ResourceCard';
import Carousel, { CarouselItemContainer } from './Carousel';

export interface ResourceCarouselProps {
  resourceTypes?: string[];
  title?: string;
  // Either you can pass the data down if you already have it or you can pull from the storyblok API
  resources?: ISbStoryData[];
}
const ResourceCarousel = ({
  title = 'resource-category-carousel',
  resources = [],
}: ResourceCarouselProps) => {
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
      <Carousel
        title={title}
        theme="primary"
        items={carouselStories.map((story, index) => {
          return (
            (story.content.component === 'resource_short_video' && (
              <CarouselItemContainer key={index}>
                <ResourceCard
                  title={story.content.name}
                  category={RESOURCE_CATEGORIES.SHORT_VIDEO}
                  href={getDefaultFullSlug(story.full_slug, locale)}
                  duration={story.content.duration}
                  image={story.content.preview_image}
                />
              </CarouselItemContainer>
            )) ||
            (story.content.component === 'resource_single_video' && (
              <CarouselItemContainer key={index}>
                <ResourceCard
                  title={story.content.name}
                  category={RESOURCE_CATEGORIES.SINGLE_VIDEO}
                  href={getDefaultFullSlug(story.full_slug, locale)}
                  duration={story.content.duration}
                  image={story.content.preview_image}
                />
              </CarouselItemContainer>
            )) ||
            (story.content.component === 'resource_conversation' && (
              <CarouselItemContainer key={index}>
                <RelatedContentCard
                  title={story.name}
                  href={getDefaultFullSlug(story.full_slug, locale)}
                  category={RESOURCE_CATEGORIES.CONVERSATION}
                  duration={story.content.duration}
                />
              </CarouselItemContainer>
            ))
          );
        })}
      />
    </Box>
  );
};

export default ResourceCarousel;
