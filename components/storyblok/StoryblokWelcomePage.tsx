'use client';

import PartnerHeader from '@/components/layout/PartnerHeader';
import { StoryblokPageSectionProps } from '@/components/storyblok/StoryblokPageSection';
import { Link as i18nLink, usePathname, useRouter } from '@/i18n/routing';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
} from '@/lib/constants/events';
import { getPartnerContent, PartnerContent } from '@/lib/constants/partners';
import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import useReferralPartner from '@/lib/hooks/useReferralPartner';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '@/public/welcome_to_bloom.svg';
import { Box, Button, Container } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import DynamicComponent from './DynamicComponent';

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
  introduction: StoryblokRichtext;
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

  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch: any = useAppDispatch();
  const t = useTranslations('Welcome');
  useReferralPartner();

  const userId = useTypedSelector((state) => state.user.id);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const entryPartnerAccessCode = useTypedSelector((state) => state.user.entryPartnerAccessCode);

  const code = searchParams.get('code');
  const partner = searchParams.get('partner');

  // Derive codeParam from URL or entry state
  const codeParam = useMemo(() => {
    if (code) return code + '';
    if (entryPartnerReferral === partnerContent.name.toLowerCase() && entryPartnerAccessCode) {
      return entryPartnerAccessCode;
    }
    return '';
  }, [code, entryPartnerReferral, partnerContent.name, entryPartnerAccessCode]);

  // Handle URL update for entry code (navigation side effect)
  const hasUpdatedUrl = useRef(false);

  useEffect(() => {
    if (
      !code &&
      entryPartnerReferral === partnerContent.name.toLowerCase() &&
      entryPartnerAccessCode &&
      !hasUpdatedUrl.current
    ) {
      hasUpdatedUrl.current = true;
      // Entry code in state, add to url query in case of refresh
      router.push({
        pathname,
        query: { code: entryPartnerAccessCode, partner },
      });
    }
  }, [
    router,
    pathname,
    partner,
    code,
    entryPartnerReferral,
    partnerContent.name,
    entryPartnerAccessCode,
  ]);

  const logPromoEvent = () => {
    if (userId) {
      logEvent(generatePartnerPromoGoToCoursesEvent(partnerContent.name));
    } else {
      logEvent(generatePartnerPromoGetStartedEvent(partnerContent.name));
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
          color="secondary"
          size="large"
          onClick={logPromoEvent}
          component={i18nLink}
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
          <DynamicComponent key={`page_section_${index}`} blok={section} />
        ))}
    </Box>
  );
};

export default StoryblokWelcomePage;
