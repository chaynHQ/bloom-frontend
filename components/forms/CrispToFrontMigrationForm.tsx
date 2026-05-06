'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import {
  MigrationError,
  MigrationOptions,
  useGetCrispMigrationStatusQuery,
  useRunCrispMigrationMutation,
} from '@/lib/api';
import {
  CRISP_MIGRATION_RUN_ERROR,
  CRISP_MIGRATION_RUN_REQUEST,
  CRISP_MIGRATION_RUN_SUCCESS,
} from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const defaultOptions: MigrationOptions = {
  dryRun: true,
  skipAttachments: false,
  skipNotes: false,
  continueOnError: true,
  startDate: '',
  specificEmail: '',
  specificSessionId: '',
  emailDomainFilter: '',
};

const statusColor = {
  idle: 'default',
  pending: 'warning',
  running: 'info',
  completed: 'success',
  failed: 'error',
} as const;

function ProgressRow({
  label,
  processed,
  total,
}: {
  label: string;
  processed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  return (
    <Box mb={1.5}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {processed} / {total}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} />
    </Box>
  );
}

const CrispToFrontMigrationForm = () => {
  const t = useTranslations('Admin.crispMigration');
  const rollbar = useRollbar();

  const [options, setOptions] = useState<MigrationOptions>(defaultOptions);
  const [submitted, setSubmitted] = useState(false);
  const [seenRunning, setSeenRunning] = useState(false);
  const [submittedDryRun, setSubmittedDryRun] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [runMigration, { isLoading: isMutating }] = useRunCrispMigrationMutation();

  const { data: status, refetch: refetchStatus } = useGetCrispMigrationStatusQuery(undefined, {
    pollingInterval: submitted ? 3000 : 0,
  });

  const serverStatus = status?.status ?? 'idle';
  const isActiveOnServer = serverStatus === 'running' || serverStatus === 'pending';
  const isDone = submitted && seenRunning && (serverStatus === 'completed' || serverStatus === 'failed');
  const errors: MigrationError[] = status?.errors ?? [];
  const progress = status?.progress;

  // Auto-show status panel when a migration is already running from another session
  if (!submitted && isActiveOnServer) {
    setSubmitted(true);
  }

  // Only mark done after we've observed the migration actually running.
  // This prevents a stale 'completed' cache from a prior run triggering isDone on resubmit.
  if (submitted && isActiveOnServer && !seenRunning) {
    setSeenRunning(true);
  }

  const submitMigration = async () => {
    setShowConfirm(false);
    setFormError(null);
    setSubmitted(true);
    setSeenRunning(false);
    setSubmittedDryRun(options.dryRun ?? true);

    const body: MigrationOptions = {
      dryRun: options.dryRun,
      skipAttachments: options.skipAttachments,
      skipNotes: options.skipNotes,
      continueOnError: options.continueOnError,
      ...(options.startDate ? { startDate: options.startDate } : {}),
      ...(options.specificEmail ? { specificEmail: options.specificEmail } : {}),
      ...(options.specificSessionId ? { specificSessionId: options.specificSessionId } : {}),
      ...(options.emailDomainFilter ? { emailDomainFilter: options.emailDomainFilter } : {}),
    };

    logEvent(CRISP_MIGRATION_RUN_REQUEST, { dryRun: body.dryRun });

    const result = await runMigration(body);

    if (result.error) {
      const msg =
        'status' in result.error
          ? ((result.error.data as { message?: string })?.message ?? String(result.error.status))
          : 'Unknown error';
      setFormError(t('runError') + msg);
      rollbar.error('Crisp migration failed to start: ' + msg);
      logEvent(CRISP_MIGRATION_RUN_ERROR, { error: msg });
      setSubmitted(false);
      return;
    }

    refetchStatus();
    logEvent(CRISP_MIGRATION_RUN_SUCCESS, { dryRun: body.dryRun });
  };

  const handleRunClick = () => {
    if (!options.dryRun) {
      setShowConfirm(true);
    } else {
      submitMigration();
    }
  };

  const reset = () => {
    setSubmitted(false);
    setSeenRunning(false);
    setFormError(null);
    setOptions(defaultOptions);
  };

  return (
    <Box>
      {!submitted && (
        <Box>
          {!options.dryRun && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('warning')}
            </Alert>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={!!options.dryRun}
                onChange={(e) => setOptions((o) => ({ ...o, dryRun: e.target.checked }))}
              />
            }
            label={
              <Typography>
                <strong>{t('options.dryRun')}</strong>
              </Typography>
            }
            sx={{ mb: 1, display: 'flex' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!options.skipAttachments}
                onChange={(e) => setOptions((o) => ({ ...o, skipAttachments: e.target.checked }))}
              />
            }
            label={t('options.skipAttachments')}
            sx={{ mb: 1, display: 'flex' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!options.skipNotes}
                onChange={(e) => setOptions((o) => ({ ...o, skipNotes: e.target.checked }))}
              />
            }
            label={t('options.skipNotes')}
            sx={{ mb: 1, display: 'flex' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!options.continueOnError}
                onChange={(e) => setOptions((o) => ({ ...o, continueOnError: e.target.checked }))}
              />
            }
            label={t('options.continueOnError')}
            sx={{ mb: 2, display: 'flex' }}
          />

          <SanitizedTextField
            id="startDate"
            label={t('options.startDate')}
            type="date"
            value={options.startDate ?? ''}
            onChange={(v) => setOptions((o) => ({ ...o, startDate: v }))}
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <SanitizedTextField
            id="specificEmail"
            label={t('options.specificEmail')}
            value={options.specificEmail ?? ''}
            onChange={(v) => setOptions((o) => ({ ...o, specificEmail: v }))}
            fullWidth
            variant="standard"
            sx={{ mb: 2 }}
            maxLength={255}
          />
          <SanitizedTextField
            id="specificSessionId"
            label={t('options.specificSessionId')}
            value={options.specificSessionId ?? ''}
            onChange={(v) => setOptions((o) => ({ ...o, specificSessionId: v }))}
            fullWidth
            variant="standard"
            sx={{ mb: 2 }}
            maxLength={36}
          />
          <SanitizedTextField
            id="emailDomainFilter"
            label={t('options.emailDomainFilter')}
            value={options.emailDomainFilter ?? ''}
            onChange={(v) => setOptions((o) => ({ ...o, emailDomainFilter: v }))}
            fullWidth
            variant="standard"
            sx={{ mb: 2 }}
            maxLength={255}
          />

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <LoadingButton
            variant="contained"
            color={options.dryRun ? 'secondary' : 'error'}
            loading={isMutating}
            onClick={handleRunClick}
            sx={{ mt: 1 }}
          >
            {options.dryRun ? t('submitDryRun') : t('submit')}
          </LoadingButton>
        </Box>
      )}

      {submitted && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography variant="h3" component="h3" sx={{ mb: 0 }}>
              {t('progress.title')}
            </Typography>
            <Chip
              label={t(`status.${isMutating || isActiveOnServer ? 'running' : serverStatus}`)}
              color={
                statusColor[isMutating || isActiveOnServer ? 'running' : serverStatus] ?? 'default'
              }
              size="small"
            />
          </Box>

          {submittedDryRun && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('result.dryRunMode')}
            </Alert>
          )}

          {(isMutating || isActiveOnServer) && <LinearProgress sx={{ mb: 2 }} />}

          {progress && (
            <Box mb={2}>
              <ProgressRow
                label={t('progress.contacts')}
                processed={progress.processedContacts}
                total={progress.totalContacts}
              />
              <ProgressRow
                label={t('progress.conversations')}
                processed={progress.processedConversations}
                total={progress.totalConversations}
              />
              <ProgressRow
                label={t('progress.messages')}
                processed={progress.processedMessages}
                total={progress.totalMessages}
              />
              {!options.skipAttachments && (
                <ProgressRow
                  label={t('progress.attachments')}
                  processed={progress.processedAttachments}
                  total={progress.totalAttachments}
                />
              )}
              {!options.skipNotes && (
                <ProgressRow
                  label={t('progress.notes')}
                  processed={progress.processedNotes}
                  total={progress.totalNotes}
                />
              )}
            </Box>
          )}

          {isDone && (
            <Alert
              severity={
                serverStatus === 'failed' ? 'error' : errors.length === 0 ? 'success' : 'warning'
              }
              sx={{ mb: 2 }}
            >
              {serverStatus === 'failed'
                ? t('result.failure')
                : submittedDryRun
                  ? t('result.dryRunSuccess')
                  : errors.length === 0
                    ? t('result.success')
                    : t('result.successWithErrors', { count: errors.length })}
            </Alert>
          )}

          {errors.length > 0 && (
            <Box mb={2}>
              <Typography variant="h3" component="h3" mb={1}>
                {t('errors.title', { count: errors.length })}
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('errors.session')}</TableCell>
                      <TableCell>{t('errors.email')}</TableCell>
                      <TableCell>{t('errors.error')}</TableCell>
                      <TableCell>{t('errors.timestamp')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {errors.map((err, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {err.sessionId ?? '—'}
                        </TableCell>
                        <TableCell>{err.email ?? '—'}</TableCell>
                        <TableCell sx={{ maxWidth: 280, wordBreak: 'break-word' }}>
                          {err.error}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          {new Date(err.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          )}

          {isDone && (
            <Button variant="outlined" color="secondary" onClick={reset} sx={{ mt: 1 }}>
              {t('reset')}
            </Button>
          )}
        </Box>
      )}

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('confirmDescription')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)}>{t('confirmCancel')}</Button>
          <Button onClick={submitMigration} color="error" variant="contained">
            {t('confirmRun')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrispToFrontMigrationForm;
