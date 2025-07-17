'use client';

import { useSubscribeToWhatsappMutation } from '@/lib/api';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { WHATSAPP_SUBSCRIPTION_STATUS } from '@/lib/constants/enums';
import {
  WHATSAPP_SUBSCRIBE_ERROR,
  WHATSAPP_SUBSCRIBE_REQUEST,
  WHATSAPP_SUBSCRIBE_SUCCESS,
} from '@/lib/constants/events';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { phone } from 'phone';
import * as React from 'react';
import { useState } from 'react';
import 'react-international-phone/style.css';
import PhoneInput from './PhoneInput';

const WhatsappSubscribeForm = () => {
  const t = useTranslations('Whatsapp.form');
  const rollbar = useRollbar();

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<ErrorDisplay>();

  const [subscribeToWhatsapp] = useSubscribeToWhatsappMutation();

  const subscribeHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    logEvent(WHATSAPP_SUBSCRIBE_REQUEST);

    const validatedNumber = validateNumber(phoneNumber);

    if (validatedNumber === undefined) {
      setFormError(t('subscribeErrors.invalidNumber'));
      setLoading(false);
      return;
    } else {
      const subscribeResponse = await subscribeToWhatsapp({
        subscriptionInfo: validatedNumber,
      });

      if (subscribeResponse.data) {
        setLoading(false);
        logEvent(WHATSAPP_SUBSCRIBE_SUCCESS);
      }

      if (subscribeResponse.error) {
        const error = getErrorMessage(subscribeResponse.error);

        if (error === WHATSAPP_SUBSCRIPTION_STATUS.ALREADY_EXISTS) {
          setFormError(
            t.rich('subscribeErrors.alreadyExists', {
              contactLink: (children) => (
                <Link target="_blank" href={FEEDBACK_FORM_URL}>
                  {children}
                </Link>
              ),
            }),
          );
        } else {
          setFormError(
            t.rich('subscribeErrors.internal', {
              contactLink: (children) => (
                <Link target="_blank" href={FEEDBACK_FORM_URL}>
                  {children}
                </Link>
              ),
            }),
          );
        }

        rollbar.error('Whatsapp subscribe error', subscribeResponse.error);
        logEvent(WHATSAPP_SUBSCRIBE_ERROR, { message: error });
        setLoading(false);

        throw error;
      }
    }
  };

  const handlePhoneNumberChange = (
    value: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | any,
  ) => {
    setPhoneNumber(value);
  };

  return (
    <Box>
      <form autoComplete="off" onSubmit={subscribeHandler}>
        <Box sx={rowStyle}>
          <Box>
            <PhoneInput value={phoneNumber} onChange={handlePhoneNumberChange} required />
          </Box>

          <LoadingButton
            sx={{ height: 40, mt: 2 }}
            variant="contained"
            color="secondary"
            type="submit"
            loading={loading}
          >
            {t('subscribe')}
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

const validateNumber = (phoneNumber: string): string | undefined => {
  const sanitisedNumber = phoneNumber.replace(/\s/g, '');

  const validationResult = phone(sanitisedNumber);

  if (validationResult.isValid) {
    return validationResult.phoneNumber;
  } else {
    return undefined;
  }
};

export default WhatsappSubscribeForm;
