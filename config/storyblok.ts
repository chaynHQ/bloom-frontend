import { apiPlugin, storyblokInit } from '@storyblok/react';
import StoryblokAccordion from '../components/storyblok/StoryblokAccordion';
import StoryblokAudio from '../components/storyblok/StoryblokAudio';
import StoryblokButton from '../components/storyblok/StoryblokButton';
import StoryblokCard from '../components/storyblok/StoryblokCard';
import StoryblokCarousel from '../components/storyblok/StoryblokCarousel';
import StoryblokCoursePage from '../components/storyblok/StoryblokCoursePage';
import StoryblokFaqs from '../components/storyblok/StoryblokFaqs';
import StoryblokImage from '../components/storyblok/StoryblokImage';
import StoryblokPage from '../components/storyblok/StoryblokPage';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import StoryblokQuote from '../components/storyblok/StoryblokQuote';
import StoryblokRow from '../components/storyblok/StoryblokRow';
import StoryblokRowColumnBlock from '../components/storyblok/StoryblokRowColumnBlock';
import StoryblokSessionIbaPage from '../components/storyblok/StoryblokSessionIBAPage';
import StoryblokSessionPage from '../components/storyblok/StoryblokSessionPage';
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
    page_section: StoryblokPageSection,
    page: StoryblokPage,
    course: StoryblokCoursePage,
    session: StoryblokSessionPage,
    session_iba: StoryblokSessionIbaPage,
  },
});
