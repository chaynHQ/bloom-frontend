import { Box, Container } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import ProfileDetails from '../../components/account/ProfileDetails';
import Link from '../../components/common/Link';
import { rowStyle } from '../../styles/common';
import Header from '../../components/layout/Header';
import illustrationPerson5Yellow from '../../public/notes_from_bloom_icon.svg';
import EmailPref from '../../components/account/EmailPref';

const containerStyle = {
  ...rowStyle,
  backgroundColor: 'secondary.light',
} as const;

const AccountSettings: NextPage = () => {
  const t = useTranslations('Account.accountSettings');

  const headerProps = {
    title: t('title'),
    introduction: t.rich('description', {
      link: (content) => (
        <Link href={process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || '#'}>{content}</Link>
      ),
    }),
    imageSrc: illustrationPerson5Yellow,
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
        <ProfileDetails />
        <EmailPref />
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
