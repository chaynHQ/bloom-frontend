'use client';

import Carousel, { CarouselItemContainer } from '@/components/common/Carousel';
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
  theme: 'primary' | 'secondary';
  number_desktop_slides?: number;
  number_mobile_slides?: number;
}

const StoryblokCarousel = (props: StoryblokCarouselProps) => {
  const {
    _uid,
    _editable,
    items,
    theme = 'primary',
    number_mobile_slides,
    number_desktop_slides,
  } = props;
  return (
    <Box {...storyblokEditable({ _uid, _editable, items, theme })}>
      <Carousel
        theme={theme}
        title={_uid}
        items={items.map((item, index: number) => {
          const component = components.find((c) => c.name === item.component);
          if (component) {
            const Component = component.component;

            return (
              <CarouselItemContainer
                slidesPerScreen={[
                  number_mobile_slides || 1,
                  number_desktop_slides || 1,
                  number_desktop_slides || 1,
                ]}
                index={index}
              >
                <Component {...item} key={index} />
              </CarouselItemContainer>
            );
          }
        })}
      />
    </Box>
  );
};

export default StoryblokCarousel;
