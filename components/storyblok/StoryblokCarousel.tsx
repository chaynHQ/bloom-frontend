'use client';

import { CardCarousel } from '@/components/common/CardCarousel';
import { STORYBLOK_CAROUSEL_PAGED } from '@/lib/constants/events';
import { Box } from '@mui/material';
import { SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { Component as DynamicComponent } from './DynamicComponent';
import StoryblokImage from './StoryblokImage';
import StoryblokQuote from './StoryblokQuote';
import StoryblokRow from './StoryblokRow';

const components: DynamicComponent[] = [
  { name: 'image', component: StoryblokImage },
  { name: 'quote', component: StoryblokQuote },
  { name: 'row_new', component: StoryblokRow },
];

interface StoryblokCarouselProps {
  _uid: string;
  _editable: string;
  items: Array<SbBlokData>;
  number_desktop_slides?: number;
  number_mobile_slides?: number;
}

const StoryblokCarousel = (props: StoryblokCarouselProps) => {
  const { _uid, _editable, items, number_mobile_slides, number_desktop_slides } = props;
  return (
    <Box {...storyblokEditable({ _uid, _editable, items })}>
      <CardCarousel
        controls
        eventName={STORYBLOK_CAROUSEL_PAGED}
        slidesPerView={{
          xs: number_mobile_slides || 1,
          sm: number_desktop_slides || 1,
          md: number_desktop_slides || 1,
        }}
      >
        {items.flatMap((item, index: number) => {
          const component = components.find((c) => c.name === item.component);
          if (!component) return [];
          const Component = component.component;
          return [<Component {...item} key={index} />];
        })}
      </CardCarousel>
    </Box>
  );
};

export default StoryblokCarousel;
