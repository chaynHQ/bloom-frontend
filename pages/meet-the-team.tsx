import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { StoryData } from 'storyblok-js-client';
import { RootState } from '../app/store';
import TeamMemberCard from '../components/cards/TeamMemberCard';
import Header from '../components/layout/Header';
import Storyblok, { useStoryblok } from '../config/storyblok';
import { LANGUAGES } from '../constants/enums';
import { MEET_THE_TEAM_VIEWED } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import { columnStyle, rowStyle } from '../styles/common';
import logEvent, { getEventUserData } from '../utils/logEvent';

const coreContainerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const supportingContainerStyle = {
  backgroundColor: 'primary.light',
} as const;

const cardColumnStyle = {
  ...columnStyle,
  justifyContent: 'flex-start',
  width: { xs: '100%', sm: 'calc(50% - 1rem)' },
  gap: { xs: 0, sm: 2, md: 4 },
} as const;

const cardColumnRowStyle = {
  ...rowStyle,
  marginTop: { xs: 2, md: 5 },
} as const;

interface Props {
  story: StoryData;
  preview: boolean;
  messages: any;
  locale: LANGUAGES;
}

const MeetTheTeam: NextPage<Props> = ({ story, preview, messages, locale }) => {
  story = useStoryblok(story, preview, {}, locale);

  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
  };

  useEffect(() => {
    logEvent(MEET_THE_TEAM_VIEWED, {
      ...eventUserData,
    });
  }, []);

  return (
    <Box>
      <Head>
        <title>{headerProps.title}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
      />
      <Container sx={coreContainerStyle}>
        <Typography variant="h2" component="h2">
          {story.content.core_team_title}
        </Typography>
        {story.content.core_team_description && (
          <Typography maxWidth={650}>{story.content.core_team_description}</Typography>
        )}
        <Box sx={cardColumnRowStyle}>
          <Box sx={cardColumnStyle}>
            {story.content.core_team_members.map((teamMember: any, index: number) => {
              if (index % 2 === 1) return;
              return (
                <TeamMemberCard
                  key={`${teamMember.name}_team_member`}
                  teamMember={teamMember}
                  alwaysOpen={true}
                />
              );
            })}
          </Box>
          <Box sx={cardColumnStyle}>
            {story.content.core_team_members.map((teamMember: any, index: number) => {
              if (index % 2 === 0) return;
              return (
                <TeamMemberCard
                  key={`${teamMember.name}_team_member`}
                  teamMember={teamMember}
                  alwaysOpen={true}
                />
              );
            })}
          </Box>
        </Box>
      </Container>
      <Container sx={supportingContainerStyle}>
        <Typography variant="h2" component="h2">
          {story.content.supporting_team_title}
        </Typography>
        {story.content.supporting_team_description && (
          <Typography maxWidth={650}>{story.content.supporting_team_description}</Typography>
        )}
        <Box sx={cardColumnRowStyle}>
          <Box sx={cardColumnStyle}>
            {story.content.supporting_team_members.map((teamMember: any, index: number) => {
              if (index % 2 === 1) return;
              return (
                <TeamMemberCard key={`${teamMember.name}_team_member`} teamMember={teamMember} />
              );
            })}
          </Box>
          <Box sx={cardColumnStyle}>
            {story.content.supporting_team_members.map((teamMember: any, index: number) => {
              if (index % 2 === 0) return;
              return (
                <TeamMemberCard key={`${teamMember.name}_team_member`} teamMember={teamMember} />
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  let sbParams = {
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
  };

  let { data } = await Storyblok.get(`cdn/stories/meet-the-team`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/courses/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default MeetTheTeam;
