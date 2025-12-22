'use client';

import Header from '@/components/layout/Header';
import { StoryblokTeamMemberCardProps } from '@/components/storyblok/StoryblokTeamMemberCard';
import { MEET_THE_TEAM_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import theme from '@/styles/theme';
import { Box, Container, Typography, useMediaQuery } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import NotesFromBloomPromo from '../banner/NotesFromBloomPromo';
import StoryblokPageSection, { StoryblokPageSectionProps } from './StoryblokPageSection';
import StoryblokTeamMembersCards from './StoryblokTeamMembersCards';

const coreContainerStyle = {
  pt: '0 !important',
  backgroundColor: 'secondary.light',
} as const;

const somaticsContainerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const supportingContainerStyle = {
  backgroundColor: 'primary.light',
} as const;

export interface StoryblokMeetTheTeamPageProps {
  _uid: string;
  _editable: string;
  title: string;
  description: string;
  header_image: { filename: string; alt: string };
  core_team_title: string;
  core_team_description: StoryblokRichtext;
  core_team_members: StoryblokTeamMemberCardProps[];
  somatics_team_title: string;
  somatics_team_description: StoryblokRichtext;
  somatics_team_members: StoryblokTeamMemberCardProps[];
  supporting_team_title: string;
  supporting_team_description: StoryblokRichtext;
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
    description,
    header_image,
    core_team_title,
    core_team_description,
    core_team_members,
    somatics_team_title,
    somatics_team_description,
    somatics_team_members,
    supporting_team_title,
    supporting_team_description,
    supporting_team_members,
    page_section_1,
    page_section_2,
    page_section_3,
  } = props;

  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const isLoggedIn = !authStateLoading && !!userId;
  const searchParams = useSearchParams();
  const sectionQueryParam = searchParams.get('section');
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const headerOffset = isSmallScreen ? 48 : 136;

  const coreSectionRef = useRef<HTMLDivElement>(null);
  const somaticsSectionRef = useRef<HTMLDivElement>(null);
  const supportingSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEvent(MEET_THE_TEAM_VIEWED);
  }, []);

  useEffect(() => {
    const sectionMap = {
      core: coreSectionRef,
      somatics: somaticsSectionRef,
      supporting: supportingSectionRef,
    };

    const targetRef = sectionQueryParam
      ? sectionMap[sectionQueryParam as keyof typeof sectionMap]
      : null;

    if (targetRef?.current) {
      const scrollToY =
        targetRef.current.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: scrollToY, behavior: 'smooth' });
    }
  });

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
        somatics_team_title,
        somatics_team_description,
        somatics_team_members,
        supporting_team_title,
        supporting_team_description,
        supporting_team_members,
        page_section_1,
        page_section_2,
        page_section_3,
      })}
    >
      <Header
        title={title}
        introduction={description}
        imageSrc={header_image.filename}
        translatedImageAlt={header_image.alt}
      />
      {page_section_1?.length > 0 && (
        <StoryblokPageSection {...page_section_1[0]} isLoggedIn={isLoggedIn} />
      )}

      {/* CHANGED: Apply the new refs */}
      <Container ref={coreSectionRef} sx={coreContainerStyle}>
        <Typography variant="h2" component="h2">
          {core_team_title}
        </Typography>
        {core_team_description && typeof core_team_description === 'string' && (
          <Typography maxWidth={650}>{core_team_description}</Typography>
        )}
        <StoryblokTeamMembersCards team_member_items={core_team_members} cards_expandable={false} />
      </Container>

      {page_section_2?.length > 0 && (
        <StoryblokPageSection {...page_section_2[0]} isLoggedIn={isLoggedIn} />
      )}

      {/* CHANGED: Apply the new refs */}
      <Container ref={somaticsSectionRef} sx={somaticsContainerStyle}>
        <Typography variant="h2" component="h2">
          {somatics_team_title}
        </Typography>
        {somatics_team_description && (
          <Box maxWidth={650}>{render(somatics_team_description, RichTextOptions)}</Box>
        )}
        <StoryblokTeamMembersCards
          team_member_items={somatics_team_members}
          cards_expandable={true}
        />
      </Container>

      {/* CHANGED: Apply the new refs */}
      <Container ref={supportingSectionRef} sx={supportingContainerStyle}>
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

      {page_section_3?.length > 0 && (
        <StoryblokPageSection {...page_section_3[0]} isLoggedIn={isLoggedIn} />
      )}
      <NotesFromBloomPromo />
    </Box>
  );
};

export default StoryblokMeetTheTeamPage;
