import { getLocale } from 'next-intl/server';
import { getStoryblokPageProps } from '../../utils/getStoryblokPageProps';
import MeetTheTeam from './meet-the-team';

export const revalidate = 3600;

export default async function Page() {
  const preview = false;
  const locale = await getLocale();
  const storyblokProps = await getStoryblokPageProps('meet-the-team', locale, preview);
  return <MeetTheTeam story={storyblokProps?.story}></MeetTheTeam>;
}
