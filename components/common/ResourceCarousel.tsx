'use client';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import filterResourcesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { RelatedContentCard } from '../cards/RelatedContentCard';
import { ResourceCard } from '../cards/ResourceCard';
import Carousel, { CarouselItemContainer } from './Carousel';

export interface ResourceCarouselProps {
  resourceTypes?: string[];
  title?: string;
  // Either you can pass the data down if you already have it or you can pull from the storyblok API
  resources?: ISbStoryData[];
}
const slidesPerView = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
};
const ResourceCarousel = ({
  title = 'resource-category-carousel',
  resources = [],
}: ResourceCarouselProps) => {
  const userId = useTypedSelector((state) => state.user.id);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const locale = useLocale(); // Get the current locale
  const [carouselStories, setCarouselStories] = useState<ISbStoryData[]>([]);
  const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

  useEffect(() => {
    const userPartners = userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
    setCarouselStories(
      filterResourcesForLocaleAndPartnerAccess(resources, locale, userPartners) || [],
    );
  }, [userId, partnerAccesses, locale]);

  if (resources.length < 1 || carouselStories.length === 0) {
    console.error('ResourceCarousel: resources must be provided');
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
              <CarouselItemContainer customWidth={'280px'} key={index}>
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
              <CarouselItemContainer customWidth={'280px'} key={index}>
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
              <CarouselItemContainer slidesPerScreen={[1, 2, 3]} key={index}>
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
