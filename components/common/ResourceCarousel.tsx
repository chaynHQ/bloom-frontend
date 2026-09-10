'use client';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RELATED_RESOURCES_CARD_CLICKED,
  RELATED_RESOURCES_CAROUSEL_PAGED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useUserContentPartners } from '@/lib/hooks/useUserContentPartners';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { filterStoriesForLocaleAndPartnerAccess } from '@/lib/utils/partnerContentAccess';
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
const RESOURCE_CATEGORY_BY_COMPONENT: Record<string, RESOURCE_CATEGORIES> = {
  resource_video: RESOURCE_CATEGORIES.VIDEO,
  resource_audio: RESOURCE_CATEGORIES.AUDIO,
  resource_written: RESOURCE_CATEGORIES.WRITTEN,
  resource_activity: RESOURCE_CATEGORIES.ACTIVITY,
};

function resourceCard(story: ISbStoryData, locale: string, onSelect: () => void) {
  const href = getDefaultFullSlug(story.full_slug, locale);
  const { component, name, duration, preview_image } = story.content;
  const category = RESOURCE_CATEGORY_BY_COMPONENT[component as string];

  switch (component) {
    case 'resource_video':
      return (
        <ResourceCard
          title={name}
          category={category}
          href={href}
          duration={duration}
          image={preview_image}
          onSelect={onSelect}
        />
      );
    case 'resource_audio':
    case 'resource_written':
    case 'resource_activity':
      return (
        <RelatedContentCard
          title={story.name}
          href={href}
          category={category}
          duration={duration}
          onSelect={onSelect}
        />
      );
    default:
      return null;
  }
}

const ResourceCarousel = ({ resources = [] }: ResourceCarouselProps) => {
  const locale = useLocale();
  const userPartners = useUserContentPartners();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const carouselStories = useMemo(
    () => filterStoriesForLocaleAndPartnerAccess(resources, locale, userPartners),
    [locale, userPartners, resources],
  );

  if (resources.length < 1 || carouselStories.length === 0) {
    return <div></div>;
  }

  const logCardClick = (story: ISbStoryData, index: number) =>
    logEvent(RELATED_RESOURCES_CARD_CLICKED, {
      related_resource_name: story.name,
      related_resource_storyblok_uuid: story.uuid,
      related_resource_category:
        RESOURCE_CATEGORY_BY_COMPONENT[story.content.component as string] ?? null,
      related_resource_position: index + 1,
      ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    });

  return (
    <Box sx={{ width: '100%' }}>
      <CardCarousel controls eventName={RELATED_RESOURCES_CAROUSEL_PAGED}>
        {carouselStories.flatMap((story, index) => {
          const card = resourceCard(story, locale, () => logCardClick(story, index));
          return card ? [<Box key={index}>{card}</Box>] : [];
        })}
      </CardCarousel>
    </Box>
  );
};

export default ResourceCarousel;
