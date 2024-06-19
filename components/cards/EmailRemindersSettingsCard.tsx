import { Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import EmailRemindersSettingsForm from '../forms/EmailRemindersSettingsForm';

const cardStyle = {
  width: { xs: '100%', md: 'auto' },
  flex: { xs: 'auto', md: 1 },
} as const;

const EmailRemindersSettingsCard = () => {
  const t = useTranslations('Account.accountSettings.emailRemindersSettings');

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('title')}
        </Typography>
        <Typography mb={1.5}>{t('introduction')}</Typography>
        <Typography>{t('description')}</Typography>
        <EmailRemindersSettingsForm />
      </CardContent>
    </Card>
  );
};

export default EmailRemindersSettingsCard;
