import LoadingButton from '@mui/lab/LoadingButton';
import { Card, CardContent, Link, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useUnsubscribeFromWhatsappMutation } from '../../app/api';
import { RootState } from '../../app/store';
import rollbar from '../../config/rollbar';
import {
  WHATSAPP_UNSUBSCRIBE_ERROR,
  WHATSAPP_UNSUBSCRIBE_REQUEST,
  WHATSAPP_UNSUBSCRIBE_SUCCESS,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
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

  const [phonenumber, setPhonenumber] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<TextNode>();

  const [unsubscribeFromWhatsapp] = useUnsubscribeFromWhatsappMutation();

  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  useEffect(() => {
    const activeWhatsappSubscription = findWhatsappSubscription(user.activeSubscriptions);
    if (activeWhatsappSubscription) {
      setPhonenumber(activeWhatsappSubscription.subscriptionInfo!);
      setSubscriptionId(activeWhatsappSubscription.id!);
    }
  }, [user.activeSubscriptions]);

  const unsubscribeHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    logEvent(WHATSAPP_UNSUBSCRIBE_REQUEST, eventData);

    const unsubscribeResponse = await unsubscribeFromWhatsapp({
      id: subscriptionId,
      cancelledAt: new Date(),
    });

    if ('data' in unsubscribeResponse) {
      setLoading(false);
      logEvent(WHATSAPP_UNSUBSCRIBE_SUCCESS, eventData);
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
};

export default WhatsappUnsubscribeForm;
