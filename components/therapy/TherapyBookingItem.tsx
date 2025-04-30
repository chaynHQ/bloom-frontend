'use client';

import { useCancelTherapySessionMutation } from '@/lib/api';
import {
  THERAPY_BOOKING_CANCEL_CONFIRMED,
  THERAPY_BOOKING_CANCEL_DIALOG_CLOSED,
  THERAPY_BOOKING_CANCEL_DIALOG_OPENED,
  THERAPY_BOOKING_CANCELLED,
  THERAPY_BOOKING_CANCELLED_ERROR,
  THERAPY_BOOKING_COLLAPSED,
  THERAPY_BOOKING_EXPANDED,
} from '@/lib/constants/events';
import { TherapySession } from '@/lib/store/therapySessionsSlice';
import { getDateLocale } from '@/lib/utils/dates';
import {
  formatDateDetails,
  formatDialogDateTime,
  formatHeaderDateTime,
  formatTimeRange,
} from '@/lib/utils/formatTherapyDates';
import { getTherapySessionStatus } from '@/lib/utils/getTherapySessions';
import logEvent from '@/lib/utils/logEvent';
import {
  CalendarMonthOutlined,
  Cancel,
  CheckCircleOutline,
  ErrorOutline,
  ExpandMore,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { isValid } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';

interface TherapyBookingItemProps {
  session: TherapySession;
}

const paperStyle = {
  mb: 1.5,
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'background-color 0.3s, opacity 0.3s, border-left-color 0.3s',
} as const;

const headerBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  p: '12px 16px',
  cursor: 'pointer',
} as const;

const headerIconBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
} as const;

const expandIconStyle = {
  transform: 'rotate(0deg)',
  transition: 'transform 0.3s',
  color: 'action.active',
} as const;

const expandedBoxStyle = {
  p: '16px 20px',
  pt: 2,
  textAlign: 'left',
} as const;

const videoLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
} as const;

const cancelButtonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  pt: 1,
} as const;

const dialogActionsStyle = {
  padding: '16px 24px',
  paddingTop: 0,
  gap: '8px',
  button: {
    padding: '4px 16px',
    fontSize: '14px !important',
  },
} as const;

export default function TherapyBookingItem({ session }: TherapyBookingItemProps) {
  const t = useTranslations('Therapy.bookingItem');
  const currentLocaleString = useLocale();
  const dateLocale = getDateLocale(currentLocaleString);
  const rollbar = useRollbar();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [cancelTherapySession] = useCancelTherapySessionMutation();

  const now = new Date();
  const status = getTherapySessionStatus(session, now);

  const { startDateTime, endDateTime, isValidStartDate, isValidEndDate } = useMemo(() => {
    const start = new Date(session.startDateTime || 0);
    const end = new Date(session.endDateTime || 0);
    return {
      startDateTime: start,
      endDateTime: end,
      isValidStartDate: isValid(start),
      isValidEndDate: isValid(end),
    };
  }, [session.startDateTime, session.endDateTime]);

  useEffect(() => {
    if (!isValidStartDate) {
      rollbar.warning('Invalid startDateTime encountered for session rendering', {
        sessionId: session.id,
        startDateTime: session.startDateTime,
      });
    }
    if (!isValidEndDate) {
      rollbar.warning('Invalid endDateTime encountered for session rendering', {
        sessionId: session.id,
        endDateTime: session.endDateTime,
      });
    }
  }, [
    isValidStartDate,
    isValidEndDate,
    session.id,
    session.startDateTime,
    session.endDateTime,
    rollbar,
  ]);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formattedDateDetails = useMemo(
    () => formatDateDetails(startDateTime, isValidStartDate, dateLocale),
    [isValidStartDate, startDateTime, dateLocale],
  );

  const formattedTimeRange = useMemo(
    () =>
      formatTimeRange(
        startDateTime,
        endDateTime,
        isValidStartDate,
        isValidEndDate,
        dateLocale,
        userTimezone,
      ),
    [isValidStartDate, isValidEndDate, startDateTime, endDateTime, dateLocale, userTimezone],
  );

  const formattedHeaderDateTime = useMemo(
    () => formatHeaderDateTime(startDateTime, now, isValidStartDate, dateLocale, status),
    [isValidStartDate, startDateTime, now, dateLocale, status],
  );

  const handleToggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    const eventData = { sessionId: session.id, status: status };
    logEvent(newState ? THERAPY_BOOKING_EXPANDED : THERAPY_BOOKING_COLLAPSED, eventData);
  };

  const handleCancelClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (status !== 'upcoming' || isCancelling) return;
    setCancelError(null);
    setShowConfirmDialog(true);
    logEvent(THERAPY_BOOKING_CANCEL_DIALOG_OPENED, { sessionId: session.id });
  };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    logEvent(THERAPY_BOOKING_CANCEL_DIALOG_CLOSED, { sessionId: session.id });
  };

  const handleConfirmCancel = async () => {
    setShowConfirmDialog(false);
    if (status !== 'upcoming' || !session.id) return;

    setIsCancelling(true);
    setCancelError(null);
    logEvent(THERAPY_BOOKING_CANCEL_CONFIRMED, { sessionId: session.id });

    try {
      await cancelTherapySession({ id: session.id }).unwrap();
      logEvent(THERAPY_BOOKING_CANCELLED, { sessionId: session.id });
      window.scrollTo(0, 0);
    } catch (err: any) {
      const errorMessage = err?.data?.message || t('cancelErrorGeneric');
      logEvent(THERAPY_BOOKING_CANCELLED_ERROR, { sessionId: session.id, error: err });
      rollbar.error('Therapy session cancellation error', err, { sessionId: session.id });
      setCancelError(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  let IconComponent = CalendarMonthOutlined;
  let statusStyles = {};
  let headerTitle = '';

  switch (status) {
    case 'upcoming':
      IconComponent = CalendarMonthOutlined;
      headerTitle = t('upcomingSessionTitle');
      statusStyles = {
        borderLeft: '4px solid',
        borderLeftColor: 'secondary.dark',
        backgroundColor: 'background.default',
      };
      break;
    case 'cancelled':
      IconComponent = ErrorOutline;
      headerTitle = t('cancelledSessionTitle');
      statusStyles = { opacity: 0.7, backgroundColor: 'action.disabledBackground' };
      break;
    case 'past':
    default:
      IconComponent = CheckCircleOutline;
      headerTitle = t('pastSessionTitle');
      statusStyles = { backgroundColor: 'background.default' };
      break;
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          ...paperStyle,
          ...statusStyles,
        }}
      >
        <Box
          sx={headerBoxStyle}
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-controls={`booking-details-${session.id}`}
        >
          <Box sx={headerIconBoxStyle}>
            <IconComponent
              sx={{ color: status === 'cancelled' ? 'action.disabled' : 'secondary.dark' }}
            />
            <Box>
              <Typography component="div" fontWeight="medium">
                {headerTitle}
              </Typography>
              <Typography
                variant="body2"
                color={!isValidStartDate ? 'error.main' : 'text.secondary'}
              >
                {formattedHeaderDateTime ? (
                  formattedHeaderDateTime
                ) : (
                  <>
                    {t('invalidDate')}{' '}
                    <ErrorOutline
                      fontSize="inherit"
                      sx={{ verticalAlign: 'text-bottom', ml: 0.5 }}
                    />
                  </>
                )}{' '}
                {!isValidStartDate && !formattedHeaderDateTime && (
                  <ErrorOutline fontSize="inherit" sx={{ verticalAlign: 'text-bottom', ml: 0.5 }} />
                )}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            aria-label={isExpanded ? t('collapse') : t('expand')}
            sx={{ pointerEvents: 'none' }}
          >
            <ExpandMore
              sx={{
                ...expandIconStyle,
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </IconButton>
        </Box>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={expandedBoxStyle}>
            <Stack spacing={1.5}>
              <Typography variant="body2" color={!isValidStartDate ? 'error.main' : 'inherit'}>
                <strong>{t('dateLabel')}:</strong>{' '}
                {formattedDateDetails ? (
                  formattedDateDetails
                ) : (
                  <>
                    {t('invalidDate')}{' '}
                    <ErrorOutline
                      fontSize="inherit"
                      sx={{ verticalAlign: 'text-bottom', ml: 0.5 }}
                    />
                  </>
                )}{' '}
                {!isValidStartDate && !formattedDateDetails && (
                  <ErrorOutline fontSize="inherit" sx={{ verticalAlign: 'text-bottom', ml: 0.5 }} />
                )}
              </Typography>
              <Typography
                variant="body2"
                color={!isValidStartDate || !isValidEndDate ? 'error.main' : 'inherit'}
              >
                <strong>{t('timeLabel')}:</strong>{' '}
                {formattedTimeRange ? (
                  formattedTimeRange
                ) : (
                  <>
                    {t('invalidDate')}{' '}
                    <ErrorOutline
                      fontSize="inherit"
                      sx={{ verticalAlign: 'text-bottom', ml: 0.5 }}
                    />
                  </>
                )}{' '}
                {(!isValidStartDate || !isValidEndDate) && !formattedTimeRange && (
                  <ErrorOutline fontSize="inherit" sx={{ verticalAlign: 'text-bottom', ml: 0.5 }} />
                )}
              </Typography>
              <Typography variant="body2">
                <strong>{t('therapistLabel')}:</strong>{' '}
                {session.serviceProviderName || t('notAssigned')}
              </Typography>
              <Typography variant="body2" sx={videoLinkStyle}>
                <strong>{t('videoLinkLabel')}:</strong> {t('videoLink')}
              </Typography>
              {status === 'upcoming' && (
                <Box sx={cancelButtonContainerStyle}>
                  {cancelError && (
                    <Alert severity="error" sx={{ mb: 1.5, width: '100%' }}>
                      {cancelError}
                    </Alert>
                  )}
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 500 }}
                    onClick={handleCancelClick}
                    disabled={!session.id || isCancelling || status !== 'upcoming'}
                    startIcon={
                      isCancelling ? (
                        <CircularProgress size={16} color="secondary" />
                      ) : (
                        <Cancel color="secondary" />
                      )
                    }
                  >
                    {t('cancelButton')}
                  </Button>
                </Box>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      <Dialog
        open={showConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">{t('cancelDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            {t('cancelDialog.description', {
              dateTime:
                formatDialogDateTime(startDateTime, isValidStartDate, dateLocale) ||
                t('invalidDate'),
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={dialogActionsStyle}>
          <Button variant="outlined" color="secondary" onClick={handleCloseConfirmDialog}>
            {t('cancelDialog.keepButton')}
          </Button>
          <Button variant="contained" color="secondary" onClick={handleConfirmCancel} autoFocus>
            {t('cancelDialog.confirmButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
