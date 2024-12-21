import { Box } from '@mui/material';
import { SbBlokData, storyblokEditable } from '@storyblok/react';
import Carousel from '../common/Carousel';
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

  return (
    <Box {...storyblokEditable({ _uid, _editable, items, theme })}>
      <Carousel
        numberMobileSlides={number_mobile_slides}
        numberDesktopSlides={number_desktop_slides}
        theme={theme}
        items={items.map((item, index: number) => {
          const component = components.find((c) => c.name === item.component);
          if (component) {
            const Component = component.component;
            return <Component {...item} key={index} />;
          }
        })}
      />
    </Box>
  );
};

export default StoryblokCarousel;
