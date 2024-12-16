import { KeyboardArrowRight } from '@mui/icons-material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { SbBlokData, storyblokEditable } from '@storyblok/react';
import { Carousel, useCarousel } from 'nuka-carousel';
import { columnStyle } from '../../styles/common';
import theme from '../../styles/theme';
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

const numberSlidesToWidthMap: { [key: number]: string } = {
  1: '100%',
  2: '50%',
  3: '33.33%',
};

// Dots and arrows in 1 component because of the design
export const CustomDots = () => {
  const { currentPage, totalPages, goBack, goForward, goToPage } = useCarousel();

  const getBackground = (index: number) =>
    currentPage === index ? theme.palette.primary.dark : theme.palette.common.white;

  return (
    <Box
      justifyContent={['space-between', 'center']}
      gap={[1, 5]}
      alignItems="center"
      marginLeft="auto" // need to override some mobile styles so that the dots are centered
      marginRight="auto"
      width="100%"
      maxWidth="400px"
      display="flex"
    >
      <Box alignContent="center">
        <IconButton
          onClick={goBack}
          sx={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white,
            '&:hover': {
              backgroundColor: theme.palette.common.white,
              color: theme.palette.primary.dark,
            },
          }}
        >
          <KeyboardArrowLeft></KeyboardArrowLeft>
        </IconButton>
      </Box>
      <Box>
        <Box display="flex" gap={1} alignContent="center" width="100%">
          {[...Array(totalPages)].map((_, index) => (
            <Box key={index}>
              <button
                style={{
                  borderRadius: 50,
                  backgroundColor: getBackground(index),
                  height: '0.75em',
                  width: '0.75em',
                  padding: 0,
                  border: 'none',
                  display: 'inline-block',
                }}
                key={index}
                onClick={() => goToPage(index)}
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box alignContent="center">
        <IconButton
          onClick={goForward}
          sx={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white,
            '&:hover': {
              backgroundColor: theme.palette.common.white,
              color: theme.palette.primary.dark,
            },
          }}
        >
          <KeyboardArrowRight></KeyboardArrowRight>
        </IconButton>
      </Box>
    </Box>
  );
};

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
  const isMobileScreen = useMediaQuery(siteTheme.breakpoints.down('sm'));

  const getSlideWidth = () => {
    const slideNumber = isMobileScreen ? number_mobile_slides || 1 : number_desktop_slides || 1;
    return numberSlidesToWidthMap[slideNumber];
  };

  return (
    <Box {...storyblokEditable({ _uid, _editable, items, theme })}>
      <Carousel
        wrapMode="wrap"
        showArrows={false}
        showDots={true}
        scrollDistance="slide"
        swiping={true}
        dots={<CustomDots />}
        title="carousel"
      >
        {items.map((item, index: number) => {
          const component = components.find((c) => c.name === item.component);
          if (component) {
            const Component = component.component;
            return (
              <Box
                sx={{
                  ...columnStyle,
                  minWidth: getSlideWidth(),
                }}
                key={index}
              >
                <Component {...item} key={index} />
              </Box>
            );
          }
        })}
      </Carousel>
    </Box>
  );
};

export default StoryblokCarousel;
