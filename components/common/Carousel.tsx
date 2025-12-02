'use client';

import theme from '@/styles/theme';
import { KeyboardArrowRight } from '@mui/icons-material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { Box, IconButton } from '@mui/material';
import { Carousel as NukaCarousel, useCarousel } from 'nuka-carousel';

interface CarouselProps {
  items: Array<React.ReactNode>;
  theme: 'primary' | 'secondary';
  title?: string;
}

// These are purposely not exactly half or third of the screen width
// because nuka-carousel struggles to calculate the width of slides correctly
// when the parent container has a flex layout. This is a workaround to avoid that issue.
const numSlidesToWidthMap: { [key: number]: string } = {
  1: '100%',
  2: '50.01%',
  3: '33.34%',
  4: '25.01%',
};

export const getSlideWidth = (
  numMobileSlides: number,
  numTabletSlides: number,
  numDesktopSlides: number,
) => {
  return {
    width: [
      numSlidesToWidthMap[numMobileSlides || 1],
      numSlidesToWidthMap[numTabletSlides || 1],
      numSlidesToWidthMap[numDesktopSlides || 1],
    ],
    minWidth: [
      numSlidesToWidthMap[numMobileSlides || 1],
      numSlidesToWidthMap[numTabletSlides || 1],
      numSlidesToWidthMap[numDesktopSlides || 1],
    ],
  };
};

// Dots and arrows in 1 component because of the design
const CustomDots = ({ carouselTheme = 'primary' }: { carouselTheme: 'primary' | 'secondary' }) => {
  // totalPages are not calculated correctly in the nuka-carousel so causes a bug.
  // In the case that the scroll width is less than 1.5 times the screen width, it will round down the number of pages
  // and cause the dot count to be incorrect.
  // If you go into useMeasurements hook in nuka-carousel, you can see that it calculates the total pages and rounds down the number of pages.
  // This requires a bug report to nuka-carousel
  // In the meantime we do a workaround below `items.length % 3 === 2 &&` to add an extra slide when required
  const { currentPage, totalPages, goBack, goForward, goToPage } = useCarousel();
  if (totalPages < 2) return <></>;

  const iconButtonStyle = {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.primary.dark,
    },
  };

  const getBackground = (index: number) =>
    currentPage === index
      ? theme.palette.primary.dark
      : carouselTheme == 'primary'
        ? theme.palette.grey[100]
        : theme.palette.common.white;

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
        <IconButton onClick={goForward} sx={iconButtonStyle}>
          <KeyboardArrowRight></KeyboardArrowRight>
        </IconButton>
      </Box>
    </Box>
  );
};

const Carousel = (props: CarouselProps) => {
  const { items, title = 'carousel', theme = 'primary' } = props;

  return (
    <Box sx={{ mx: -1 }}>
      <NukaCarousel
        id={title}
        showDots={true}
        swiping={true}
        dots={<CustomDots carouselTheme={theme} />}
        title={title}
        scrollDistance={'screen'}
      >
        {items}
        {items.length % 3 === 1 && (
          <CarouselItemContainer>
            <></>
          </CarouselItemContainer>
        )}
      </NukaCarousel>
    </Box>
  );
};

export default Carousel;
// Note that if you use this function, the carousel will be buggy in some screen sizes as it struggles to calculate the width
// of slides correctly when the parent container has a flex layout. Avoid using this function if possible.
// Use it when you can't set a fixed width for the slides, like in the StoryblokCarousel component.

type CarouselItemContainerProps = {
  children: React.ReactNode;
  slidesPerScreen?: number[]; // [mobile, tablet, desktop]
  customPadding?: number;
  customWidth?: string | Array<string>;
};

export const CarouselItemContainer = ({
  children,
  slidesPerScreen = [1, 2, 3],
  customPadding = 1,
  customWidth,
}: CarouselItemContainerProps) => {
  const carouselItemContainerStyle = {
    boxSizing: 'border-box', // Ensure padding is included in width calculation
    px: customPadding,
    display: 'inline-block',

    ...(customWidth
      ? { minWidth: customWidth, width: customWidth }
      : {
          ...getSlideWidth(
            slidesPerScreen[0] || 1,
            slidesPerScreen[1] || 1,
            slidesPerScreen[2] || 1,
          ),
        }),
  } as const;

  return <Box sx={carouselItemContainerStyle}>{children}</Box>;
};
