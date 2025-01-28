import NoDataAvailable from '@/components/common/NoDataAvailable';
import HomeHeader from '@/components/layout/HomeHeader';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import { PROMO_GET_STARTED_CLICKED } from '@/constants/events';
import { useTypedSelector } from '@/hooks/store';
import { Link as i18nLink } from '@/i18n/routing';
import { getStoryblokPageProps } from '@/utils/getStoryblokPageProps';
import logEvent from '@/utils/logEvent';
import { Box, Button } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
interface Props {
  story: ISbStoryData | null;
  preview: boolean;
}

const Index: NextPage<Props> = ({ story }) => {
  const t = useTranslations('Welcome');

  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const [registerPath, setRegisterPath] = useState('/auth/register');

  useEffect(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    if (referralPartner) {
      setRegisterPath(`/auth/register?partner=${referralPartner}`);
    }
  }, []);

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <Box>
      <Head>
        <title>{`${story.content.title} • Bloom`}</title>
        <meta property="og:title" content={story.content.title} key="og-title" />
        {story.content.seo_description && (
          <>
            <meta name="description" content={story.content.seo_description} key="description" />
            <meta
              property="og:description"
              content={story.content.seo_description}
              key="og-description"
            />
          </>
        )}
      </Head>
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
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} />
        ))}
    </Box>
  );
};

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps('home', locale);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/welcome/${locale}.json`),
        ...require(`../messages/courses/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Index;
