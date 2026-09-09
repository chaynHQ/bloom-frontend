import StoryblokAccordion from '@/components/storyblok/StoryblokAccordion';
import StoryblokAudio from '@/components/storyblok/StoryblokAudio';
import StoryblokAvatarGroup from '@/components/storyblok/StoryblokAvatarGroup';
import StoryblokButton from '@/components/storyblok/StoryblokButton';
import StoryblokCard from '@/components/storyblok/StoryblokCard';
import StoryblokCarousel from '@/components/storyblok/StoryblokCarousel';
import StoryblokCoursePage from '@/components/storyblok/StoryblokCoursePage';
import StoryblokGrounding from '@/components/storyblok/StoryblokGrounding';
import StoryblokImage from '@/components/storyblok/StoryblokImage';
import StoryblokLinkCard from '@/components/storyblok/StoryblokLinkCard';
import StoryblokMeetTheTeamPage from '@/components/storyblok/StoryblokMeetTheTeamPage';
import StoryblokNotesFromBloomPromo from '@/components/storyblok/StoryblokNotesFromBloomPromo';
import StoryblokPage from '@/components/storyblok/StoryblokPage';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import StoryblokQuote from '@/components/storyblok/StoryblokQuote';
import StoryblokQuoteCard from '@/components/storyblok/StoryblokQuoteCard';
import StoryblokResourceCarousel from '@/components/storyblok/StoryblokResourceCarousel';
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
import { routing } from '@/i18n/routing';
import { STORYBLOK_ENVIRONMENT } from './constants/common';
import { serverInstance as rollbar } from './rollbar';

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
    grounding_page: StoryblokGrounding,
    resource_carousel: StoryblokResourceCarousel,
    notes_from_bloom_promo: StoryblokNotesFromBloomPromo,
    link_card: StoryblokLinkCard,
    avatar_group: StoryblokAvatarGroup,
    quote_card: StoryblokQuoteCard,
  },
});

export const getStoryblokStory = async (
  slug: string | undefined,
  locale: string | undefined,
  params?: Partial<ISbStoriesParams>,
  uuids?: string,
  // Set by getOptionalStoryblokStory; see there.
  optional = false,
) => {
  if (!slug && !uuids) {
    throw new Error('No slug provided');
  }

  const sbParams: ISbStoriesParams = {
    version: STORYBLOK_ENVIRONMENT,
    language: locale || 'en',
    ...(params && params),
  };

  try {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories/${!uuids && slug}`, sbParams);

    return data?.story as ISbStoryData;
  } catch (error) {
    if (!optional) {
      rollbar.error('Error getting storyblok data for page', error as Error, { slug, sbParams });
    }
    return undefined;
  }
};

// For a slug the caller probes for rather than depends on. A story that is allowed not to exist
// should not report its absence to Rollbar as an error.
export const getOptionalStoryblokStory = async (
  slug: string,
  locale: string | undefined,
  params?: Partial<ISbStoriesParams>,
) => getStoryblokStory(slug, locale, params, undefined, true);

// `generateStaticParams` for a resource folder of one-level `[slug]` pages (audio, written,
// activity, shorts, conversations). On preview/staging the CMS reads `draft`, where migrated
// content may still be unpublished — pre-render those too; production reads `published` and
// never sees them.
export const resourceFolderStaticParams = async (
  folder: string,
): Promise<{ slug: string; locale: string }[]> => {
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get('cdn/links/', {
    version: STORYBLOK_ENVIRONMENT,
    starts_with: `${folder}/`,
  });

  const includeDrafts = STORYBLOK_ENVIRONMENT === 'draft';
  const paths: { slug: string; locale: string }[] = [];

  for (const key of Object.keys(data.links)) {
    const story = data.links[key];
    const slug: string | undefined = story.slug?.split('/')[1];
    if (!slug || (!story.published && !includeDrafts)) continue;
    for (const locale of routing.locales) paths.push({ slug, locale });
  }

  return paths;
};

export const getStoryblokStories = async (
  locale: string | undefined,
  params: Partial<ISbStoriesParams>,
  uuids?: string,
) => {
  const sbParams: ISbStoriesParams = {
    version: STORYBLOK_ENVIRONMENT,
    language: locale || 'en',
    ...(params && params),
    ...(uuids && { by_uuids: uuids }),
  };

  try {
    const storyblokApi: StoryblokClient = getStoryblokApi();

    let { data } = await storyblokApi.get(`cdn/stories`, sbParams);

    return data?.stories as ISbStoryData[];
  } catch (error) {
    rollbar.error('Error getting storyblok data for page', error as Error, { sbParams });
  }
};
