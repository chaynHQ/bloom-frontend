'use client';

import { useDeleteCypressUsersMutation, useLazyGetCypressUsersCountQuery } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// Superadmin tool to hard delete automated-test (Cypress) accounts that have leaked into an
// environment. Unlike the standard user delete (which anonymises and keeps the row), this fully
// removes the DB rows (cascading to related tables) plus the Firebase, Front and Mailchimp records.
const DeleteCypressUsersForm = () => {
  const t = useTranslations('Admin.deleteCypressUsers');
  const rollbar = useRollbar();

  const [getCount, { data: countData, isFetching: countLoading }] =
    useLazyGetCypressUsersCountQuery();
  const [deleteCypressUsers] = useDeleteCypressUsersMutation();

  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [deletedCount, setDeletedCount] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    getCount();
  }, [getCount]);

  const count = countData?.count ?? 0;

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setDeletedCount(null);
    setLoading(true);

    const response = await deleteCypressUsers();

    if ('error' in response && response.error) {
      const errorMessage = getErrorMessage(response.error);
      rollbar.error('Delete cypress users error: ' + errorMessage);
      setFormError(t('error') + errorMessage);
      setLoading(false);
      return;
    }

    setDeletedCount(response.data?.length ?? 0);
    setConfirmed(false);
    setLoading(false);
    // Refresh the remaining count so the superadmin can confirm the environment is clean.
    getCount();
  };

  return (
    <form autoComplete="off" onSubmit={submitHandler}>
      <Typography sx={{ mb: 2 }}>{t('description')}</Typography>
      <Typography sx={{ mb: 2, fontWeight: 'bold', color: 'error.main' }}>{t('warning')}</Typography>

      {deletedCount !== null && (
        <Typography sx={{ mb: 2, color: 'success.main' }}>
          {t('success', { count: deletedCount })}
        </Typography>
      )}

      <Typography sx={{ mb: 1 }}>
        {countLoading ? t('counting') : t('count', { count })}
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
        }
        label={t('confirmLabel')}
      />

      {formError && <Typography sx={{ color: 'error.main', mb: 1 }}>{formError}</Typography>}

      <Box>
        <LoadingButton
          variant="contained"
          color="secondary"
          type="submit"
          loading={loading}
          disabled={!confirmed || count === 0}
          sx={{ mt: 1 }}
        >
          {t('submit')}
        </LoadingButton>
      </Box>
    </form>
  );
};

export default DeleteCypressUsersForm;
