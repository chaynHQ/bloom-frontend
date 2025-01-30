import StoryblokAccordion from '@/components/storyblok/StoryblokAccordion';
import StoryblokAudio from '@/components/storyblok/StoryblokAudio';
import StoryblokButton from '@/components/storyblok/StoryblokButton';
import StoryblokCard from '@/components/storyblok/StoryblokCard';
import StoryblokCarousel from '@/components/storyblok/StoryblokCarousel';
import StoryblokCoursePage from '@/components/storyblok/StoryblokCoursePage';
import StoryblokFaqs from '@/components/storyblok/StoryblokFaqs';
import StoryblokImage from '@/components/storyblok/StoryblokImage';
import StoryblokMeetTheTeamPage from '@/components/storyblok/StoryblokMeetTheTeamPage';
import StoryblokPage from '@/components/storyblok/StoryblokPage';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import StoryblokQuote from '@/components/storyblok/StoryblokQuote';
import StoryblokRow from '@/components/storyblok/StoryblokRow';
import StoryblokRowColumnBlock from '@/components/storyblok/StoryblokRowColumnBlock';
import StoryblokSessionPage from '@/components/storyblok/StoryblokSessionPage';
import StoryblokSpacer from '@/components/storyblok/StoryblokSpacer';
import StoryblokStatement from '@/components/storyblok/StoryblokStatement';
import StoryblokTeamMemberCard from '@/components/storyblok/StoryblokTeamMemberCard';
import StoryblokTeamMembersCards from '@/components/storyblok/StoryblokTeamMembersCards';
import StoryblokVideo from '@/components/storyblok/StoryblokVideo';
import StoryblokWelcomePage from '@/components/storyblok/StoryblokWelcomePage';
import {
  apiPlugin,
  ISbStoriesParams,
  ISbStoryData,
  StoryblokClient,
  storyblokInit,
} from '@storyblok/react/rsc';

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components: {
    image: StoryblokImage,
    video: StoryblokVideo,
    audio: StoryblokAudio,
    row: StoryblokRow,
    row_new: StoryblokRowColumnBlock,
    team_member: StoryblokTeamMemberCard,
    team_members_cards: StoryblokTeamMembersCards,
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
    welcome: StoryblokWelcomePage,
    meet_the_team: StoryblokMeetTheTeamPage,
  },
});

export const getStoryblokStory = async (
  slug: string | undefined,
  locale: string | undefined,
  params?: Partial<ISbStoriesParams>,
  uuids?: string,
) => {
  if (!slug && !uuids) {
    throw new Error('No slug provided');
  }

  const sbParams: ISbStoriesParams = {
    // TODO: fix draft
    // version: ENVIRONMENT === ENVIRONMENTS.PRODUCTION ? 'published' : 'draft',
    version: 'published',
    language: locale || 'en',
    ...(params && params),
    ...(uuids && { by_uuids: uuids }),
  };

  const sbOptions = {
    cache: 'no-store' as RequestCache,
  };

  try {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories/${!uuids && slug}`, sbParams, sbOptions);

    return data?.story as ISbStoryData;
  } catch (error) {
    console.log('Error getting storyblok data for page', slug, sbParams, error);
    return undefined;
  }
};

export const getStoryblokStories = async (
  locale: string | undefined,
  params: Partial<ISbStoriesParams>,
  uuids?: string,
) => {
  const sbParams: ISbStoriesParams = {
    // TODO: fix draft
    // version: ENVIRONMENT === ENVIRONMENTS.PRODUCTION ? 'published' : 'draft',
    version: 'published',
    language: locale || 'en',
    ...(params && params),
    ...(uuids && { by_uuids: uuids }),
  };

  const sbOptions = {
    cache: 'no-store' as RequestCache,
  };

  try {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories`, sbParams, sbOptions);

    return data?.stories as ISbStoryData[];
  } catch (error) {
    console.log('Error getting storyblok data for page', sbParams, error);
  }
};
