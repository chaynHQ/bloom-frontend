import { Card, CardContent, Typography, } from '@mui/material';
import { useTranslations } from 'next-intl';
import ProfileDetailsForm from '../forms/ProfileDetailsForm';

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const ProfileSettings = () => {
  const t = useTranslations('Account.accountSettings');

  return (
    <Card sx={formCardStyle}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('profile.title')}
        </Typography>
        <Typography fontSize="1rem !important">
          {t('profile.description')}
        </Typography>
        <ProfileDetailsForm />
      </CardContent>
    </Card>
  )
}

export default ProfileSettings
