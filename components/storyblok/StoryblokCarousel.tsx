import NavigateBeforeSharp from '@mui/icons-material/NavigateBeforeSharp';
import NavigateNext from '@mui/icons-material/NavigateNext';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { SbBlokData } from '@storyblok/react';
import NukaCarousel from 'nuka-carousel';
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
  items: Array<SbBlokData>;
  theme: 'primary' | 'secondary';
}
const PreviousButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: 'primary.dark',

        ml: { md: -7, lg: -10, xl: -20 },
        ':hover': {
          background: 'none',
        },
        '& svg': {
          height: 60,
          width: 60,
        },
      }}
      aria-label="previous slide"
    >
      <NavigateBeforeSharp width={5} height={5} fontSize="inherit" />
    </IconButton>
  );
};

const NextButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: 'primary.dark',
        mr: { md: -7, lg: -10, xl: -20 },
        ':hover': {
          background: 'none',
        },
        '& svg': {
          height: 60,
          width: 60,
        },
      }}
      aria-label="next slide"
      size="large"
    >
      <NavigateNext fontSize="inherit" />
    </IconButton>
  );
};
const StoryblokCarousel = ({ items, theme = 'primary' }: StoryblokCarouselProps) => {
  const siteTheme = useTheme();

  const isMobileScreen = useMediaQuery(siteTheme.breakpoints.down('md'));

  return (
    <NukaCarousel
      wrapAround={true}
      adaptiveHeight={false}
      defaultControlsConfig={{
        pagingDotsStyle: {
          fill: theme === 'primary' ? '#F5E4E6' : '#FFFFFF',
        },
        pagingDotsContainerClassName: 'paging-dots-container',
      }}
      renderCenterLeftControls={
        isMobileScreen
          ? () => {
              return <></>;
            }
          : ({ previousSlide }) => <PreviousButton onClick={previousSlide} />
      }
      renderCenterRightControls={
        isMobileScreen
          ? () => {
              return <></>;
            }
          : ({ nextSlide }) => <NextButton onClick={nextSlide} />
      }
    >
      {items.map((item, index: number) => {
        const component = components.find((c) => c.name === item.component);
        if (component) {
          const Component = component.component;
          return (
            <Box sx={{}} key={index}>
              <Component {...item} key={index} />
            </Box>
          );
        }
      })}
    </NukaCarousel>
  );
};

export default StoryblokCarousel;
