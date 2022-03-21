import { Box } from '@mui/system';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import Header from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../config/storyblok';
import { LANGUAGES } from '../constants/enums';

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const Page: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  story = useStoryblok(story, preview, sbParams, locale);

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image?.filename,
    translatedImageAlt: story.content.header_image?.alt,
  };

  return (
    <Box>
      <Head>{story.content.title}</Head>

      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
      />
      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection
            key={`page_section_${index}`}
            content={section.content}
            alignment={section.alignment}
            color={section.color}
          />
        ))}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  const sbParams = {
    version: preview ? 'draft' : 'published',
    language: locale,
    ...(preview && { cv: Date.now() }),
  };

  let { data } = await Storyblok.get(`cdn/stories/${slug}`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: sbParams,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let { data } = await Storyblok.get('cdn/links/');

  const excludePaths: string[] = ['home', 'welcome', 'meet-the-team', 'courses'];

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
