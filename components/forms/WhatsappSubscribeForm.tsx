import LoadingButton from '@mui/lab/LoadingButton';
import { Card, CardContent, Link, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import MuiPhoneNumber from 'material-ui-phone-number';
import { useTranslations } from 'next-intl';
import { phone } from 'phone';
import * as React from 'react';
import { useState } from 'react';
import { useSubscribeToWhatsappMutation } from '../../app/api';
import { RootState } from '../../app/store';
import rollbar from '../../config/rollbar';
import { WHATSAPP_SUBSCRIPTION_STATUS } from '../../constants/enums';
import {
  WHATSAPP_SUBSCRIBE_ERROR,
  WHATSAPP_SUBSCRIBE_REQUEST,
  WHATSAPP_SUBSCRIBE_SUCCESS,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import { TextNode } from '../../utils/helper-types/translations';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  marginY: 3,
} as const;

const WhatsappSubscribeForm = () => {
  const t = useTranslations('Whatsapp.form');
  const tS = useTranslations('Shared');

  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const [phonenumber, setPhonenumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<TextNode>();

  const [subscribeToWhatsapp] = useSubscribeToWhatsappMutation();

  const subscribeHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);
    logEvent(WHATSAPP_SUBSCRIBE_REQUEST, eventData);

    const validatedNumber = validateNumber(phonenumber);

    if (validatedNumber === undefined) {
      setFormError(t('subscribeErrors.invalidNumber'));
      setLoading(false);
      return;
    } else {
      const subscribeResponse = await subscribeToWhatsapp({
        subscriptionInfo: validatedNumber,
      });

      if ('data' in subscribeResponse) {
        setLoading(false);
        logEvent(WHATSAPP_SUBSCRIBE_SUCCESS, eventData);
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

  const handlePhonenumberChange = (
    value: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string | any,
  ) => {
    setPhonenumber(value);
  };

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

export default WhatsappSubscribeForm;
