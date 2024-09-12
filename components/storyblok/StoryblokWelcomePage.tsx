import { Box, Button, Container } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import PartnerHeader from '../../components/layout/PartnerHeader';
import StoryblokPageSection, {
  StoryblokPageSectionProps,
} from '../../components/storyblok/StoryblokPageSection';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
} from '../../constants/events';
import { PartnerContent, getPartnerContent } from '../../constants/partners';
import { useAppDispatch, useTypedSelector } from '../../hooks/store';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import Link from '../common/Link';

const introContainerStyle = {
  backgroundColor: 'secondary.light',
  textAlign: 'center',
  '*': {
    marginX: 'auto !important',
  },
} as const;

const introTextStyle = {
  width: { xs: '100%', md: '100%' },

  'p, a, span': {
    fontSize: '1.25rem',
    fontFamily: 'Montserrat, sans-serif',
    lineHeight: 1.4,
  },
} as const;

export interface StoryblokWelcomePageProps {
  _uid: string;
  _editable: string;
  storySlug: string;
  title: string;
  introduction: ISbRichtext;
  header_image: { filename: string; alt: string };
  page_sections: StoryblokPageSectionProps[];
}

const StoryblokWelcomePage = (props: StoryblokWelcomePageProps) => {
  const { _uid, _editable, storySlug, title, introduction, header_image, page_sections } = props;

  const partnerContent = getPartnerContent(storySlug) as PartnerContent;

  const headerProps = {
    partnerLogoSrc: partnerContent.partnershipLogo || welcomeToBloom,
    partnerLogoAlt: partnerContent.partnershipLogoAlt || 'alt.welcomeToBloom',
    imageSrc: partnerContent.bloomGirlIllustration || illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  const [codeParam, setCodeParam] = useState<string>('');
  const router = useRouter();
  const dispatch: any = useAppDispatch();
  const t = useTranslations('Welcome');

  const userId = useTypedSelector((state) => state.user.id);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const entryPartnerAccessCode = useTypedSelector((state) => state.user.entryPartnerAccessCode);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  // Ensure partner access codes are stored in state and url query, to handle app refreshes and redirects
  useEffect(() => {
    const { code } = router.query;

    if (code) {
      // code in url query
      setCodeParam(code + '');
    } else if (
      entryPartnerReferral === partnerContent.name.toLowerCase() &&
      entryPartnerAccessCode
    ) {
      // Entry code in state, add to url query in case of refresh
      router.replace(
        {
          query: { ...router.query, code: entryPartnerAccessCode },
        },
        undefined,
        {
          shallow: true,
        },
      );
      setCodeParam(entryPartnerAccessCode);
    }
  }, [dispatch, router, entryPartnerAccessCode, entryPartnerReferral, partnerContent.name]);

  const logPromoEvent = () => {
    if (userId) {
      logEvent(generatePartnerPromoGoToCoursesEvent(partnerContent.name), eventUserData);
    } else {
      logEvent(generatePartnerPromoGetStartedEvent(partnerContent.name), eventUserData);
    }
  };

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        title,
        introduction,
        header_image,
        page_sections,
      })}
    >
      <Head>
        <title>{title}</title>
      </Head>
      <PartnerHeader
        partnerLogoSrc={headerProps.partnerLogoSrc}
        partnerLogoAlt={headerProps.partnerLogoAlt}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={introContainerStyle}>
        <Box sx={introTextStyle}>{render(introduction, RichTextOptions)}</Box>

        <Button
          sx={{ mt: 4, px: 6 }}
          variant="contained"
          component={Link}
          color="secondary"
          size="large"
          onClick={logPromoEvent}
          href={
            userId
              ? '/courses'
              : `/auth/register?partner=${partnerContent.name.toLocaleLowerCase()}${codeParam && '&code=' + codeParam}`
          }
        >
          {t(userId ? 'goToCourses' : 'getStarted')}
        </Button>
      </Container>
      {page_sections?.length > 0 &&
        page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} />
        ))}
    </Box>
  );
};

export default StoryblokWelcomePage;
