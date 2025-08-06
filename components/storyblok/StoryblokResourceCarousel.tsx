import { ISbStoryData } from '@storyblok/react/rsc';
import ResourceCarousel from '../common/ResourceCarousel';

export interface StoryBlokResourceCarouselProps {
  resources: ISbStoryData[];
  uuid: string;
}

const StoryblokResourceCarousel = ({ uuid, resources }: StoryBlokResourceCarouselProps) => {
  return <ResourceCarousel resources={resources || []} title={uuid} />;
};

export default StoryblokResourceCarousel;
