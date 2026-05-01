'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import {
  MigrationError,
  MigrationOptions,
  MigrationProgress,
  MigrationStatusResponse,
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
import { useEffect, useState } from 'react';

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
} as const satisfies Record<MigrationStatusResponse['status'], string>;

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
  const [hasStarted, setHasStarted] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: status } = useGetCrispMigrationStatusQuery(undefined, {
    pollingInterval: isPolling ? 3000 : 0,
  });

  const [runMigration, { isLoading }] = useRunCrispMigrationMutation();

  useEffect(() => {
    if (!status) return;
    if (status.status === 'running' || status.status === 'pending') {
      setHasStarted(true);
      setIsPolling(true);
    } else if (status.status === 'completed' || status.status === 'failed') {
      setIsPolling(false);
    }
  }, [status?.status]);

  const submitMigration = async () => {
    setShowConfirm(false);
    setFormError(null);

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
    setHasStarted(true);
    setIsPolling(true);

    const result = await runMigration(body);

    if (result.error) {
      const msg =
        'status' in result.error
          ? ((result.error.data as any)?.message ?? String(result.error.status))
          : 'Unknown error';
      setFormError(t('runError') + msg);
      rollbar.error('Crisp migration failed to start: ' + msg);
      logEvent(CRISP_MIGRATION_RUN_ERROR, { error: msg });
      setIsPolling(false);
      return;
    }

    logEvent(CRISP_MIGRATION_RUN_SUCCESS, {
      dryRun: body.dryRun,
      success: result.data?.success,
      errorCount: result.data?.errors?.length ?? 0,
    });
  };

  const handleRunClick = () => {
    if (!options.dryRun) {
      setShowConfirm(true);
    } else {
      submitMigration();
    }
  };

  const reset = () => {
    setHasStarted(false);
    setIsPolling(false);
    setFormError(null);
    setOptions(defaultOptions);
  };

  const currentStatus = status?.status ?? 'idle';
  const isActive = currentStatus === 'running' || currentStatus === 'pending' || isLoading;
  const isDone = currentStatus === 'completed' || currentStatus === 'failed';
  const progress = status?.progress;
  const errors: MigrationError[] = status?.errors ?? [];

  return (
    <Box>
      {/* ── Form (hidden once migration starts) ── */}
      {!hasStarted && (
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
            loading={isLoading}
            onClick={handleRunClick}
            sx={{ mt: 1 }}
          >
            {options.dryRun ? t('submitDryRun') : t('submit')}
          </LoadingButton>
        </Box>
      )}

      {/* ── Status panel (shown once started) ── */}
      {hasStarted && status && currentStatus !== 'idle' && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography variant="h3" component="h3" sx={{ mb: 0 }}>
              {t('progress.title')}
            </Typography>
            <Chip
              label={t(`status.${currentStatus}`)}
              color={statusColor[currentStatus] ?? 'default'}
              size="small"
            />
          </Box>

          {options.dryRun && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('result.dryRunMode')}
            </Alert>
          )}

          {isActive && <LinearProgress sx={{ mb: 2 }} />}

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
                currentStatus === 'completed' && errors.length === 0 ? 'success' : 'warning'
              }
              sx={{ mb: 2 }}
            >
              {currentStatus === 'failed'
                ? t('result.failure')
                : options.dryRun
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

      {/* ── Confirmation dialog for live migrations ── */}
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
