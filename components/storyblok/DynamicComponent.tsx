'use client';

import { SbBlokData } from '@storyblok/react';
import Placeholder from './Placeholder';
import StoryblokButton from './StoryblokButton';
import StoryblokCard from './StoryblokCard';
import StoryblokCarousel from './StoryblokCarousel';
import StoryblokFaqs from './StoryblokFaqs';
import StoryblokImage from './StoryblokImage';
import StoryblokPageSection from './StoryblokPageSection';
import StoryblokQuote from './StoryblokQuote';
import StoryblokRow from './StoryblokRow';
import StoryblokRowColumnBlock from './StoryblokRowColumnBlock';
import StoryblokStatement from './StoryblokStatement';
import StoryblokVideo from './StoryblokVideo';

export interface Component {
  name: string;
  component: (props: any) => JSX.Element;
}

const components: Component[] = [
  { name: 'page_section', component: StoryblokPageSection },
  { name: 'image', component: StoryblokImage },
  { name: 'video', component: StoryblokVideo },
  { name: 'row', component: StoryblokRow },
  { name: 'row_new', component: StoryblokRowColumnBlock },
  { name: 'quote', component: StoryblokQuote },
  { name: 'card', component: StoryblokCard },
  { name: 'button', component: StoryblokButton },
  { name: 'faqs', component: StoryblokFaqs },
  { name: 'statement', component: StoryblokStatement },
  { name: 'carousel', component: StoryblokCarousel },
];

interface DynamicComponentProps {
  blok: SbBlokData;
}

const DynamicComponent = (props: DynamicComponentProps) => {
  const { blok } = props;
  const component = components.find((c) => c.name === blok.component);

  if (component) {
    const Component = component.component;
    return <Component blok={blok} />;
  }

  return <Placeholder componentName={blok.component || 'unnamed'} />;
};

export default DynamicComponent;
