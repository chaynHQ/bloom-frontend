import { Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const cardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
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
      </CardContent>
    </Card>
  );
};

export default EmailSettingsCard;
