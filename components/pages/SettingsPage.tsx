'use client';

import AccountActionsCard from '@/components/cards/AccountActionsCard';
import EmailRemindersSettingsCard from '@/components/cards/EmailRemindersSettingsCard';
import EmailSettingsCard from '@/components/cards/EmailSettingsCard';
import ProfileSettingsCard from '@/components/cards/ProfileSettingsCard';
import Header from '@/components/layout/Header';
import phoneIllustration from '@/public/phone.svg';
import { columnStyle, rowStyle } from '@/styles/common';
import { Box, Container } from '@mui/material';
import { useTranslations } from 'next-intl';

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

export default function SettingsPage() {
  const t = useTranslations('Account.accountSettings');

  const headerProps = {
    title: t('title'),
    introduction: t.rich('description'),
    imageSrc: phoneIllustration,
    translatedImageAlt: t('imageAlt'),
  };

  return (
    <Box bgcolor={'secondary.light'}>
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
}
