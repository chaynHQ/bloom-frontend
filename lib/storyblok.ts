import StoryblokAccordion from '@/lib/components/storyblok/StoryblokAccordion';
import StoryblokAudio from '@/lib/components/storyblok/StoryblokAudio';
import StoryblokButton from '@/lib/components/storyblok/StoryblokButton';
import StoryblokCard from '@/lib/components/storyblok/StoryblokCard';
import StoryblokCarousel from '@/lib/components/storyblok/StoryblokCarousel';
import StoryblokCoursePage from '@/lib/components/storyblok/StoryblokCoursePage';
import StoryblokFaqs from '@/lib/components/storyblok/StoryblokFaqs';
import StoryblokImage from '@/lib/components/storyblok/StoryblokImage';
import StoryblokMeetTheTeamPage from '@/lib/components/storyblok/StoryblokMeetTheTeamPage';
import StoryblokPage from '@/lib/components/storyblok/StoryblokPage';
import StoryblokPageSection from '@/lib/components/storyblok/StoryblokPageSection';
import StoryblokQuote from '@/lib/components/storyblok/StoryblokQuote';
import StoryblokRow from '@/lib/components/storyblok/StoryblokRow';
import StoryblokRowColumnBlock from '@/lib/components/storyblok/StoryblokRowColumnBlock';
import StoryblokSessionPage from '@/lib/components/storyblok/StoryblokSessionPage';
import StoryblokSpacer from '@/lib/components/storyblok/StoryblokSpacer';
import StoryblokStatement from '@/lib/components/storyblok/StoryblokStatement';
import StoryblokTeamMemberCard from '@/lib/components/storyblok/StoryblokTeamMemberCard';
import StoryblokTeamMembersCards from '@/lib/components/storyblok/StoryblokTeamMembersCards';
import StoryblokVideo from '@/lib/components/storyblok/StoryblokVideo';
import StoryblokWelcomePage from '@/lib/components/storyblok/StoryblokWelcomePage';
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

  try {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories/${!uuids && slug}`, sbParams);

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

  try {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories`, sbParams);

    return data?.stories as ISbStoryData[];
  } catch (error) {
    console.log('Error getting storyblok data for page', sbParams, error);
  }
};
