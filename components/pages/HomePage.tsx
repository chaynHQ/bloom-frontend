'use client';

import NoDataAvailable from '@/components/common/NoDataAvailable';
import HomeHeader from '@/components/layout/HomeHeader';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import { Link as i18nLink } from '@/i18n/routing';
import { PROMO_GET_STARTED_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { Box, Button } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import StoryblokNotesFromBloomPromo from '../storyblok/StoryblokNotesFromBloomPromo';

interface Props {
  story: ISbStoryData | undefined;
}

export default function HomePage({ story }: Props) {
  const t = useTranslations('Welcome');

  const userId = useTypedSelector((state) => state.user.id);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const [registerPath, setRegisterPath] = useState('/auth/register');

  useEffect(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    if (referralPartner) {
      setRegisterPath(`/auth/register?partner=${referralPartner}`);
    }
  }, [entryPartnerReferral]);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <Box>
      <HomeHeader
        title={story.content.title}
        imageSrc={story.content.header_image?.filename}
        imageAlt={story.content.header_image?.alt}
        introduction={story.content.introduction}
        translatedImageAlt={story.content.translatedImageAlt}
        cta={
          <Button
            id="primary-get-started-button"
            sx={{ mt: 3 }}
            variant="contained"
            color="secondary"
            onClick={() => {
              logEvent(PROMO_GET_STARTED_CLICKED);
            }}
            component={i18nLink}
            href={registerPath}
            size="large"
          >
            {t('getStarted')}
          </Button>
        }
      />
      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => {
          if (section.component === 'notes_from_bloom_promo') {
            return <StoryblokNotesFromBloomPromo key={`notes_from_bloom_promo_${index}`} />;
          }
          return (
            <StoryblokPageSection
              key={`page_section_${index}`}
              {...section}
              isLoggedIn={!!userId}
            />
          );
        })}
    </Box>
  );
}
