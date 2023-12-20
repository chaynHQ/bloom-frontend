import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import TeamMemberCard from '../components/cards/TeamMemberCard';
import NoDataAvailable from '../components/common/NoDataAvailable';
import Header from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import { MEET_THE_TEAM_VIEWED } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import { columnStyle, rowStyle } from '../styles/common';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';
import logEvent, { getEventUserData } from '../utils/logEvent';
import { RichTextOptions } from '../utils/richText';

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
  story: ISbStoryData | null;
}

const MeetTheTeam: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  useEffect(() => {
    logEvent(MEET_THE_TEAM_VIEWED, eventUserData);
  });

  if (!story) {
    return <NoDataAvailable />;
  }

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
  };

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
      {story.content.page_section_1?.length > 0 && (
        <StoryblokPageSection
          content={story.content.page_section_1[0].content}
          alignment={story.content.page_section_1[0].alignment}
          color={story.content.page_section_1[0].color}
        />
      )}
      <Container sx={coreContainerStyle}>
        <Typography variant="h2" component="h2">
          {story.content.core_team_title}
        </Typography>
        {story.content.core_team_description &&
          // this was clearly expecting a string in the code but it was causing an error because an object was coming through from storyblok.
          // This is a patch to help with release but should be readdressed
          typeof story.content.core_team_description === 'string' && (
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

      {story.content.page_section_2?.length > 0 && (
        <StoryblokPageSection
          content={story.content.page_section_2[0].content}
          alignment={story.content.page_section_2[0].alignment}
          color={story.content.page_section_2[0].color}
        />
      )}

      <Container sx={supportingContainerStyle}>
        <Typography variant="h2" component="h2">
          {story.content.supporting_team_title}
        </Typography>
        {story.content.supporting_team_description && (
          <Box maxWidth={650}>
            {render(story.content.supporting_team_description, RichTextOptions)}
          </Box>
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

      {story.content.page_section_3?.length > 0 && (
        <StoryblokPageSection
          content={story.content.page_section_3[0].content}
          alignment={story.content.page_section_3[0].alignment}
          color={story.content.page_section_3[0].color}
        />
      )}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps('meet-the-team', locale, preview);

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

export default MeetTheTeam;
