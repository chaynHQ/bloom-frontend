import { Box } from '@mui/system';
import { ISbStoryData, getStoryblokApi, useStoryblokState } from '@storyblok/react';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SignUpBanner } from '../components/banner/SignUpBanner';
import NoDataAvailable from '../components/common/NoDataAvailable';
import Header from '../components/layout/Header';
import StoryblokPageSection, {
  StoryblokPageSectionProps,
} from '../components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '../hooks/store';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';

interface Props {
  story: ISbStoryData | null;
}

const Page: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  const userToken = useTypedSelector((state) => state.user.token);
  const router = useRouter();

  if (!story) {
    return <NoDataAvailable />;
  }

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image?.filename,
    translatedImageAlt: story.content.header_image?.alt,
  };
  const partiallyPublicPages = ['/activities', '/grounding'];
  const isPartiallyPublicPage = partiallyPublicPages.includes(router.asPath);

  return (
    <Box>
      <Head>{story.content.title}</Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
      />
      {!userToken && isPartiallyPublicPage && <SignUpBanner />}
      {userToken &&
        story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: StoryblokPageSectionProps, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} />
        ))}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  const storyblokProps = await getStoryblokPageProps(slug, locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const storyblokApi = getStoryblokApi();
  let { data } = await storyblokApi.get('cdn/links/');

  const excludePaths: string[] = [
    'home',
    'welcome',
    'meet-the-team',
    'courses',
    'about-our-courses',
    'chat',
  ];

  let paths: any = [];
  Object.keys(data.links).forEach((linkKey) => {
    if (data.links[linkKey].is_folder) {
      return;
    }

    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

    if (locales && !excludePaths.includes(splittedSlug[0])) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: slug }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default Page;
