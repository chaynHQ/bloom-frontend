import { Box, Button, Card, CardContent, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { useGetAutomaticAccessCodeFeatureForPartnerQuery } from '../../app/api';
import Link from '../../components/common/Link';
import WelcomeCodeForm from '../../components/forms/WelcomeCodeForm';
import PartnerHeader from '../../components/layout/PartnerHeader';
import StoryblokPageSection, {
  StoryblokPageSectionProps,
} from '../../components/storyblok/StoryblokPageSection';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
} from '../../constants/events';
import { PartnerContent, getPartnerContent } from '../../constants/partners';
import { useTypedSelector } from '../../hooks/store';
import illustrationBloomHeadYellow from '../../public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '../../public/welcome_to_bloom.svg';
import { rowStyle } from '../../styles/common';
import hasAutomaticAccessFeature from '../../utils/hasAutomaticAccessCodeFeature';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';

const introContainerStyle = {
  maxWidth: 600,
  width: { xs: '100%', md: '45%' },
  fontSize: '1.375rem',
  fontFamily: 'Montserrat, sans-serif',
  fontStyle: 'italic',
  lineHeight: 1.75,
  'p, a, span': {
    fontSize: '1.375rem',
    fontFamily: 'Montserrat, sans-serif',
    fontStyle: 'italic',
    lineHeight: 1.75,
  },
} as const;

const rowItem = {
  width: { xs: '100%', sm: '60%', md: '45%' },
  height: '100%',
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
      <Container sx={{ ...rowStyle, backgroundColor: 'primary.light' }}>
        <Box sx={introContainerStyle}>{render(introduction, RichTextOptions)}</Box>
        <CallToActionCard partnerName={partnerContent.name} />
      </Container>
      {page_sections?.length > 0 &&
        page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} />
        ))}
    </Box>
  );
};

const CallToActionCard = ({ partnerName }: { partnerName: string }) => {
  const router = useRouter();

  const userToken = useTypedSelector((state) => state.user.token);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const partners = useTypedSelector((state) => state.partners);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const [accessCodeRequired, setAccessCodeRequired] = useState<boolean>(true);
  const [codeParam, setCodeParam] = useState<string>('');

  const t = useTranslations('Welcome');

  useGetAutomaticAccessCodeFeatureForPartnerQuery(partnerName);
  useEffect(() => {
    const partnerData = partners.find((p) => p.name.toLowerCase() === partnerName.toLowerCase());
    if (partnerData) {
      setAccessCodeRequired(!hasAutomaticAccessFeature(partnerData));
    }
  }, [partners, partnerName]);

  useEffect(() => {
    const { code } = router.query;
    if (code) setCodeParam(code + '');
  }, [setCodeParam, router.query]);

  return (
    <Card sx={rowItem}>
      <CardContent>
        {userToken && (
          <>
            <Typography variant="h2" component="h2">
              {t('continueCourses')}
            </Typography>
            <Typography>{t('continueCoursesDescription')}</Typography>
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              fullWidth
              component={Link}
              color="secondary"
              onClick={() => {
                logEvent(generatePartnerPromoGoToCoursesEvent(partnerName), eventUserData);
              }}
              href="/courses"
            >
              {t('goToCourses')}
            </Button>
          </>
        )}
        {!userToken && accessCodeRequired && (
          <>
            <Typography variant="h2" component="h2">
              {t('getStarted')}
            </Typography>
            <Typography>{t.rich('accessIntroduction', { partnerName })}</Typography>
            <WelcomeCodeForm codeParam={codeParam} partnerParam={partnerName} />
          </>
        )}
        {!userToken && !accessCodeRequired && (
          <>
            <Typography variant="h2" component="h2">
              {t('getStarted')}
            </Typography>
            <Typography>{t.rich('publicIntroduction', { partnerName })}</Typography>
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              fullWidth
              component={Link}
              color="secondary"
              onClick={() => {
                logEvent(generatePartnerPromoGetStartedEvent(partnerName), eventUserData);
              }}
              href={`/auth/register?partner=${partnerName.toLocaleLowerCase()}`}
            >
              {t('getStarted')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryblokWelcomePage;
