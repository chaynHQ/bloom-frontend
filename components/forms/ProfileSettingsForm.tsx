'use client';

import { CheckCircleOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Link, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ErrorDisplay } from '../../constants/common';
import { UPDATE_USER_ALREADY_EXISTS } from '../../constants/errors';
import { useTypedSelector } from '../../hooks/store';
import { useUpdateUserMutation } from '../../lib/api';
import { logout } from '../../lib/auth';
import ConfirmDialog from './ConfirmDialog';

const containerStyle = {
  marginY: 3,
} as const;

const ProfileSettingsForm = () => {
  const name = useTypedSelector((state) => state.user.name);
  const email = useTypedSelector((state) => state.user.email);
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [error, setError] = useState<ErrorDisplay>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmationRequired, setIsConfirmationRequired] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string | null>(email);
  const [nameInput, setNameInput] = useState<string | null>(name);

  const diffExists = name !== nameInput || email !== emailInput;

  const tS = useTranslations('Shared');
  const t = useTranslations('Account.accountSettings');

  const generatePayload = (newEmail?: string | null, newName?: string | null) => ({
    ...(typeof newEmail === 'string' && email !== newEmail ? { email: newEmail } : {}),
    ...(typeof newName === 'string' && name !== newName ? { name: newName } : {}),
  });

  const callUpdateUser = async (payload: { email?: string; name?: string }) => {
    const response = await updateUser(payload);

    if ((response as any)?.data?.id) {
      setError(undefined);
      setIsSuccess(true);
      if (payload.email) {
        await logout();
      }
    } else if ((response as any)?.error?.data?.message === UPDATE_USER_ALREADY_EXISTS) {
      setError(t('profileSettings.emailAlreadyInUseError'));
    } else {
      setError(
        t.rich('updateError', {
          link: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
        }),
      );
    }
    setIsConfirmationRequired(false);
  };

  const onSubmit = async (ev?: React.FormEvent<HTMLFormElement>) => {
    if (ev) ev.preventDefault();

    const payload = generatePayload(emailInput, nameInput);

    if (payload.email) {
      setIsConfirmationRequired(true);
    } else {
      callUpdateUser(payload);
    }
  };

  const confirmHandler = (confirmed: boolean) => {
    if (confirmed) {
      setIsConfirmationRequired(false);
      callUpdateUser(generatePayload(emailInput, nameInput));
    } else {
      setIsConfirmationRequired(false);
    }
  };

  return (
    <Box sx={containerStyle}>
      <form onSubmit={onSubmit}>
        <TextField
          id="name"
          name="name"
          value={nameInput}
          label={t('profileSettings.nameLabel')}
          variant="standard"
          fullWidth
          required
          onChange={(ev) => {
            setNameInput(ev.target.value);
            setIsSuccess(false);
          }}
        />
        <TextField
          id="email"
          name="email"
          defaultValue={email}
          label={t('profileSettings.emailLabel')}
          variant="standard"
          type="email"
          fullWidth
          required
          onChange={(ev) => {
            setEmailInput(ev.target.value);
            setIsSuccess(false);
          }}
        />
        {error && <Typography color="error.main">{error}</Typography>}
        <LoadingButton
          id="profile-settings-submit"
          sx={{ mt: 1 }}
          variant="contained"
          fullWidth
          loading={isLoading}
          color="secondary"
          type="submit"
          endIcon={isSuccess ? <CheckCircleOutlined /> : undefined}
          disabled={isSuccess || !diffExists}
        >
          {t('profileSettings.submitLabel')}
        </LoadingButton>
        <ConfirmDialog
          title={t('profileSettings.confirmDialogTitle')}
          cancelLabel={t('profileSettings.confirmDialogCancel')}
          submitLabel={t('profileSettings.submitLabel')}
          isOpen={confirmationRequired}
          onConfirm={confirmHandler}
        />
      </form>
    </Box>
  );
};

export default ProfileSettingsForm;
