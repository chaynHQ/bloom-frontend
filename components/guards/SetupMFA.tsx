'use client';

import {
  reauthenticateUser,
  sendVerificationEmail,
  triggerInitialMFA,
  verifyMFA,
} from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useTypedSelector } from '@/lib/hooks/store';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SanitizedTextField from '../common/SanitizedTextField';
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
  const [storedPhoneNumber, setStoredPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState('');
  const [showReauth, setShowReauth] = useState(false);
  const [password, setPassword] = useState('');
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaCleanupRef = useRef<(() => void) | null>(null);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = '';
      }
      if (recaptchaCleanupRef.current) {
        recaptchaCleanupRef.current();
        recaptchaCleanupRef.current = null;
      }
    };
  }, []);

  // Store phone number when user enters it
  useEffect(() => {
    if (phoneNumber && !storedPhoneNumber) {
      setStoredPhoneNumber(phoneNumber);
    }
  }, [phoneNumber, storedPhoneNumber]);

  // Restore phone number after reauthentication
  useEffect(() => {
    if (!showReauth && storedPhoneNumber && !phoneNumber) {
      setPhoneNumber(storedPhoneNumber);
    }
  }, [showReauth, storedPhoneNumber, phoneNumber]);

  const handleReauthentication = async () => {
    if (!password.trim()) {
      setError(t('form.passwordRequired'));
      return;
    }

    setIsReauthenticating(true);
    setError('');

    try {
      const reauthenticateResponse = await reauthenticateUser(password);
      if (reauthenticateResponse.error) {
        rollbar.error('Reauthentication error:', error);
        if (reauthenticateResponse.error.code === 'auth/wrong-password') {
          setError(t('form.firebase.wrongPassword'));
        } else if (reauthenticateResponse.error.code === 'auth/too-many-requests') {
          setError(t('form.firebase.tooManyAttempts'));
        } else {
          setError(t('form.reauthenticationError'));
        }
        return;
      }
      // Reauthenticate success
      setShowReauth(false);
      setPassword('');
      // Reset the MFA setup process
      setVerificationId('');
      setVerificationCode('');
    } catch (error: any) {
      rollbar.error('Reauthentication error:', error);
      setError(t('form.reauthenticationError'));
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

    // Clean up any existing reCAPTCHA before creating a new one
    if (recaptchaContainerRef.current) {
      recaptchaContainerRef.current.innerHTML = '';
    }
    if (recaptchaCleanupRef.current) {
      recaptchaCleanupRef.current();
      recaptchaCleanupRef.current = null;
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
    setEmailVerificationSuccess('');
    const user = auth.currentUser;
    if (user) {
      const { error } = await sendVerificationEmail(user);
      if (error) {
        if (error.code === 'auth/too-many-requests') {
          setError(t('form.firebase.tooManyAttempts'));
        } else {
          setError(t('form.emailVerificationError'));
        }
        rollbar.error('Send verification email error:', error);
      } else {
        setEmailVerificationSent(true);
        setEmailVerificationSuccess(t('form.emailVerificationSent'));
      }
    }
  };

  if (showReauth) {
    return (
      <Box>
        <Typography variant="h3">{t('setupMFA.reauthTitle')}</Typography>
        <Typography mb={2}>{t('setupMFA.reauthDescription')}</Typography>

        <SanitizedTextField
          id="password"
          type="password"
          value={password}
          onChange={setPassword}
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
          {emailVerificationSuccess && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              {emailVerificationSuccess}
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t('form.emailVerificationSpamCheck')}
              </Typography>
            </Alert>
          )}
          <Button
            variant="contained"
            color="secondary"
            sx={{ ...buttonStyle, mt: 2 }}
            onClick={handleSendVerificationEmail}
          >
            {emailVerificationSent
              ? t('form.resendVerificationEmail')
              : t('form.sendVerificationEmail')}
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
          <SanitizedTextField
            id="mfaVerificationCode"
            value={verificationCode}
            onChange={setVerificationCode}
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
