import WelcomePage from '@/components/pages/WelcomePage';
import { routing } from '@/i18n/routing';
import { getPartnerSets } from '@/lib/partners/loader';
import { resolveLaunchedPartner } from '@/lib/partners/resolve';
import { getStoryblokStory } from '@/lib/storyblok';
import { generateMetadataBasic } from '@/lib/utils/generateMetadataBase';
import { getLibraryStories } from '@/lib/utils/getLibraryStories';
import { notFound } from 'next/navigation';

export const revalidate = 14400; // invalidate every 4 hours

type Params = Promise<{ locale: string; partnerName: string }>;

// Only a launched partner has a welcome page, at its exact slug.
async function getLaunchedPartner(locale: string, slug: string) {
  const { launched } = await getPartnerSets(locale);
  const partner = resolveLaunchedPartner(launched, slug);
  return partner?.slug === slug ? partner : undefined;
}

async function getStory(locale: string, slug: string) {
  return await getStoryblokStory(`welcome/${slug}`, locale, {
    resolve_relations: ['resource_carousel.resources'],
  });
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, partnerName } = await params;
  const partner = await getLaunchedPartner(locale, partnerName);
  if (!partner) return;

  const story = await getStory(locale, partnerName);
  if (!story) return;

  return generateMetadataBasic({
    // `title` is the hero headline; `seo_title` overrides the document title when set.
    title: story.content.seo_title || story.content.title,
    description: story.content.seo_description,
    locale,
    path: `/welcome/${partnerName}`,
  });
}

export async function generateStaticParams() {
  const { launched } = await getPartnerSets(routing.defaultLocale);
  return launched.flatMap((partner) =>
    routing.locales.map((locale) => ({ partnerName: partner.slug!, locale })),
  );
}

export default async function Page({ params }: { params: Params }) {
  const { locale, partnerName } = await params;

  const partner = await getLaunchedPartner(locale, partnerName);
  if (!partner) notFound();

  const [story, libraryStories] = await Promise.all([
    getStory(locale, partnerName),
    getLibraryStories(locale),
  ]);

  if (!story) {
    notFound();
  }

  return <WelcomePage story={story} libraryStories={libraryStories} partner={partner} />;
}
