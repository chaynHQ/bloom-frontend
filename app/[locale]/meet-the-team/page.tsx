import { getStoryblokPageProps } from '../../../utils/getStoryblokPageProps';
import MeetTheTeam from './meet-the-team';

export const revalidate = 3600;

export default async function Page({ params }: { params: { locale: string } }) {
  const preview = false;
  const locale = params.locale;
  const storyblokProps = await getStoryblokPageProps('meet-the-team', locale, preview);
  return <MeetTheTeam story={storyblokProps?.story}></MeetTheTeam>;
}
