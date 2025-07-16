'use client';

import { useUnsubscribeFromWhatsappMutation } from '@/lib/api';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import {
  WHATSAPP_UNSUBSCRIBE_ERROR,
  WHATSAPP_UNSUBSCRIBE_REQUEST,
  WHATSAPP_UNSUBSCRIBE_SUCCESS,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import { findWhatsappSubscription } from '@/lib/utils/whatsappUtils';
import { rowStyle } from '@/styles/common';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';

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

      rollbar.error('WhatsApp unsubscribe error', unsubscribeResponse.error);
      logEvent(WHATSAPP_UNSUBSCRIBE_ERROR, { message: error });
      setLoading(false);

      throw error;
    }
  };

  return (
    <Box>
      <form autoComplete="off" onSubmit={unsubscribeHandler}>
        <Box sx={rowStyle}>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              Phone number
            </Typography>
            <Typography variant="body1" color={'text.secondary'}>
              {phoneNumber}
            </Typography>
          </Box>

          <LoadingButton
            sx={{ height: 40, mt: 'auto' }}
            variant="contained"
            color="secondary"
            type="submit"
            loading={loading}
          >
            {t('unsubscribe')}
          </LoadingButton>
        </Box>
      </form>
      {formError && (
        <Typography color="error.main" mb={2}>
          {formError}
        </Typography>
      )}
    </Box>
  );
};

export default WhatsappUnsubscribeForm;
