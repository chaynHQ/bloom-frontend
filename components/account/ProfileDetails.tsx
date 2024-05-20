import { Typography, Card, CardContent, } from '@mui/material';
import ProfileDetailsForm from '../forms/ProfileDetailsForm';
import { useTranslations } from 'next-intl';

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const ProfileDetails = () => {
  const t = useTranslations('Account.accountSettings');

  return (
    <Card sx={formCardStyle}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('profile.title')}
        </Typography>
        <Typography fontSize="1rem !important">
          {t('profile.desc')}
        </Typography>
        <ProfileDetailsForm />
      </CardContent>
    </Card>
  )
}

export default ProfileDetails
