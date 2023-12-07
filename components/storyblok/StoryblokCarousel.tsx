import { NavigateBeforeSharp, NavigateNext } from '@mui/icons-material';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import NukaCarousel from 'nuka-carousel';
import { StoryblokComponent } from 'storyblok-js-client';
import { Component as DynamicComponent } from './DynamicComponent';
import StoryblokCard from './StoryblokCard';
import StoryblokImage from './StoryblokImage';
import StoryblokQuote from './StoryblokQuote';
import StoryblokVideo from './StoryblokVideo';

const components: DynamicComponent[] = [
  { name: 'image', component: StoryblokImage },
  { name: 'video', component: StoryblokVideo },
  { name: 'quote', component: StoryblokQuote },
  { name: 'card', component: StoryblokCard },
];

interface StoryblokCarouselProps {
  items: Array<StoryblokComponent<string>>;
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
