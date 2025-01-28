import AccountActionsCard from '@/components/cards/AccountActionsCard';
import EmailRemindersSettingsCard from '@/components/cards/EmailRemindersSettingsCard';
import EmailSettingsCard from '@/components/cards/EmailSettingsCard';
import ProfileSettingsCard from '@/components/cards/ProfileSettingsCard';
import Header from '@/components/layout/Header';
import { useTypedSelector } from '@/hooks/store';
import phoneIllustration from '@/public/phone.svg';
import { columnStyle, rowStyle } from '@/styles/common';
import { Box, Container } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';

const rowContainerStyle = {
  ...rowStyle,
  gap: { xs: 2, md: 6 },
  flexWrap: { xs: 'wrap', md: 'nowrap' },
  maxWidth: '100%',
  paddingTop: { xs: 3, md: 5 },
} as const;

const columnContainerStyle = {
  ...columnStyle,
  width: '100%',
  gap: { xs: 2, md: 6 },
  marginBottom: 'auto',
} as const;

const AccountSettings: NextPage = () => {
  const t = useTranslations('Account.accountSettings');
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const headerProps = {
    title: t('title'),
    introduction: t.rich('description'),
    imageSrc: phoneIllustration,
    translatedImageAlt: t('imageAlt'),
  };

  return (
    <Box bgcolor={'secondary.light'}>
      <Head>
        <title>{`${t('title')} • Bloom`}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
      />
      <Container sx={rowContainerStyle}>
        <Box sx={columnContainerStyle}>
          <ProfileSettingsCard />
          <EmailSettingsCard />
        </Box>
        <Box sx={columnContainerStyle}>
          <AccountActionsCard />
          <EmailRemindersSettingsCard />
        </Box>
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
