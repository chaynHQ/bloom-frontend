'use client';

import { sendVerificationEmail, triggerInitialMFA, verifyMFA } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useTypedSelector } from '@/lib/hooks/store';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PhoneInput from '../forms/PhoneInput';

const buttonStyle = {
  display: 'block',
  mx: 'auto',
  mt: 1,
} as const;

const SetupMFA = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const rollbar = useRollbar();

  const userVerifiedEmail = useTypedSelector((state) => state.user.verifiedEmail);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleEnrollMFA = async () => {
    if (!userVerifiedEmail) {
      setError(t('form.emailNotVerified'));
      rollbar.error('MFA setup page reached before email is verified');
      return;
    }

    const { verificationId, error } = await triggerInitialMFA(phoneNumber);
    if (error) {
      setError(t('form.mfaEnrollError'));
      rollbar.error('MFA enrollment trigger error:', error);
    } else {
      setVerificationId(verificationId!);
    }
  };

  const handleFinalizeMFA = async () => {
    const { success, error } = await verifyMFA(verificationId, verificationCode);
    if (success) {
      router.push('/admin/dashboard');
    } else {
      rollbar.error('MFA enrollment verify error:', error || ' Undefined');
      setError(t('form.mfaFinalizeError'));
    }
  };

  const handleSendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      const { error } = await sendVerificationEmail(user);
      if (error) {
        setError(t('form.emailVerificationError'));
      } else {
        rollbar.error('Send verification email error:', error || ' Undefined');
        setError(t('form.emailVerificationSent'));
      }
    }
  };

  return (
    <Box>
      <Typography variant="h3">{t('setupMFA.title')}</Typography>
      {!userVerifiedEmail ? (
        <Box>
          <Typography>{t('form.emailNotVerified')}</Typography>
          <Button
            variant="contained"
            color="secondary"
            sx={{ ...buttonStyle, mt: 2 }}
            onClick={handleSendVerificationEmail}
          >
            {t('form.sendVerificationEmail')}
          </Button>
        </Box>
      ) : !verificationId ? (
        <>
          <PhoneInput value={phoneNumber} onChange={(value) => setPhoneNumber(value)} />
          <Button variant="contained" color="secondary" sx={buttonStyle} onClick={handleEnrollMFA}>
            {t('setupMFA.sendCode')}
          </Button>
        </>
      ) : (
        <>
          <Typography>{t('setupMFA.enterCodeHelperText')}</Typography>
          <TextField
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            label={t('form.verificationCodeLabel')}
            fullWidth
            variant="standard"
            margin="normal"
          />
          <Button
            variant="contained"
            color="secondary"
            sx={buttonStyle}
            onClick={handleFinalizeMFA}
          >
            {t('setupMFA.verifyCode')}
          </Button>
        </>
      )}
      {error && (
        <Typography color="error" sx={{ mt: '1rem !important' }}>
          {error}
        </Typography>
      )}
      <div id="recaptcha-container"></div>
    </Box>
  );
};

export default SetupMFA;
