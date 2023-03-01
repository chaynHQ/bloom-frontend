import LoadingButton from '@mui/lab/LoadingButton';
import { Card, CardContent, Link, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import MuiPhoneNumber from 'material-ui-phone-number';
import { useTranslations } from 'next-intl';
import { phone } from 'phone';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSubscribeToWhatsappMutation, useUnsubscribeFromWhatsappMutation } from '../../app/api';
import { RootState } from '../../app/store';
import { Subscription } from '../../app/userSlice';
import rollbar from '../../config/rollbar';
import { WHATSAPP_SUBSCRIPTION_STATUS } from '../../constants/enums';
import {
  WHATSAPP_SUBSCRIBE_ERROR,
  WHATSAPP_SUBSCRIBE_REQUEST,
  WHATSAPP_SUBSCRIBE_SUCCESS,
  WHATSAPP_UNSUBSCRIBE_ERROR,
  WHATSAPP_UNSUBSCRIBE_REQUEST,
  WHATSAPP_UNSUBSCRIBE_SUCCESS,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import { TextNode } from '../../utils/helper-types/translations';
import logEvent from '../../utils/logEvent';
const containerStyle = {
  marginY: 3,
} as const;

const WhatsappForm = () => {
  const t = useTranslations('Whatsapp.form');
  const tS = useTranslations('Shared');

  const [phonenumber, setPhonenumber] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [formError, setFormError] = useState<TextNode>();

  const [subscribeToWhatsapp] = useSubscribeToWhatsappMutation();
  const [unsubscribeFromWhatsapp] = useUnsubscribeFromWhatsappMutation();

  const { user } = useTypedSelector((state: RootState) => state);

  useEffect(() => {
    const activeWhatsappSubscription = findWhatsappSubscription(user.activeSubscriptions);

    if (activeWhatsappSubscription) {
      setHasActiveSubscription(true);
      setPhonenumber(activeWhatsappSubscription.subscriptionInfo!);
      setSubscriptionId(activeWhatsappSubscription.id!);
    } else {
      setHasActiveSubscription(false);
    }
  }, [user.activeSubscriptions]);

  const subscribeHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    logEvent(WHATSAPP_SUBSCRIBE_REQUEST);

    const validatedNumber = validateNumber(phonenumber);

    if (validatedNumber === undefined) {
      setFormError(t('subscribeErrors.invalidNumber'));
      setLoading(false);
      return;
    } else {
      setPhonenumber(validatedNumber);

      const subscribeResponse = await subscribeToWhatsapp({
        subscriptionInfo: validatedNumber,
      });

      if ('data' in subscribeResponse) {
        setLoading(false);
        logEvent(WHATSAPP_SUBSCRIBE_SUCCESS);
      }

      if ('error' in subscribeResponse) {
        const error = getErrorMessage(subscribeResponse.error);

        if (error === WHATSAPP_SUBSCRIPTION_STATUS.ALREADY_EXISTS) {
          setFormError(
            t.rich('subscribeErrors.alreadyExists', {
              contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
            }),
          );
        } else {
          setFormError(
            t.rich('subscribeErrors.internal', {
              contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
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

  const unsubscribeHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    logEvent(WHATSAPP_UNSUBSCRIBE_REQUEST);

    const unsubscribeResponse = await unsubscribeFromWhatsapp({
      id: subscriptionId,
      cancelledAt: new Date(),
    });

    if ('data' in unsubscribeResponse) {
      setLoading(false);
      logEvent(WHATSAPP_UNSUBSCRIBE_SUCCESS);
    }

    if ('error' in unsubscribeResponse) {
      const error = getErrorMessage(unsubscribeResponse.error);

      setFormError(
        t.rich('unsubscribeErrors.internal', {
          contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
        }),
      );

      rollbar.error('Whatsapp unsubscribe error', unsubscribeResponse.error);
      logEvent(WHATSAPP_UNSUBSCRIBE_ERROR, { message: error });
      setLoading(false);

      throw error;
    }
  };

  const handlePhonenumberChange = (
    value: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | any,
  ) => {
    setPhonenumber(value);
  };

  // TODO verify phone numbers

  if (hasActiveSubscription) {
    // If the user has an active subscription, show view to manage subscription i.e. unsubscribe
    return (
      <Card>
        <CardContent>
          <Typography variant="h2" component="h2">
            {t('unsubscribeTitle')}
          </Typography>
          <Box sx={containerStyle}>
            <form autoComplete="off" onSubmit={unsubscribeHandler}>
              <TextField
                key="phonenumber-unsubscribe"
                label={t('phonenumber')}
                variant="standard"
                type="text"
                fullWidth
                value={phonenumber}
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
  }
  // Otherwise, show view to subscribe to whatsapp
  return (
    <Card>
      <CardContent>
        <Typography variant="h2" component="h2">
          {t('subscribeTitle')}
        </Typography>
        <Box sx={containerStyle}>
          <form autoComplete="off" onSubmit={subscribeHandler}>
            <MuiPhoneNumber
              defaultCountry={'gb'}
              onChange={handlePhonenumberChange}
              label={t('phonenumber')}
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
              {t('subscribe')}
            </LoadingButton>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
};

const validateNumber = (phonenumber: string): string | undefined => {
  const sanitisedNumber = phonenumber.replace(/\s/g, '');

  const validationResult = phone(sanitisedNumber);

  if (validationResult.isValid) {
    return validationResult.phoneNumber;
  } else {
    return undefined;
  }
};

const findWhatsappSubscription = (subs: Subscription[] | null): Subscription | undefined => {
  if (subs && subs.length > 0) {
    return subs.find((sub) => sub.subscriptionName === 'whatsapp');
  }

  return undefined;
};

export default WhatsappForm;
