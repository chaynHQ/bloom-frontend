'use client';

import ConfirmDialog from '@/components/forms/ConfirmDialog';
import { Link as i18nLink } from '@/i18n/routing';
import { revalidatePartners } from '@/lib/actions/revalidatePartners';
import { useGetPartnersQuery, useUpdatePartnerMutation } from '@/lib/api';
import {
  UPDATE_PARTNER_ACTIVE_ERROR,
  UPDATE_PARTNER_ACTIVE_REQUEST,
  UPDATE_PARTNER_ACTIVE_SUCCESS,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { AdminPartner, UpdatePartner } from '@/lib/store/partnersSlice';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  NativeSelect,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { ReactNode, useMemo, useState } from 'react';

const MAX_THERAPY_SESSIONS_PER_CODE = 20;
const therapyOptions = Array.from({ length: MAX_THERAPY_SESSIONS_PER_CODE + 1 }, (_, i) => i);

// Below md each row becomes a stacked block of label/value lines, so the table never scrolls
// sideways on a phone.
const tableStyle = {
  '& th': { fontWeight: 600, verticalAlign: 'bottom' },
  '& td, & th': { borderColor: 'divider', paddingX: 1.5 },
  '& td:first-of-type, & th:first-of-type': { paddingLeft: 0 },
  '& td:last-of-type, & th:last-of-type': { paddingRight: 0, textAlign: 'right' },
  display: { xs: 'block', md: 'table' },
  '& thead': { display: { xs: 'none', md: 'table-header-group' } },
  '& tbody': { display: { xs: 'block', md: 'table-row-group' } },
  '& tbody tr': {
    display: { xs: 'block', md: 'table-row' },
    paddingY: { xs: 1.5, md: 0 },
    borderBottom: { xs: 1, md: 0 },
    borderColor: { xs: 'divider' },
  },
  '& tbody td': {
    display: { xs: 'flex', md: 'table-cell' },
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    borderBottom: { xs: 0, md: 1 },
    borderColor: { md: 'divider' },
    paddingX: { xs: 0, md: 1.5 },
    paddingY: { xs: 0.5, md: 1.5 },
    minHeight: { xs: 40, md: 'auto' },
  },
} as const;

const cellLabelStyle = {
  display: { xs: 'block', md: 'none' },
  color: 'text.secondary',
} as const;

const nameStyle = { fontWeight: 600, display: 'block', whiteSpace: 'nowrap' } as const;
const slugStyle = { color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' } as const;
const welcomeLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  whiteSpace: 'nowrap',
} as const;
const actionButtonStyle = { minWidth: 112 } as const;
// The theme's primary colour is too pale to show a switch is on
const switchStyle = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.dark' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: 'primary.dark',
    opacity: 0.4,
  },
} as const;

type Feedback = { severity: 'success' | 'warning' | 'error'; message: ReactNode };

export default function PartnersTable() {
  const t = useTranslations('Admin.partners');
  const rollbar = useRollbar();
  const token = useTypedSelector((state) => state.user.token);

  const { data, isLoading, error: loadError } = useGetPartnersQuery(undefined);
  const [updatePartner] = useUpdatePartnerMutation();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState<AdminPartner | null>(null);

  const partners = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [data],
  );

  const update = async (partner: AdminPartner, changes: UpdatePartner) => {
    setPendingId(partner.id);
    setFeedback(null);
    if (changes.active !== undefined) {
      logEvent(UPDATE_PARTNER_ACTIVE_REQUEST, { active: changes.active });
    }

    const result = await updatePartner({ id: partner.id, ...changes });

    if (result.error) {
      // Validation errors from the backend can be a list of messages
      const errorMessage = String(getErrorMessage(result.error));
      if (changes.active !== undefined) {
        logEvent(UPDATE_PARTNER_ACTIVE_ERROR, { active: changes.active, error: errorMessage });
      }
      rollbar.error('Update partner error', result.error);
      setFeedback({
        severity: 'error',
        message: t('updateError', { partner: partner.name, error: errorMessage }),
      });
      setPendingId(null);
      return;
    }

    if (changes.active !== undefined) {
      logEvent(UPDATE_PARTNER_ACTIVE_SUCCESS, { active: changes.active });
    }

    try {
      await revalidatePartners(token ?? '');
      setFeedback({ severity: 'success', message: t('saved', { partner: partner.name }) });
    } catch (error) {
      rollbar.error('Revalidate partners error', error as Error);
      setFeedback({ severity: 'warning', message: t('notRefreshed', { partner: partner.name }) });
    }
    setPendingId(null);
  };

  const confirmDeactivate = (confirmed: boolean) => {
    const partner = confirmingDeactivate;
    setConfirmingDeactivate(null);
    if (confirmed && partner) update(partner, { active: false });
  };

  if (isLoading) return <CircularProgress size={24} aria-label={t('loading')} />;

  if (loadError) {
    return (
      <Alert severity="error">
        {t('loadError', { error: String(getErrorMessage(loadError)) })}
      </Alert>
    );
  }

  return (
    <Box>
      <Table size="small" sx={tableStyle}>
        <TableHead>
          <TableRow>
            <TableCell>{t('columns.partner')}</TableCell>
            <TableCell>{t('columns.status')}</TableCell>
            <TableCell>{t('columns.therapySessionsPerCode')}</TableCell>
            <TableCell>{t('columns.automaticAccessCode')}</TableCell>
            <TableCell>{t('columns.welcomePage')}</TableCell>
            <TableCell>
              <Box component="span" sx={visuallyHidden}>
                {t('columns.actions')}
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {partners.map((partner) => {
            const pending = pendingId === partner.id;
            return (
              <TableRow key={partner.id}>
                <TableCell>
                  <Box>
                    <Box component="span" sx={nameStyle}>
                      {partner.name}
                    </Box>
                    <Box component="span" sx={slugStyle}>
                      {partner.slug}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box component="span" sx={cellLabelStyle}>
                    {t('columns.status')}
                  </Box>
                  <Chip
                    size="small"
                    label={partner.isActive ? t('active') : t('inactive')}
                    color={partner.isActive ? 'success' : 'default'}
                    variant={partner.isActive ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Box component="span" sx={cellLabelStyle}>
                    {t('columns.therapySessionsPerCode')}
                  </Box>
                  <NativeSelect
                    value={partner.therapySessionsPerCode}
                    disabled={pending}
                    onChange={(event) =>
                      update(partner, { therapySessionsPerCode: Number(event.target.value) })
                    }
                    inputProps={{
                      'aria-label': t('therapySessionsPerCodeLabel', { partner: partner.name }),
                    }}
                  >
                    {therapyOptions.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </NativeSelect>
                </TableCell>
                <TableCell>
                  <Box component="span" sx={cellLabelStyle}>
                    {t('columns.automaticAccessCode')}
                  </Box>
                  <Switch
                    checked={partner.automaticAccessCode}
                    disabled={pending}
                    sx={switchStyle}
                    onChange={(event) =>
                      update(partner, { automaticAccessCode: event.target.checked })
                    }
                    slotProps={{
                      input: {
                        'aria-label': t('automaticAccessCodeLabel', { partner: partner.name }),
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box component="span" sx={cellLabelStyle}>
                    {t('columns.welcomePage')}
                  </Box>
                  <Link
                    component={i18nLink}
                    href={`/welcome/${partner.slug}`}
                    target="_blank"
                    aria-label={t('welcomePageLabel', { partner: partner.name })}
                    sx={welcomeLinkStyle}
                  >
                    {t('welcomePageLink')}
                    <OpenInNew fontSize="inherit" />
                  </Link>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant={partner.isActive ? 'outlined' : 'contained'}
                    color={partner.isActive ? 'inherit' : 'secondary'}
                    loading={pending}
                    disabled={!!pendingId && !pending}
                    sx={actionButtonStyle}
                    onClick={() =>
                      partner.isActive
                        ? setConfirmingDeactivate(partner)
                        : update(partner, { active: true })
                    }
                  >
                    {partner.isActive ? t('deactivate') : t('activate')}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {feedback && (
        <Alert
          severity={feedback.severity}
          role={feedback.severity === 'error' ? 'alert' : 'status'}
          sx={{ mt: 2 }}
        >
          {feedback.message}
        </Alert>
      )}
      <ConfirmDialog
        isOpen={!!confirmingDeactivate}
        onConfirm={confirmDeactivate}
        title={t('deactivateTitle', { partner: confirmingDeactivate?.name ?? '' })}
        text={t('deactivateDescription', { partner: confirmingDeactivate?.name ?? '' })}
        submitLabel={t('deactivate')}
        cancelLabel={t('cancel')}
      />
    </Box>
  );
}
