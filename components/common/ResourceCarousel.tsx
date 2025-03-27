import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { getStoryblokStories } from '@/lib/storyblok';
import filterResourcesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box } from '@mui/material';
import { ISbStoriesParams, ISbStoryData } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { RelatedContentCard } from '../cards/RelatedContentCard';
import { ShortsCard } from '../cards/ShortsCard';
import Carousel, { getSlideWidth } from '../common/Carousel';

export interface ResourceCarouselProps {
  resourceTypes?: string[];
  title?: string;
  // Either you can pass the data down if you already have it or you can pull from the storyblok API
  resources?: ISbStoryData[];
}

const ResourceCarousel = ({
  resourceTypes,
  title = 'resource-category-carousel',
  resources = [],
}: ResourceCarouselProps) => {
  const userId = useTypedSelector((state) => state.user.id);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  // TODO filter by partner based on user access!
  const locale = useLocale(); // Get the current locale
  const baseProps: Partial<ISbStoriesParams> = {
    language: locale,
    version: 'published',
    sort_by: 'position:description',
  };

  const [shortStories, setShortStories] = useState<ISbStoryData[]>([]);
  const [conversationStories, setConversationStories] = useState<ISbStoryData[]>([]);
  const [carouselStories, setCarouselStories] = useState<ISbStoryData[]>([]);

  useEffect(() => {
    if (resources.length < 1 && resourceTypes) {
      const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;
      const userPartners = userHasAccessToPartnerContent(
        partnerAdmin?.partner,
        partnerAccesses,
        referralPartner,
        userId,
      );

      if (resourceTypes.includes('shorts')) {
        getStoryblokStories(locale, {
          ...baseProps,
          starts_with: 'shorts/',
        })
          .then((shorts) => {
            setShortStories(
              (shorts && filterResourcesForLocaleAndPartnerAccess(shorts, locale, userPartners)) ||
                [],
            );
          })
          .catch((error) => {
            console.error('Failed to fetch carousel shorts' + error);
          });
      }

      // This is a placeholder for the courses carousel implementation
      if (resourceTypes.includes('conversations')) {
        // add try catches
        getStoryblokStories(locale, {
          ...baseProps,
          starts_with: 'conversations/',
        })
          .then((conversations) => {
            setConversationStories(
              (conversations &&
                filterResourcesForLocaleAndPartnerAccess(conversations, locale, userPartners)) ||
                [],
            );
          })
          .catch((error) => {
            console.error('Failed to fetch carousel conversation' + error);
          });
      }
    } else {
      setCarouselStories(resources);
    }
  }, [userId, resources, resourceTypes]);

  if (!resourceTypes && resources.length < 1) {
    console.error('ResourceCarousel: resourceTypes or resources must be provided');
    return <></>;
  }

  const slidesPerView = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 3,
    xl: 3,
  };
  return (
    <Carousel
      title={title}
      theme="primary"
      showArrows={true}
      slidesPerView={slidesPerView}
      items={[...carouselStories, ...shortStories, ...conversationStories].map((story) => {
        return (
          (story.content.component === 'resource_short_video' && (
            <Box p={0.25} minWidth="260px" width="260px" key={story.name}>
              <ShortsCard
                title={story.content.name}
                category={RESOURCE_CATEGORIES.SHORT_VIDEO}
                href={getDefaultFullSlug(story.full_slug, locale)}
                duration={story.content.duration}
                image={story.content.preview_image}
              />
            </Box>
          )) ||
          (story.content.component === 'resource_conversation' && (
            <Box
              sx={{
                ...getSlideWidth(1, 2, 3),
              }}
              padding={1}
              key={story.name}
            >
              <RelatedContentCard
                title={story.name}
                href={getDefaultFullSlug(story.full_slug, locale)}
                category={RESOURCE_CATEGORIES.CONVERSATION}
                duration={story.content.duration}
              />
            </Box>
          ))
        );
      })}
    />
  );
};

export default ResourceCarousel;
