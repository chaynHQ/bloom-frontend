'use client';

import {
  api,
  useGetFrontContactBackfillQuery,
  useStartFrontContactBackfillMutation,
} from '@/lib/api';
import { getDateLocale } from '@/lib/utils/dates';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { format, Locale } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

// While a backfill is running the backend updates its progress after every contact, so poll
// often enough that the bar moves; when nothing is running there's nothing to watch.
const POLL_INTERVAL_MS = 3000;

const formatDate = (value: string | undefined, dateLocale: Locale) =>
  value ? format(new Date(value), 'd MMM yyyy', { locale: dateLocale }) : '';

// Superadmin tool to repair Front contacts whose datetime custom fields were written as ISO
// strings before they were serialised as epoch seconds — those show as 01/01/1970 in Front.
// Re-sends every custom field from the database, so it also refreshes anything else that has
// drifted. Safe to re-run: the same values are simply written again.
const SyncFrontContactsForm = () => {
  const t = useTranslations('Admin.syncFrontContacts');
  const dateLocale = getDateLocale(useLocale());
  const rollbar = useRollbar();

  // Reads the already-cached status to decide whether to poll, so the interval can depend on the
  // response without a state-setting effect. Follows the server's view rather than only this
  // tab's click: a run started elsewhere is picked up, and polling stops once it finishes.
  const { data: cached } = api.endpoints.getFrontContactBackfill.useQueryState();
  const {
    data,
    isLoading: statusLoading,
    refetch,
  } = useGetFrontContactBackfillQuery(undefined, {
    pollingInterval: cached?.status === 'running' ? POLL_INTERVAL_MS : 0,
  });
  const [startBackfill] = useStartFrontContactBackfillMutation();

  const [starting, setStarting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const progress = data?.progress;
  const running = data?.status === 'running';
  const coverage = data?.coverage;

  const percent =
    progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setStarting(true);

    const response = await startBackfill();

    if ('error' in response && response.error) {
      const errorMessage = getErrorMessage(response.error);
      rollbar.error('Start Front contact backfill error: ' + errorMessage);
      setFormError(t('error') + errorMessage);
      setStarting(false);
      return;
    }

    // Nothing would refetch on its own while the cached status is still 'idle' — this first
    // refetch is what flips it to 'running' and starts the polling.
    refetch();
    setStarting(false);
  };

  return (
    <form autoComplete="off" onSubmit={submitHandler}>
      <Typography sx={{ mb: 2 }}>{t('description')}</Typography>

      <Typography sx={{ mb: 2 }}>
        {statusLoading
          ? t('counting')
          : t('coverage', {
              count: coverage?.total ?? 0,
              since: formatDate(coverage?.since, dateLocale),
            })}
      </Typography>

      {progress && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1 }}>
            {running
              ? t('running', { processed: progress.processed, total: progress.total })
              : t(progress.status === 'failed' ? 'failed' : 'complete', {
                  processed: progress.processed,
                  total: progress.total,
                })}
          </Typography>
          <LinearProgress
            variant={progress.total > 0 ? 'determinate' : 'indeterminate'}
            value={percent}
            color={progress.status === 'failed' ? 'error' : 'secondary'}
            sx={{ mb: 1, height: 8, borderRadius: 1 }}
          />
          <Typography variant="body2">
            {t('breakdown', {
              updated: progress.updated,
              notFound: progress.notFound,
              skipped: progress.skipped,
              failed: progress.failed,
            })}
          </Typography>
          {!!data?.errors?.length && (
            <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
              {t('lastError', { error: data.errors[data.errors.length - 1].error })}
            </Typography>
          )}
        </Box>
      )}

      {formError && <Typography sx={{ color: 'error.main', mb: 1 }}>{formError}</Typography>}

      <Box>
        <LoadingButton
          variant="contained"
          color="secondary"
          type="submit"
          loading={starting || running}
          disabled={running || !coverage?.total}
          sx={{ mt: 1 }}
        >
          {running ? t('submitRunning') : t('submit')}
        </LoadingButton>
      </Box>
    </form>
  );
};

export default SyncFrontContactsForm;
