'use client';

import { useUpdateUserMutation } from '@/lib/api';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { useTypedSelector } from '@/lib/hooks/store';
import { CheckCircleOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Checkbox, FormControl, FormControlLabel, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

const formControlStyle = {
  marginY: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const;

const EmailSettingsForm = () => {
  const t = useTranslations('Account.accountSettings.emailSettings');
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [error, setError] = useState<ErrorDisplay>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const contactPermission = useTypedSelector((state) => state.user.contactPermission);
  const serviceEmailsPermission = useTypedSelector((state) => state.user.serviceEmailsPermission);

  const onSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(ev.currentTarget);
      ev.preventDefault();

      const contactPermissionValue = formData.get('contactPermission') === 'on';
      const serviceEmailsPermissionValue = formData.get('serviceEmailsPermission') === 'on';
      const payload = {
        contactPermission: contactPermissionValue,
        serviceEmailsPermission: serviceEmailsPermissionValue,
      };

      const response = await updateUser(payload);

      if ((response as any).data.id) {
        setIsSuccess(true);
      } else {
        setError(
          t.rich('updateError', {
            link: (children) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {children}
              </Link>
            ),
          }),
        );
      }
    },
    [updateUser, t],
  );

  return (
    <form onSubmit={onSubmit}>
      <FormControl sx={formControlStyle}>
        <FormControlLabel
          label={t('serviceEmailsPermissionLabel')}
          control={
            <Checkbox
              name="serviceEmailsPermission"
              aria-label={t('serviceEmailsPermissionLabel')}
              defaultChecked={serviceEmailsPermission}
            />
          }
          onInput={() => setIsSuccess(false)}
        />
        <FormControlLabel
          label={t('contactPermissionLabel')}
          control={
            <Checkbox
              name="contactPermission"
              aria-label={t('contactPermissionLabel')}
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
        {t('submitLabel')}
      </LoadingButton>
    </form>
  );
};

export default EmailSettingsForm;
