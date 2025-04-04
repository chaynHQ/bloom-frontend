import { Box } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import ResourceCarousel from '../common/ResourceCarousel';

export interface StoryBlokResourceCarouselProps {
  resources: ISbStoryData[];
  uuid: string;
}

const StoryblokResourceCarousel = ({ uuid, resources }: StoryBlokResourceCarouselProps) => {
  return (
    <Box width="100%">
      <ResourceCarousel resources={resources || []} title={uuid} />
    </Box>
  );
};

export default StoryblokResourceCarousel;
