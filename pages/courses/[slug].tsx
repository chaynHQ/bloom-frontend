import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect } from 'react';
import { StoryData } from 'storyblok-js-client';
import { RootState } from '../../app/store';
import Header from '../../components/Header';
import { useTypedSelector } from '../../hooks/store';
import illustrationTeaPeach from '../../public/illustration_tea_peach.png';
import { getEventUserData } from '../../utils/logEvent';
import Storyblok from '../../utils/storyblok';

interface Props {
  story: StoryData;
  preview: boolean;
  messages: any;
}

const CourseOverview: NextPage<Props> = ({ story, preview, messages }) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');
  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });

  useEffect(() => {}, []);

  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
  };

  const containerStyle = {
    backgroundColor: 'secondary.light',
    textAlign: 'center',
    // ...rowStyle,
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
  } as const;

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        {story.content.weeks.map((week: any) => {
          return (
            <Box mb={3} key={week.name.split(':')[0]}>
              <Typography key={week.name}>{week.name}</Typography>
              {week.sessions.map((session: any) => {
                return <Typography key={session.slug}>{session.content.name}</Typography>;
              })}
            </Box>
          );
        })}
      </Container>
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  let slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  let sbParams = {
    resolve_relations: 'week.sessions',
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/${slug}`, sbParams);
  console.log(data);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let { data } = await Storyblok.get('cdn/links/?starts_with=courses/');

  let paths: any = [];
  Object.keys(data.links).forEach((linkKey) => {
    if (!data.links[linkKey].is_startpage) {
      return;
    }

    // get array for slug because of catch all
    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: splittedSlug[1] }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default CourseOverview;
