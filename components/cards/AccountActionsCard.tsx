'use client';

import { Box, Button, Card, CardContent, Link, Typography, lighten } from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorDisplay } from '../../constants/common';
import { useDeleteUserMutation } from '../../store/api';
import theme from '../../styles/theme';
import ConfirmDialog from '../forms/ConfirmDialog';

const cardStyle = {
  width: { xs: '100%', md: 'auto' },
  flex: { xs: 'auto', md: 1 },
} as const;

const AccountActionsCard = () => {
  const t = useTranslations('Account.accountSettings');
  const tS = useTranslations('Shared');
  const router = useRouter();
  const [deleteUser, { isLoading }] = useDeleteUserMutation();
  const [error, setError] = useState<ErrorDisplay>();

  const [resetPasswordConfirmationRequired, setResetPasswordConfirmationRequired] =
    useState<boolean>(false);
  const [deleteAccountConfirmationRequired, setDeleteAccountConfirmationRequired] =
    useState<boolean>(false);

  const passwordResetConfirmHandler = (confirmed: boolean) => {
    if (confirmed) {
      router.push('/auth/reset-password');
    } else {
      setResetPasswordConfirmationRequired(false);
    }
  };

  const deleteAccountConfirmHandler = async (confirmed: boolean) => {
    if (confirmed) {
      const response = await deleteUser({});

      if ((response as any)?.data?.id) {
        setError(undefined);
        router.push('/');
        const auth = getAuth();
        signOut(auth);
      } else {
        setError(
          t.rich('updateError', {
            link: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );
      }
      setDeleteAccountConfirmationRequired(false);
    } else {
      setDeleteAccountConfirmationRequired(false);
    }
  };

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h2" component="h2">
            {t('actions.title')}
          </Typography>
          <Typography>{t('actions.description')}</Typography>
          {error && <Typography color="error.main">{error}</Typography>}
        </Box>
        <Box display={['flex']} flexWrap="wrap" gap={2} rowGap={2}>
          <Button
            sx={{
              background: theme.palette.secondary.dark,
              '&:hover': { background: lighten(theme.palette.secondary.dark, 0.2) },
            }}
            variant="contained"
            onClick={() => {
              setResetPasswordConfirmationRequired(true);
            }}
          >
            {t('actions.button.resetPassword')}
          </Button>
          <Button
            id="delete-account-button"
            variant="outlined"
            sx={{
              color: theme.palette.primary.dark,
              '&:hover': {
                background: theme.palette.primary.dark,
                color: theme.palette.common.white,
              },
            }}
            onClick={() => {
              setDeleteAccountConfirmationRequired(true);
            }}
          >
            {t('actions.button.deleteAccount')}
          </Button>
        </Box>
        <ConfirmDialog
          title={t('actions.resetPasswordConfirmDialogTitle')}
          cancelLabel={t('actions.confirmDialogCancel')}
          submitLabel={t('actions.button.resetPassword')}
          isOpen={resetPasswordConfirmationRequired}
          onConfirm={passwordResetConfirmHandler}
        />
        <ConfirmDialog
          title={t('actions.deleteAccountConfirmDialogTitle')}
          text={t('actions.deleteAccountConfirmDialogDescription')}
          cancelLabel={t('actions.confirmDialogCancel')}
          submitLabel={t('actions.button.deleteAccount')}
          isOpen={deleteAccountConfirmationRequired}
          onConfirm={deleteAccountConfirmHandler}
        />
      </CardContent>
    </Card>
  );
};

export default AccountActionsCard;
