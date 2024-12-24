import { Box, useTheme } from '@mui/material';
import { SbBlokData, storyblokEditable } from '@storyblok/react';
import { useWidth } from '../../utils/useWidth';
import Carousel, { getSlideWidth, isNavigationEnabled } from '../common/Carousel';
import { Component as DynamicComponent } from './DynamicComponent';
import StoryblokImage from './StoryblokImage';
import StoryblokQuote from './StoryblokQuote';
import StoryblokRowColumnBlock from './StoryblokRowColumnBlock';

const components: DynamicComponent[] = [
  { name: 'image', component: StoryblokImage },
  { name: 'quote', component: StoryblokQuote },
  { name: 'row_new', component: StoryblokRowColumnBlock },
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
  const siteTheme = useTheme();
  const width = useWidth();
  return (
    <Box {...storyblokEditable({ _uid, _editable, items, theme })}>
      <Carousel
        navigationEnabled={isNavigationEnabled(width, items.length, {
          xs: number_mobile_slides || 1,
          sm: number_desktop_slides || 1,
          md: number_desktop_slides || 1,
        })}
        theme={theme}
        items={items.map((item, index: number) => {
          const component = components.find((c) => c.name === item.component);
          if (component) {
            const Component = component.component;

            return (
              <Box
                sx={{
                  ...getSlideWidth(
                    number_mobile_slides || 1,
                    number_desktop_slides || 1,
                    number_desktop_slides || 1,
                  ),
                }}
                padding={0.25}
                key={index}
              >
                <Component {...item} key={index} />
              </Box>
            );
          }
        })}
      />
    </Box>
  );
};

export default StoryblokCarousel;
