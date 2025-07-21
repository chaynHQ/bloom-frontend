'use client';

import { sendVerificationEmail, triggerInitialMFA, verifyMFA, reauthenticateUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useTypedSelector } from '@/lib/hooks/store';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  const [requiresReauth, setRequiresReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [isReauthenticating, setIsReauthenticating] = useState(false);

  // Clean up reCAPTCHA on component unmount
  useEffect(() => {
    return () => {
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
    };
  }, []);

  const handleEnrollMFA = async () => {
    if (!userVerifiedEmail) {
      setError(t('form.emailNotVerified'));
      rollbar.error('MFA setup page reached before email is verified');
      return;
    }

    setError('');
    const { verificationId, error } = await triggerInitialMFA(phoneNumber);
    if (error) {
      if (error.code === 'auth/requires-recent-login') {
        setRequiresReauth(true);
        setError(t('form.mfaRequiresRecentLogin'));
      } else {
        setError(t('form.mfaEnrollError'));
        rollbar.error('MFA enrollment trigger error:', error);
      }
    } else {
      setVerificationId(verificationId!);
    }
  };

  const handleReauthenticate = async () => {
    if (!reauthPassword) {
      setError(t('form.mfaReauthPasswordRequired'));
      return;
    }

    setIsReauthenticating(true);
    setError('');

    const { success, error } = await reauthenticateUser(reauthPassword);
    
    if (success) {
      setRequiresReauth(false);
      setReauthPassword('');
      // Now try MFA enrollment again
      await handleEnrollMFA();
    } else {
      if (error?.code === 'auth/wrong-password') {
        setError(t('form.mfaReauthWrongPassword'));
      } else {
        setError(t('form.mfaReauthError'));
        rollbar.error('Reauthentication error:', error);
      }
    }
    
    setIsReauthenticating(false);
  };

  const handleFinalizeMFA = async () => {
    setError('');
    const { success, error } = await verifyMFA(verificationId, verificationCode);
    if (success) {
      router.push('/admin/dashboard');
    } else {
      rollbar.error('MFA enrollment verify error:', error || ' Undefined');
      setError(t('form.mfaFinalizeError'));
    }
  };

  const handleSendVerificationEmail = async () => {
    setError('');
    const user = auth.currentUser;
    if (user) {
      const { error } = await sendVerificationEmail(user);
      if (error) {
        setError(t('form.emailVerificationError'));
        rollbar.error('Send verification email error:', error);
      } else {
        // This is actually a success message, not an error
        setError(''); // Clear any previous errors
        // You might want to show a success message instead
      }
    }
  };

  return (
    <Box>
      <Typography variant="h3">{t('setupMFA.title')}</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

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
      ) : requiresReauth ? (
        <Box>
          <Typography sx={{ mb: 2 }}>{t('form.mfaReauthInstructions')}</Typography>
          <TextField
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            label={t('form.passwordLabel')}
            type="password"
            fullWidth
            variant="standard"
            margin="normal"
            required
          />
          <Button
            variant="contained"
            color="secondary"
            sx={buttonStyle}
            onClick={handleReauthenticate}
            disabled={isReauthenticating || !reauthPassword}
          >
            {isReauthenticating ? t('form.mfaReauthenticating') : t('form.mfaReauthenticate')}
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
      <div id="recaptcha-container"></div>
    </Box>
  );
};

export default SetupMFA;
