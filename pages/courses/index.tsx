import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { RootState } from '../../app/store';
import Header from '../../components/Header';
import { useTypedSelector } from '../../hooks/store';
import illustrationTeaPeach from '../../public/illustration_tea_peach.png';
import { getEventUserData } from '../../utils/logEvent';
import Storyblok from '../../utils/storyblok';

interface Props {
  stories: StoryData[];
  preview: boolean;
  messages: any;
}

const CourseList: NextPage<Props> = ({ stories, preview, messages }) => {
  const [loadedCourses, setLoadedCourses] = useState<StoryData[]>([]);
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');

  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });

  useEffect(() => {
    if (!partnerAccesses) {
      const coursesWithAccess = stories.filter((course) =>
        course.content.included_for_partners.includes('Public'),
      );
      setLoadedCourses(coursesWithAccess);
    }

    let partners: Array<string> = [];

    partnerAccesses.map((partnerAccess) => {
      if (partnerAccess.partner.name) {
        partners.push(partnerAccess.partner.name);
      }
    });

    const coursesWithAccess = stories.filter((course) =>
      partners.some((partner) => course.content.included_for_partners.includes(partner)),
    );
    setLoadedCourses(coursesWithAccess);
  }, []);

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
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
        {loadedCourses.map((course) => {
          return <Typography key={course.content.name}>{course.content.name}</Typography>;
        })}
      </Container>
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  let sbParams = {
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
    starts_with: 'courses/',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  let { data } = await Storyblok.get('cdn/stories/', sbParams);

  return {
    props: {
      stories: data ? data.stories : null,
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

export default CourseList;
