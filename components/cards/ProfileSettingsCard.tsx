'use client';

import ProfileSettingsForm from '@/components/forms/ProfileSettingsForm';
import { Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const cardStyle = {
  width: { xs: '100%', md: 'auto' },
  flex: { xs: 'auto', md: 1 },
} as const;

const ProfileSettingsCard = () => {
  const t = useTranslations('Account.accountSettings');

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('profileSettings.title')}
        </Typography>
        <Typography>{t('profileSettings.description')}</Typography>
        <ProfileSettingsForm />
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsCard;
