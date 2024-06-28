import { Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import EmailSettingsForm from '../forms/EmailSettingsForm';

const cardStyle = {
  width: { xs: '100%', md: 'auto' },
  flex: { xs: 'auto', md: 1 },
} as const;

const EmailSettingsCard = () => {
  const t = useTranslations('Account.accountSettings.emailSettings');

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('title')}
        </Typography>
        <Typography>{t('description')}</Typography>
        <EmailSettingsForm />
      </CardContent>
    </Card>
  );
};

export default EmailSettingsCard;
