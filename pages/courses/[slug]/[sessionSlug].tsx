import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { RootState } from '../../../app/store';
import Header from '../../../components/Header';
import { LANGUAGES } from '../../../constants/enums';
import { useTypedSelector } from '../../../hooks/store';
import illustrationTeaPeach from '../../../public/illustration_tea_peach.png';
import { rowStyle } from '../../../styles/common';
import { getEventUserData } from '../../../utils/logEvent';
import Storyblok from '../../../utils/storyblok';

interface Props {
  story: StoryData;
  preview: boolean;
  messages: any;
  locale: LANGUAGES;
}

const Session: NextPage<Props> = ({ story, preview, messages, locale }) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');
  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);

  useEffect(() => {
    const coursePartners = story.content.course.content.included_for_partners;

    if (!partnerAccesses && coursePartners.includes('Public')) {
      setIncorrectAccess(false);
    }

    partnerAccesses.map((partnerAccess) => {
      if (coursePartners.includes(partnerAccess.partner.name)) {
        setIncorrectAccess(false);
      }
    });
  }, [partnerAccesses, story.content.course.content.included_for_partners]);

  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
  };

  const containerStyle = {
    backgroundColor: 'secondary.light',
    textAlign: 'center',
    ...rowStyle,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as const;

  return (
    <Box>
      <Head>
        <title>{story.content.name}</title>
      </Head>
      {incorrectAccess ? (
        <Container sx={containerStyle}></Container>
      ) : (
        <Box>
          <Header
            title={headerProps.title}
            introduction={headerProps.introduction}
            imageSrc={headerProps.imageSrc}
            imageAlt={headerProps.imageAlt}
          />
          <Container sx={containerStyle}></Container>
        </Box>
      )}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  let slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;
  let sessionSlug =
    params?.sessionSlug instanceof Array ? params.sessionSlug.join('/') : params?.sessionSlug;

  let sbParams = {
    resolve_relations: 'Session.course',
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/${slug}/${sessionSlug}/`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      messages: {
        ...require(`../../../messages/shared/${locale}.json`),
        ...require(`../../../messages/navigation/${locale}.json`),
        ...require(`../../../messages/courses/${locale}.json`),
      },
      locale,
    },

    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let { data } = await Storyblok.get('cdn/links/?starts_with=courses/');

  let paths: any = [];
  Object.keys(data.links).forEach((linkKey) => {
    if (data.links[linkKey].is_startpage || data.links[linkKey].is_folder) {
      return;
    }

    // get array for slug because of catch all
    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: splittedSlug[1], sessionSlug: splittedSlug[2] }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default Session;
