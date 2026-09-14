import { ISbStoryData } from '@storyblok/react/rsc';
import ResourceCarousel from '../common/ResourceCarousel';

export interface StoryBlokResourceCarouselProps {
  resources: ISbStoryData[];
}

const StoryblokResourceCarousel = ({ resources }: StoryBlokResourceCarouselProps) => {
  return <ResourceCarousel resources={resources || []} />;
};

export default StoryblokResourceCarousel;
