'use client';

import { triggerVerifyMFA, verifyMFA } from '@/lib/auth';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import type { MultiFactorResolver } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type React from 'react'; // Added import for React
import { useEffect, useState, useCallback } from 'react';

const buttonStyle = {
  display: 'block',
  mx: 'auto',
  mt: 1,
} as const;

interface VerifyMFAProps {
  resolver: MultiFactorResolver;
}

const VerifyMFA: React.FC<VerifyMFAProps> = ({ resolver }) => {
  const t = useTranslations('Auth');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');
  const router = useRouter();
  const rollbar = useRollbar();

  // Clean up reCAPTCHA on component unmount
  useEffect(() => {
    return () => {
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
  }, []);
  useEffect(() => {
    // Get the phone number from the resolver
    const hint = resolver.hints[0];
    if (hint.factorId === 'phone') {
      // @ts-ignore
      setPhoneNumber(hint.phoneNumber || '');
    }
  }, [resolver]);

  const handleTriggerMFA = useCallback(async () => {
    setError('');
    setIsLoading(true);
    
    const { verificationId, error } = await triggerVerifyMFA(resolver);
    if (error) {
      rollbar.error('MFA trigger error:', error);
      setError(t('form.mfaTriggerError'));
    } else {
      setVerificationId(verificationId);
    }
    
    setIsLoading(false);
  }, [resolver, rollbar, t]);

  const handleVerifyMFA = useCallback(async () => {
    setError('');
    setIsLoading(true);
    
    if (!verificationId) {
      setError(t('form.mfaVerificationIdMissing'));
      setIsLoading(false);
      return;
    }
    
    const { success, error } = await verifyMFA(verificationId, verificationCode, resolver);
    if (success) {
      router.push('/admin/dashboard');
    } else {
      rollbar.error('MFA verify error:', error || ' Undefined');
      setError(t('form.mfaError'));
    }
    
    setIsLoading(false);
  }, [verificationId, verificationCode, resolver, router, rollbar, t]);

  return (
    <Box>
      <Typography variant="h3">{t('verifyMFA.title')}</Typography>
      {phoneNumber && <Typography>{t('verifyMFA.phoneNumber', { phoneNumber })}</Typography>}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!verificationId ? (
        <Button 
          onClick={handleTriggerMFA} 
          variant="contained" 
          color="secondary" 
          sx={buttonStyle}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {t('verifyMFA.triggerSMS')}
        </Button>
      ) : (
        <>
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
            onClick={handleVerifyMFA} 
            variant="contained" 
            color="secondary" 
            sx={buttonStyle}
            disabled={isLoading || !verificationCode}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {t('verifyMFA.verifyCode')}
          </Button>
        </>
      )}
      <div id="recaptcha-container"></div>
    </Box>
  );
};

export default VerifyMFA;
