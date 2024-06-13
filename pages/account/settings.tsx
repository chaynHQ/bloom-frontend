import { Box, Container } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import EmailSettingsCard from '../../components/account/EmailSettingsCard';
import ProfileSettingsCard from '../../components/account/ProfileSettingsCard';
import Header from '../../components/layout/Header';
import phoneIllustration from '../../public/phone.svg';
import { rowStyle } from '../../styles/common';

const containerStyle = {
  ...rowStyle,
  gap: { xs: 2, md: 6 },
  flexWrap: { xs: 'wrap', md: 'no-wrap' },
  backgroundColor: 'secondary.light',
  paddingTop: { xs: 3, md: 5 },
} as const;

const AccountSettings: NextPage = () => {
  const t = useTranslations('Account.accountSettings');

  const headerProps = {
    title: t('title'),
    introduction: t.rich('description'),
    imageSrc: phoneIllustration,
    translatedImageAlt: t('imageAlt'),
  };

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
      />
      <Container sx={containerStyle}>
        <ProfileSettingsCard />
        <EmailSettingsCard />
      </Container>
    </Box>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/account/${locale}.json`),
      },
    },
  };
}

export default AccountSettings;
