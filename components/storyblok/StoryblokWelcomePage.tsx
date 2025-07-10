'use client';

import PartnerHeader from '@/components/layout/PartnerHeader';
import StoryblokPageSection, {
  StoryblokPageSectionProps,
} from '@/components/storyblok/StoryblokPageSection';
import { Link as i18nLink, usePathname, useRouter } from '@/i18n/routing';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
} from '@/lib/constants/events';
import { PartnerContent, getPartnerContent } from '@/lib/constants/partners';
import { useAppDispatch, useTypedSelector } from '@/lib/hooks/store';
import useReferralPartner from '@/lib/hooks/useReferralPartner';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '@/public/welcome_to_bloom.svg';
import { Box, Button, Container } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

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
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch: any = useAppDispatch();
  const t = useTranslations('Welcome');
  useReferralPartner();

  const userId = useTypedSelector((state) => state.user.id);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const entryPartnerAccessCode = useTypedSelector((state) => state.user.entryPartnerAccessCode);

  // Ensure partner access codes are stored in state and url query, to handle app refreshes and redirects
  useEffect(() => {
    const code = searchParams.get('code');
    const partner = searchParams.get('partner');

    if (code) {
      // code in url query
      setCodeParam(code + '');
    } else if (
      entryPartnerReferral === partnerContent.name.toLowerCase() &&
      entryPartnerAccessCode
    ) {
      // Entry code in state, add to url query in case of refresh
      router.push({
        pathname,
        query: { code: entryPartnerAccessCode, partner },
      });
      setCodeParam(entryPartnerAccessCode);
    }
  }, [
    dispatch,
    router,
    locale,
    entryPartnerAccessCode,
    entryPartnerReferral,
    partnerContent.name,
    pathname,
    searchParams,
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
          <StoryblokPageSection key={`page_section_${index}`} {...section} isLoggedIn={!!userId} />
        ))}
    </Box>
  );
};

export default StoryblokWelcomePage;
