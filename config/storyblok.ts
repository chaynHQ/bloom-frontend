import { apiPlugin, storyblokInit } from '@storyblok/react';
import StoryblokAccordion from '../components/storyblok/StoryblokAccordion';
import StoryblokAudio from '../components/storyblok/StoryblokAudio';
import StoryblokButton from '../components/storyblok/StoryblokButton';
import StoryblokCard from '../components/storyblok/StoryblokCard';
import StoryblokCarousel from '../components/storyblok/StoryblokCarousel';
import StoryblokFaqs from '../components/storyblok/StoryblokFaqs';
import StoryblokImage from '../components/storyblok/StoryblokImage';
import StoryblokQuote from '../components/storyblok/StoryblokQuote';
import StoryblokRow from '../components/storyblok/StoryblokRow';
import StoryblokRowColumnBlock from '../components/storyblok/StoryblokRowColumnBlock';
import StoryblokSpacer from '../components/storyblok/StoryblokSpacer';
import StoryblokStatement from '../components/storyblok/StoryblokStatement';
import StoryblokVideo from '../components/storyblok/StoryblokVideo';

export const storyblok = storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components: {
    image: StoryblokImage,
    video: StoryblokVideo,
    audio: StoryblokAudio,
    row: StoryblokRow,
    row_new: StoryblokRowColumnBlock,
    quote: StoryblokQuote,
    card: StoryblokCard,
    button: StoryblokButton,
    faq_list: StoryblokFaqs,
    statement: StoryblokStatement,
    accordion: StoryblokAccordion,
    carousel: StoryblokCarousel,
    spacer: StoryblokSpacer,
  },
});
