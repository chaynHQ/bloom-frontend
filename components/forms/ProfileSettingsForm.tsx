import { Box, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useTypedSelector } from '../../hooks/store';

const containerStyle = {
  marginY: 3,
} as const;

const ProfileSettingsForm = () => {
  const name = useTypedSelector((state) => state.user.name);
  const email = useTypedSelector((state) => state.user.email);

  const t = useTranslations('Account.accountSettings.form');

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off">
        <TextField
          id="name"
          value={name}
          disabled
          label={t('nameLabel')}
          variant="standard"
          fullWidth
          required
        />
        <TextField
          id="email"
          value={email}
          disabled
          label={t('emailLabel')}
          variant="standard"
          type="email"
          fullWidth
          required
        />
      </form>
    </Box>
  );
};

export default ProfileSettingsForm;
