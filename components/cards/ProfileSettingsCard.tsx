'use client';

import { Card, CardContent, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { FEEDBACK_FORM_URL } from '../../constants/common';
import ProfileSettingsForm from '../forms/ProfileSettingsForm';

const cardStyle = {
  width: { xs: '100%', md: 'auto' },
  flex: { xs: 'auto', md: 1 },
} as const;

const ProfileSettingsCard = () => {
  const t = useTranslations('Account.accountSettings');
  const tS = useTranslations('Shared');

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('profileSettings.title')}
        </Typography>
        <Typography>
          {t.rich('profileSettings.description', {
            link: (children) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {children}
              </Link>
            ),
          })}
        </Typography>
        <ProfileSettingsForm />
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsCard;
