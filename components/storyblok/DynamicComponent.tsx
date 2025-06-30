'use client';

import { SbBlokData } from '@storyblok/react/rsc';
import { ReactNode } from 'react';
import Placeholder from './Placeholder';
import StoryblokAccordion from './StoryblokAccordion';
import StoryblokAudio from './StoryblokAudio';
import StoryblokButton from './StoryblokButton';
import StoryblokCard from './StoryblokCard';
import StoryblokCarousel from './StoryblokCarousel';
import StoryblokImage from './StoryblokImage';
import StoryblokNotesFromBloomPromo from './StoryblokNotesFromBloomPromo';
import StoryblokPageSection from './StoryblokPageSection';
import StoryblokQuote from './StoryblokQuote';
import StoryblokResourceCarousel from './StoryblokResourceCarousel';
import StoryblokRow from './StoryblokRow';
import StoryblokRowColumnBlock from './StoryblokRowColumnBlock';
import StoryblokSpacer from './StoryblokSpacer';
import StoryblokStatement from './StoryblokStatement';
import StoryblokTeamMemberCard from './StoryblokTeamMemberCard';
import StoryblokTeamMembersCards from './StoryblokTeamMembersCards';
import StoryblokVideo from './StoryblokVideo';

export interface Component {
  name: string;
  component: (props: any) => ReactNode;
}

const components: Component[] = [
  { name: 'page_section', component: StoryblokPageSection },
  { name: 'image', component: StoryblokImage },
  { name: 'audio', component: StoryblokAudio },
  { name: 'video', component: StoryblokVideo },
  { name: 'row', component: StoryblokRow },
  { name: 'row_new', component: StoryblokRowColumnBlock },
  { name: 'team_member', component: StoryblokTeamMemberCard },
  { name: 'team_members_cards', component: StoryblokTeamMembersCards },
  { name: 'accordion', component: StoryblokAccordion },
  { name: 'spacer', component: StoryblokSpacer },
  { name: 'resource_carousel', component: StoryblokResourceCarousel },
  { name: 'quote', component: StoryblokQuote },
  { name: 'card', component: StoryblokCard },
  { name: 'button', component: StoryblokButton },
  { name: 'statement', component: StoryblokStatement },
  { name: 'carousel', component: StoryblokCarousel },
  { name: 'resource_carousel', component: StoryblokResourceCarousel },
  { name: 'notes_from_bloom_promo', component: StoryblokNotesFromBloomPromo },
];

interface DynamicComponentProps {
  blok: SbBlokData;
}

const DynamicComponent = (props: DynamicComponentProps) => {
  const { blok } = props;
  const component = components.find((c) => c.name === blok.component);

  if (component) {
    const Component = component.component;
    return <Component blok={blok} {...blok} />;
  }

  return <Placeholder componentName={blok.component || 'unnamed'} />;
};

export default DynamicComponent;
