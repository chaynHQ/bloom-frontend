'use client';

import { sendVerificationEmail, triggerInitialMFA, verifyMFA, reauthenticateUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useTypedSelector } from '@/lib/hooks/store';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'code' | 'reauth'>('phone');

  // Clean up reCAPTCHA on component unmount and when step changes
  useEffect(() => {
    const cleanup = () => {
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      
      // Clear any global reCAPTCHA instances
      if ((window as any).grecaptcha) {
        try {
          (window as any).grecaptcha.reset();
        } catch (e) {
          // Ignore reset errors
        }
      }
    };

    cleanup();

    return () => {
      cleanup();
    };
  }, [step]);

  const handleEnrollMFA = useCallback(async () => {
    if (!userVerifiedEmail) {
      setError(t('form.emailNotVerified'));
      rollbar.error('MFA setup page reached before email is verified');
      return;
    }

    setError('');
    setIsLoading(true);
    
    const { verificationId, error } = await triggerInitialMFA(phoneNumber);
    setIsLoading(false);
    
    if (error) {
      if (error.code === 'auth/requires-recent-login') {
        setRequiresReauth(true);
        setStep('reauth');
        setError('');
      } else {
        setError(t('form.mfaEnrollError'));
        rollbar.error('MFA enrollment trigger error:', error);
      }
    } else {
      setVerificationId(verificationId!);
      setStep('code');
    }
  }, [phoneNumber, userVerifiedEmail, t, rollbar]);

  const handleReauthenticate = useCallback(async () => {
    if (!reauthPassword) {
      setError('Please enter your password');
      return;
    }

    setIsReauthenticating(true);
    setError('');

    const { success, error } = await reauthenticateUser(reauthPassword);
    
    if (success) {
      setRequiresReauth(false);
      setReauthPassword('');
      setStep('phone');
      setError('');
    } else {
      if (error?.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Authentication failed. Please try again.');
        rollbar.error('Reauthentication error:', error);
      }
    }
    
    setIsReauthenticating(false);
  }, [reauthPassword, rollbar]);

  const handleFinalizeMFA = useCallback(async () => {
    setError('');
    setIsLoading(true);
    
    const { success, error } = await verifyMFA(verificationId, verificationCode);
    setIsLoading(false);
    
    if (success) {
      router.push('/admin/dashboard');
    } else {
      rollbar.error('MFA enrollment verify error:', error || ' Undefined');
      setError(t('form.mfaFinalizeError'));
    }
  }, [verificationId, verificationCode, router, rollbar, t]);

  const handleSendVerificationEmail = useCallback(async () => {
    setError('');
    setIsLoading(true);
    
    const user = auth.currentUser;
    if (user) {
      const { error } = await sendVerificationEmail(user);
      if (error) {
        setError(t('form.emailVerificationError'));
        rollbar.error('Send verification email error:', error);
      } else {
        setError('');
      }
    }
    setIsLoading(false);
  }, [t, rollbar]);

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
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {t('form.sendVerificationEmail')}
          </Button>
        </Box>
      ) : step === 'reauth' ? (
        <Box>
          <Typography sx={{ mb: 2 }}>
            For security reasons, please re-enter your password to continue setting up 2FA.
          </Typography>
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
            startIcon={isReauthenticating ? <CircularProgress size={20} /> : undefined}
          >
            {isReauthenticating ? 'Authenticating...' : 'Continue'}
          </Button>
        </Box>
      ) : step === 'phone' ? (
        <>
          <Typography sx={{ mb: 2 }}>
            Enter your phone number to receive SMS verification codes for secure access.
          </Typography>
          <PhoneInput value={phoneNumber} onChange={(value) => setPhoneNumber(value)} />
          <Button 
            variant="contained" 
            color="secondary" 
            sx={buttonStyle} 
            onClick={handleEnrollMFA}
            disabled={isLoading || !phoneNumber}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {t('setupMFA.sendCode')}
          </Button>
        </>
      ) : step === 'code' ? (
        <>
          <Typography>{t('setupMFA.enterCodeHelperText')}</Typography>
          <TextField
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            label={t('form.verificationCodeLabel')}
            fullWidth
            variant="standard"
            margin="normal"
            inputProps={{ maxLength: 6 }}
          />
          <Button
            variant="contained"
            color="secondary"
            sx={buttonStyle}
            onClick={handleFinalizeMFA}
            disabled={isLoading || !verificationCode}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {t('setupMFA.verifyCode')}
          </Button>
        </>
      ) : null}
      )}
      <div id="recaptcha-container"></div>
    </Box>
  );
};

export default SetupMFA;
