'use client';

import { sendVerificationEmail, triggerInitialMFA, verifyMFA, reauthenticateUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useTypedSelector } from '@/lib/hooks/store';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
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
  const [showReauth, setShowReauth] = useState(false);
  const [password, setPassword] = useState('');
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const hasRecaptchaRendered = useRef(false);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (hasRecaptchaRendered.current && recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = '';
        hasRecaptchaRendered.current = false;
      }
    };
  }, []);

  const handleReauthentication = async () => {
    if (!password.trim()) {
      setError(t('form.passwordRequired'));
      return;
    }

    setIsReauthenticating(true);
    setError('');

    try {
      await reauthenticateUser(password);
      setShowReauth(false);
      setPassword('');
      // Reset the MFA setup process
      setVerificationId('');
      setVerificationCode('');
      setPhoneNumber('');
    } catch (error: any) {
      rollbar.error('Reauthentication error:', error);
      if (error.code === 'auth/wrong-password') {
        setError(t('form.firebase.wrongPassword'));
      } else if (error.code === 'auth/too-many-requests') {
        setError(t('form.firebase.tooManyAttempts'));
      } else {
        setError(t('form.reauthenticationError'));
      }
    } finally {
      setIsReauthenticating(false);
    }
  };
  const handleEnrollMFA = async () => {
    if (!userVerifiedEmail) {
      setError(t('form.emailNotVerified'));
      rollbar.error('MFA setup page reached before email is verified');
      return;
    }

    setError('');
    
    // Clear any existing reCAPTCHA before creating a new one
    if (recaptchaContainerRef.current) {
      recaptchaContainerRef.current.innerHTML = '';
      hasRecaptchaRendered.current = false;
    }

    const { verificationId, error } = await triggerInitialMFA(phoneNumber);
    if (error) {
      if (error.code === 'auth/requires-recent-login') {
        setShowReauth(true);
        setError('');
      } else {
        setError(t('form.mfaEnrollError'));
        rollbar.error('MFA enrollment trigger error:', error);
      }
    } else {
      setVerificationId(verificationId!);
      hasRecaptchaRendered.current = true;
    }
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
        rollbar.error('Send verification email error:', error);
        setError(t('form.emailVerificationError'));
      } else {
        // Show success message instead of error
        setError('');
        // You might want to show a success state here instead
      }
    }
  };

  if (showReauth) {
    return (
      <Box>
        <Typography variant="h3">{t('setupMFA.reauthTitle')}</Typography>
        <Typography mb={2}>{t('setupMFA.reauthDescription')}</Typography>
        
        <TextField
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label={t('form.passwordLabel')}
          fullWidth
          variant="standard"
          margin="normal"
          required
        />
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowReauth(false);
              setPassword('');
              setError('');
            }}
            disabled={isReauthenticating}
          >
            {t('setupMFA.cancelReauth')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleReauthentication}
            disabled={isReauthenticating || !password.trim()}
          >
            {isReauthenticating ? t('setupMFA.reauthenticating') : t('setupMFA.confirmReauth')}
          </Button>
        </Box>
      </Box>
    );
  }
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
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
    </Box>
  );
};

export default SetupMFA;
