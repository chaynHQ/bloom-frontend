'use client';
import { Link as i18nLink } from '@/i18n/routing';
import { useSubscribeToWhatsappMutation } from '@/lib/api';
import { FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { WHATSAPP_SUBSCRIPTION_STATUS } from '@/lib/constants/enums';
import {
  WHATSAPP_SUBSCRIBE_ERROR,
  WHATSAPP_SUBSCRIBE_REQUEST,
  WHATSAPP_SUBSCRIBE_SUCCESS,
} from '@/lib/constants/events';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { phone } from 'phone';
import { useState } from 'react';
import BaseRegisterForm, { useRegisterFormLogic } from './BaseRegisterForm';
import PhoneInput from './PhoneInput';

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  maxWidth: { xs: 400, md: 600 },
} as const;

const contactPermissionLabelStyle = {
  mr: 0,
  span: { fontSize: { xs: '0.875rem', md: '1rem !important' } },
} as const;

const actionButtonsStyle = {
  display: 'flex',
  flexDirection: { xs: 'column-reverse', md: 'row' },
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 2,
} as const;

const RegisterNotesForm = () => {
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);

  const [subscribeToWhatsapp] = useSubscribeToWhatsappMutation();

  const t = useTranslations('Auth.form');
  const tWhatsapp = useTranslations('Whatsapp.form');
  const tNotes = useTranslations('Whatsapp.notes');

  const { loading, userLoading, formError, setFormError, handleSubmit } = useRegisterFormLogic();

  const validatePhoneNumber = (phoneNumber: string): string | undefined => {
    const sanitisedNumber = phoneNumber.replace(/\s/g, '');
    const validationResult = phone(sanitisedNumber);

    if (validationResult.isValid) {
      return validationResult.phoneNumber;
    } else {
      return undefined;
    }
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate phone number first
    const validatedNumber = validatePhoneNumber(phoneNumber);
    if (!validatedNumber) {
      setFormError(tWhatsapp('subscribeErrors.invalidNumber'));
      return;
    }

    // Use the base registration logic
    const success = await handleSubmit(event, {
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      contactPermission: contactPermissionInput,
    });

    if (success) {
      // Subscribe to WhatsApp after successful registration
      logEvent(WHATSAPP_SUBSCRIBE_REQUEST);
      const subscribeResponse = await subscribeToWhatsapp({
        subscriptionInfo: validatedNumber,
      });

      if (subscribeResponse.data) {
        logEvent(WHATSAPP_SUBSCRIBE_SUCCESS);
      } else if (subscribeResponse.error) {
        const error = getErrorMessage(subscribeResponse.error);
        if (error === WHATSAPP_SUBSCRIPTION_STATUS.ALREADY_EXISTS) {
        } else {
          setFormError(
            tWhatsapp.rich('subscribeErrors.internal', {
              contactLink: (children) => (
                <Link target="_blank" href={FEEDBACK_FORM_URL}>
                  {children}
                </Link>
              ),
            }),
          );
        }
        logEvent(WHATSAPP_SUBSCRIBE_ERROR, { message: error });
      }
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  return (
    <BaseRegisterForm onSubmit={submitHandler} formError={formError} loading={loading}>
      <Box sx={formStyle}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              id="name"
              onChange={(e) => setNameInput(e.target.value)}
              label={t('nameLabel')}
              variant="standard"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ pt: '0.75rem !important' }}>
            <PhoneInput value={phoneNumber} onChange={handlePhoneNumberChange} required />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              id="email"
              onChange={(e) => setEmailInput(e.target.value)}
              label={t('emailLabel')}
              variant="standard"
              type="email"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              id="password"
              onChange={(e) => setPasswordInput(e.target.value)}
              label={t('passwordLabel')}
              type="password"
              variant="standard"
              fullWidth
              required
            />
          </Grid>
        </Grid>

        <FormControl sx={{ mb: 1 }}>
          <FormControlLabel
            label={t('contactPermissionLabel')}
            sx={contactPermissionLabelStyle}
            control={
              <Checkbox
                aria-label={t('contactPermissionLabel')}
                onChange={(e) => setContactPermissionInput(e.target.checked)}
              />
            }
          />
        </FormControl>

        <Box sx={actionButtonsStyle}>
          <Typography variant="body2">
            {tNotes('haveAccount')}{' '}
            <Link component={i18nLink} href="/auth/login">
              {tNotes('login')}
            </Link>
          </Typography>

          <LoadingButton
            variant="contained"
            color="secondary"
            type="submit"
            loading={loading || userLoading}
            sx={{ width: { xs: '100%', md: 'auto' }, maxWidth: 240 }}
          >
            {tNotes('createAccountButton')}
          </LoadingButton>
        </Box>
      </Box>
    </BaseRegisterForm>
  );
};

export default RegisterNotesForm;
