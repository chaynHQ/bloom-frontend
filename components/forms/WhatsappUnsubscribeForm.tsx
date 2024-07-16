import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  WHATSAPP_UNSUBSCRIBE_ERROR,
  WHATSAPP_UNSUBSCRIBE_REQUEST,
  WHATSAPP_UNSUBSCRIBE_SUCCESS,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { useUnsubscribeFromWhatsappMutation } from '../../store/api';
import { getErrorMessage } from '../../utils/errorMessage';
import { TextNode } from '../../utils/helper-types/translations';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { findWhatsappSubscription } from '../../utils/whatsappUtils';
const containerStyle = {
  marginY: 3,
} as const;

const WhatsappUnsubscribeForm = () => {
  const t = useTranslations('Whatsapp.form');
  const tS = useTranslations('Shared');

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<TextNode>();

  const [unsubscribeFromWhatsapp] = useUnsubscribeFromWhatsappMutation();

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userActiveSubscriptions = useTypedSelector((state) => state.user.activeSubscriptions);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

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
    logEvent(WHATSAPP_UNSUBSCRIBE_REQUEST, eventUserData);

    const unsubscribeResponse = await unsubscribeFromWhatsapp({
      id: subscriptionId,
      cancelledAt: new Date(),
    });

    if (unsubscribeResponse.data) {
      setLoading(false);
      logEvent(WHATSAPP_UNSUBSCRIBE_SUCCESS, eventUserData);
    }

    if (unsubscribeResponse.error) {
      const error = getErrorMessage(unsubscribeResponse.error);

      setFormError(
        t.rich('unsubscribeErrors.internal', {
          contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
        }),
      );

      (window as any).Rollbar?.error('Whatsapp unsubscribe error', unsubscribeResponse.error);
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
