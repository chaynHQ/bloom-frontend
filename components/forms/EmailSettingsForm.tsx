import { useTranslations } from 'next-intl';
import { useTypedSelector } from '../../hooks/store';

const containerStyle = {
  marginY: 3,
} as const;

import { CheckCircleOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Checkbox, FormControl, FormControlLabel, Typography } from '@mui/material';
import Link from 'next/link';
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
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const t = useTranslations('Account.accountSettings.emailSettings');
  const tS = useTranslations('Shared');

  const contactPermission = useTypedSelector((state) => state.user.contactPermission);
  const serviceEmailsPermission = useTypedSelector((state) => state.user.serviceEmailsPermission);

  const onSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(ev.currentTarget);
      ev.preventDefault();

      const contactPermission = formData.get('contactPermission') === 'on';
      const serviceEmailsPermission = formData.get('serviceEmailsPermission') === 'on';
      const payload = {
        contactPermission,
        serviceEmailsPermission,
      };

      const response = await updateUser(payload);

      if ((response as any).data.id) {
        setIsSuccess(true);
      } else {
        setError(
          t.rich('updateError', {
            link: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );
      }
    },
    [updateUser, t, tS],
  );

  return (
    <form onSubmit={onSubmit}>
      <FormControl sx={formControlStyle}>
        <FormControlLabel
          label={t('checkbox.serviceEmailsPermissionLabel')}
          control={
            <Checkbox
              name="serviceEmailsPermission"
              aria-label={t('checkbox.serviceEmailsPermissionLabel')}
              defaultChecked={serviceEmailsPermission}
            />
          }
          onInput={() => setIsSuccess(false)}
        />
        <FormControlLabel
          label={t('checkbox.contactPermissionLabel')}
          control={
            <Checkbox
              name="contactPermission"
              aria-label={t('checkbox.contactPermissionLabel')}
              defaultChecked={contactPermission}
            />
          }
          onInput={() => setIsSuccess(false)}
        />
        {error && <Typography color="error.main">{error}</Typography>}
      </FormControl>
      <LoadingButton
        sx={{ mt: 1 }}
        variant="contained"
        fullWidth
        loading={isLoading}
        color="secondary"
        type="submit"
        endIcon={isSuccess ? <CheckCircleOutlined /> : undefined}
        disabled={isSuccess}
      >
        {t('button.submit')}
      </LoadingButton>
    </form>
  );
};

export default EmailSettingsForm;
