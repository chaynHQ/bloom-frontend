import { Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import ProfileSettingsForm from '../forms/ProfileSettingsForm';

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
          {t('profile.title')}
        </Typography>
        <Typography>{t('profile.description')}</Typography>
        <ProfileSettingsForm />
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsCard;
