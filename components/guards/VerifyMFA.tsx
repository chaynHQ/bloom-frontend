'use client';

import { triggerVerifyMFA, verifyMFA } from '@/lib/auth';
import { Box, Button, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import type { MultiFactorResolver } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type React from 'react'; // Added import for React
import { useEffect, useMemo, useRef, useState } from 'react';
import SanitizedTextField from '../common/SanitizedTextField';

const buttonStyle = {
  display: 'block',
  mx: 'auto',
  mt: 2,
} as const;

interface VerifyMFAProps {
  resolver: MultiFactorResolver;
}

const VerifyMFA: React.FC<VerifyMFAProps> = ({ resolver }) => {
  const t = useTranslations('Auth');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  const [error, setError] = useState('');
  const router = useRouter();
  const rollbar = useRollbar();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const hasRecaptchaRendered = useRef(false);

  // Derive phone number from resolver
  const phoneNumber = useMemo(() => {
    const hint = resolver.hints[0];
    if (hint.factorId === 'phone') {
      // @ts-ignore
      return hint.phoneNumber || '';
    }
    return '';
  }, [resolver]);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    const recaptchaContainer = recaptchaContainerRef.current;
    return () => {
      if (hasRecaptchaRendered.current && recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
        hasRecaptchaRendered.current = false;
      }
    };
  }, []);

  const handleTriggerMFA = async () => {
    setError('');

    // Clear any existing reCAPTCHA before creating a new one
    if (recaptchaContainerRef.current) {
      recaptchaContainerRef.current.innerHTML = '';
      hasRecaptchaRendered.current = false;
    }

    const { verificationId, error } = await triggerVerifyMFA(resolver);
    if (error) {
      rollbar.error('MFA trigger error:', error);
      setError(t('form.mfaTriggerError'));
    } else {
      setVerificationId(verificationId);
      hasRecaptchaRendered.current = true;
    }
  };

  const handleVerifyMFA = async () => {
    setError('');
    if (!verificationId) {
      setError(t('form.mfaVerificationIdMissing'));
      return;
    }
    const { success, error } = await verifyMFA(verificationId, verificationCode, resolver);
    if (success) {
      router.push('/admin/dashboard');
    } else {
      rollbar.error('MFA verify error:', error || ' Undefined');
      setError(t('form.mfaError'));
    }
  };

  return (
    <Box>
      <Typography variant="h3">{t('verifyMFA.title')}</Typography>
      {phoneNumber && <Typography>{t('verifyMFA.phoneNumber', { phoneNumber })}</Typography>}
      {!verificationId ? (
        <Button onClick={handleTriggerMFA} variant="contained" color="secondary" sx={buttonStyle}>
          {t('verifyMFA.triggerSMS')}
        </Button>
      ) : (
        <>
          <SanitizedTextField
            id="mfaVerificationCode"
            value={verificationCode}
            onChange={setVerificationCode}
            label={t('form.verificationCodeLabel')}
            fullWidth
            variant="standard"
            margin="normal"
          />
          <Button onClick={handleVerifyMFA} variant="contained" color="secondary" sx={buttonStyle}>
            {t('verifyMFA.verifyCode')}
          </Button>
        </>
      )}
      {error && (
        <Typography color="error" mt="1rem !important">
          {error}
        </Typography>
      )}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
    </Box>
  );
};

export default VerifyMFA;
