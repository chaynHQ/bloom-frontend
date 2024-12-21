import { KeyboardArrowRight } from '@mui/icons-material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Carousel as NukaCarousel, useCarousel } from 'nuka-carousel';
import { columnStyle } from '../../styles/common';
import theme from '../../styles/theme';

interface CarouselProps {
  items: Array<React.ReactNode>;
  theme: 'primary' | 'secondary';
  numberDesktopSlides?: number;
  numberMobileSlides?: number;
  showArrows?: boolean;
  arrowPosition?: 'side' | 'bottom';
}

const numberSlidesToWidthMap: { [key: number]: string } = {
  1: '100%',
  2: '50%',
  3: '33.33%',
  4: '25%',
};

// Dots and arrows in 1 component because of the design
export const CustomDots = ({
  showArrows = false,
  arrowPosition = 'bottom',
}: {
  showArrows: boolean;
  arrowPosition: 'side' | 'bottom';
}) => {
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
    theme = 'primary',
    numberMobileSlides,
    numberDesktopSlides,
    showArrows = false,
    arrowPosition = 'bottom',
  } = props;

  const siteTheme = useTheme();
  const isMobileScreen = useMediaQuery(siteTheme.breakpoints.down('sm'));

  const getSlideWidth = () => {
    const slideNumber = isMobileScreen ? numberMobileSlides || 1 : numberDesktopSlides || 1;
    return numberSlidesToWidthMap[slideNumber];
  };

  return (
    <NukaCarousel
      wrapMode="wrap"
      showArrows={showArrows && arrowPosition == 'side'}
      showDots={true}
      scrollDistance="slide"
      swiping={true}
      dots={<CustomDots showArrows={showArrows} arrowPosition={arrowPosition} />}
      title="carousel"
    >
      {items.map((item, index: number) => {
        return (
          <Box
            sx={{
              ...columnStyle,
              minWidth: getSlideWidth(),
            }}
            key={index}
          >
            {item}
          </Box>
        );
      })}
    </NukaCarousel>
  );
};

export default Carousel;
