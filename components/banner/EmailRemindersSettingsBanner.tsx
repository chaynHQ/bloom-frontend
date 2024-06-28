import { Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import theme from '../../styles/theme';
import EmailRemindersSettingsForm from '../forms/EmailRemindersSettingsForm';

const containerStyle = {
  background: theme.palette.bloomGradient,
  textAlign: 'center',
  '.MuiFormGroup-root': {
    maxWidth: '25rem',
    margin: 'auto',
  },
} as const;

export const EmailRemindersSettingsBanner = () => {
  const t = useTranslations('Account.accountSettings.emailRemindersSettings');

  return (
    <Container sx={containerStyle}>
      <Typography variant="h3" mb={1.5}>
        {t('introduction')}
      </Typography>
      <Typography>{t('description')}</Typography>
      <EmailRemindersSettingsForm />
    </Container>
  );
};
