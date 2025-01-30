'use client';

import Header from '@/lib/components/layout/Header';
import { StoryblokTeamMemberCardProps } from '@/lib/components/storyblok/StoryblokTeamMemberCard';
import { MEET_THE_TEAM_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import Head from 'next/head';
import { useEffect } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import StoryblokPageSection, { StoryblokPageSectionProps } from './StoryblokPageSection';
import StoryblokTeamMembersCards from './StoryblokTeamMembersCards';

const coreContainerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const supportingContainerStyle = {
  backgroundColor: 'primary.light',
} as const;

export interface StoryblokMeetTheTeamPageProps {
  _uid: string;
  _editable: string;
  title: string;
  seo_description: string;
  description: string;
  header_image: { filename: string; alt: string };
  core_team_title: string;
  core_team_description: ISbRichtext;
  core_team_members: StoryblokTeamMemberCardProps[];
  supporting_team_title: string;
  supporting_team_description: ISbRichtext;
  supporting_team_members: StoryblokTeamMemberCardProps[];
  page_section_1: StoryblokPageSectionProps[];
  page_section_2: StoryblokPageSectionProps[];
  page_section_3: StoryblokPageSectionProps[];
}

const StoryblokMeetTheTeamPage = (props: StoryblokMeetTheTeamPageProps) => {
  const {
    _uid,
    _editable,
    title,
    seo_description,
    description,
    header_image,
    core_team_title,
    core_team_description,
    core_team_members,
    supporting_team_title,
    supporting_team_description,
    supporting_team_members,
    page_section_1,
    page_section_2,
    page_section_3,
  } = props;

  useEffect(() => {
    logEvent(MEET_THE_TEAM_VIEWED);
  }, []);

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        title,
        description,
        header_image,
        core_team_title,
        core_team_description,
        core_team_members,
        supporting_team_title,
        supporting_team_description,
        supporting_team_members,
        page_section_1,
        page_section_2,
        page_section_3,
      })}
    >
      <Head>
        <title>{`${title} • Bloom`}</title>
        <meta property="og:title" content={title} key="og-title" />
        {(seo_description || description) && (
          <>
            <meta name="description" content={seo_description || description} key="description" />
            <meta
              property="og:description"
              content={seo_description || description}
              key="og-description"
            />
          </>
        )}
      </Head>
      <Header
        title={title}
        introduction={description}
        imageSrc={header_image.filename}
        translatedImageAlt={header_image.alt}
      />
      {page_section_1?.length > 0 && <StoryblokPageSection {...page_section_1[0]} />}
      <Container sx={coreContainerStyle}>
        <Typography variant="h2" component="h2">
          {core_team_title}
        </Typography>
        {core_team_description &&
          // this was clearly expecting a string in the code but it was causing an error because an object was coming through from storyblok.
          // This is a patch to help with release but should be readdressed
          typeof core_team_description === 'string' && (
            <Typography maxWidth={650}>{core_team_description}</Typography>
          )}
        <StoryblokTeamMembersCards team_member_items={core_team_members} cards_expandable={false} />
      </Container>

      {page_section_2?.length > 0 && <StoryblokPageSection {...page_section_2[0]} />}

      <Container sx={supportingContainerStyle}>
        <Typography variant="h2" component="h2">
          {supporting_team_title}
        </Typography>
        {supporting_team_description && (
          <Box maxWidth={650}>{render(supporting_team_description, RichTextOptions)}</Box>
        )}
        <StoryblokTeamMembersCards
          team_member_items={supporting_team_members}
          cards_expandable={true}
        />
      </Container>

      {page_section_3?.length > 0 && <StoryblokPageSection {...page_section_3[0]} />}
    </Box>
  );
};

export default StoryblokMeetTheTeamPage;
