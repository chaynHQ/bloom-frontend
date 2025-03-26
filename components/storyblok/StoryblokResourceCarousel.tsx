import { Box } from '@mui/material';
import ResourceCarousel from '../common/ResourceCarousel';

export interface StoryBlokResourceCarouselProps {
  resource_type: string[];
  uuid: string;
}

const StoryblokResourceCarousel = ({ resource_type, uuid }: StoryBlokResourceCarouselProps) => {
  return (
    <Box width="100%">
      <ResourceCarousel resourceTypes={resource_type} title={uuid} />
    </Box>
  );
};

export default StoryblokResourceCarousel;
