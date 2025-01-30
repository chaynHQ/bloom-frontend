'use client';

import theme from '@/styles/theme';
import { useWidth } from '@/utils/useWidth';
import { KeyboardArrowRight } from '@mui/icons-material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Breakpoint, IconButton } from '@mui/material';
import { Carousel as NukaCarousel, useCarousel } from 'nuka-carousel';

interface CarouselProps {
  items: Array<React.ReactNode>;
  theme: 'primary' | 'secondary';
  showArrows?: boolean;
  arrowPosition?: 'side' | 'bottom';
  title?: string;
  slidesPerView?: { xs: number; sm: number; md: number; lg: number; xl: number };
}

const numberSlidesToWidthMap: { [key: number]: string } = {
  1: '100%',
  2: '50%',
  3: '33.33%',
  4: '25%',
};

// Dots and arrows in 1 component because of the design
const CustomDots = ({
  showArrows = false,
  arrowPosition = 'bottom',
}: {
  showArrows: boolean;
  arrowPosition: 'side' | 'bottom';
}) => {
  const { currentPage, totalPages, goBack, goForward, goToPage } = useCarousel();

  const getBackground = (index: number) =>
    currentPage === index ? theme.palette.primary.dark : theme.palette.grey[100];

  return (
    <Box
      justifyContent="center"
      gap={5}
      alignItems="center"
      marginLeft="auto" // need to override some mobile styles so that the dots are centered
      marginRight="auto"
      width="100%"
      maxWidth="400px"
      display="flex"
      marginTop={2}
    >
      {showArrows && arrowPosition == 'bottom' && (
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
      )}
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
      {showArrows && arrowPosition == 'bottom' && (
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
      )}
    </Box>
  );
};

const Carousel = (props: CarouselProps) => {
  const {
    items,
    showArrows = false,
    arrowPosition = 'bottom',
    title = 'carousel',
    slidesPerView = {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 1,
      xl: 1,
    },
  } = props;
  const width = useWidth();
  const navigationEnabled = isNavigationEnabled(width, items.length, slidesPerView);

  return (
    <NukaCarousel
      id={title}
      wrapMode="wrap"
      showArrows={navigationEnabled && showArrows && arrowPosition == 'side'}
      showDots={navigationEnabled}
      swiping={true}
      dots={<CustomDots showArrows={showArrows} arrowPosition={arrowPosition} />}
      title={title}
    >
      {items}
    </NukaCarousel>
  );
};

export default Carousel;

export const getSlideWidth = (
  numberMobileSlides: number,
  numberTabletSlides: number,
  numberDesktopSlides: number,
) => {
  return {
    width: [
      numberSlidesToWidthMap[numberMobileSlides || 1],
      numberSlidesToWidthMap[numberTabletSlides || 1],
      numberSlidesToWidthMap[numberDesktopSlides || 1],
    ],
    minWidth: [
      numberSlidesToWidthMap[numberMobileSlides || 1],
      numberSlidesToWidthMap[numberTabletSlides || 1],
      numberSlidesToWidthMap[numberDesktopSlides || 1],
    ],
  };
};
const isNavigationEnabled = (
  currentBreakpoint: Breakpoint,
  numberOfSlides: number,
  slidesPerBreakpoint: Record<Breakpoint, number>,
) => {
  const currentSlidesPerBreakpoint = slidesPerBreakpoint[currentBreakpoint];
  return currentSlidesPerBreakpoint < numberOfSlides;
};
