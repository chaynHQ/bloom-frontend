import { useTranslations } from 'next-intl';
import { useTypedSelector } from '../../hooks/store';

const containerStyle = {
  marginY: 3,
} as const;

import { LoadingButton } from '@mui/lab';
import { Checkbox, FormControl, FormControlLabel, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { useUpdateUserMutation } from '../../app/api';
import { ErrorDisplay } from '../../constants/common';

const formControlStyle = {
  marginY: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const;

const EmailSettingsForm = () => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [error, setError] = useState<ErrorDisplay>();

  const t = useTranslations('Account.accountSettings.emailSettings');

  const contactPermission = useTypedSelector((state) => state.user.contactPermission);
  const servicePermission = useTypedSelector((state) => state.user.serviceEmailsPermission);

  const onSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(ev.currentTarget);
      ev.preventDefault();

      const contactPermission = formData.get('contactPermission') === 'on';
      const serviceEmailsPermission = formData.get('servicePermission') === 'on';
      const payload = {
        contactPermission,
        serviceEmailsPermission,
      };

      try {
        await updateUser(payload);
      } catch (error) {
        setError(t.rich('updateError'));
      }
    },
    [updateUser, t],
  );

  return (
    <form onSubmit={onSubmit}>
      <FormControl sx={formControlStyle}>
        <FormControlLabel
          label={t('checkbox.emailOnChange')}
          control={
            <Checkbox
              name="contactPermission"
              aria-label={t('checkbox.emailOnChange')}
              defaultChecked={contactPermission}
            />
          }
        />
        <FormControlLabel
          label={t('checkbox.emailOnCourse')}
          control={
            <Checkbox
              name="servicePermission"
              aria-label={t('checkbox.emailOnCourse')}
              defaultChecked={servicePermission}
            />
          }
        />
        {error && (
          <Typography color="error.main" mb={'1rem !important'}>
            {error}
          </Typography>
        )}
      </FormControl>
      <LoadingButton
        sx={{ mt: 2, mr: 1.5 }}
        variant="contained"
        fullWidth
        loading={isLoading}
        color="secondary"
        type="submit"
      >
        {t('button.savePref')}
      </LoadingButton>
    </form>
  );
};

export default EmailSettingsForm;
