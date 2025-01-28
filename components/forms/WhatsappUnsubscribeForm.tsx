'use client';

import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/constants/common';
import {
  WHATSAPP_UNSUBSCRIBE_ERROR,
  WHATSAPP_UNSUBSCRIBE_REQUEST,
  WHATSAPP_UNSUBSCRIBE_SUCCESS,
} from '@/constants/events';
import { useTypedSelector } from '@/hooks/store';
import { useUnsubscribeFromWhatsappMutation } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorMessage';
import logEvent from '@/utils/logEvent';
import { findWhatsappSubscription } from '@/utils/whatsappUtils';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';

const containerStyle = {
  marginY: 3,
} as const;

const WhatsappUnsubscribeForm = () => {
  const t = useTranslations('Whatsapp.form');
  const rollbar = useRollbar();

  const userActiveSubscriptions = useTypedSelector((state) => state.user.activeSubscriptions);
  const [unsubscribeFromWhatsapp] = useUnsubscribeFromWhatsappMutation();

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<ErrorDisplay>();

  useEffect(() => {
    const activeWhatsappSubscription = findWhatsappSubscription(userActiveSubscriptions);
    if (activeWhatsappSubscription) {
      setPhoneNumber(activeWhatsappSubscription.subscriptionInfo!);
      setSubscriptionId(activeWhatsappSubscription.id!);
    }
  }, [userActiveSubscriptions]);

  const unsubscribeHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    logEvent(WHATSAPP_UNSUBSCRIBE_REQUEST);

    const unsubscribeResponse = await unsubscribeFromWhatsapp({
      id: subscriptionId,
      cancelledAt: new Date(),
    });

    if (unsubscribeResponse.data) {
      setLoading(false);
      logEvent(WHATSAPP_UNSUBSCRIBE_SUCCESS);
    }

    if (unsubscribeResponse.error) {
      const error = getErrorMessage(unsubscribeResponse.error);

      setFormError(
        t.rich('unsubscribeErrors.internal', {
          contactLink: (children) => (
            <Link target="_blank" href={FEEDBACK_FORM_URL}>
              {children}
            </Link>
          ),
        }),
      );

      rollbar.error('Whatsapp unsubscribe error', unsubscribeResponse.error);
      logEvent(WHATSAPP_UNSUBSCRIBE_ERROR, { message: error });
      setLoading(false);

      throw error;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('unsubscribeTitle')}
        </Typography>
        <Box sx={containerStyle}>
          <form autoComplete="off" onSubmit={unsubscribeHandler}>
            <TextField
              key="phoneNumber-unsubscribe"
              label={t('phoneNumber')}
              variant="standard"
              type="text"
              sx={{ width: '15rem' }}
              value={phoneNumber}
              disabled
            />
            {formError && (
              <Typography color="error.main" mb={2}>
                {formError}
              </Typography>
            )}
            <LoadingButton
              sx={{ mt: 2, mr: 1.5 }}
              variant="contained"
              fullWidth
              color="secondary"
              type="submit"
              loading={loading}
            >
              {t('unsubscribe')}
            </LoadingButton>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WhatsappUnsubscribeForm;
