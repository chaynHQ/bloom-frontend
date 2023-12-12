import { Box, Button, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { generatePartnerPromoGetStartedEvent } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  marginY: 3,
} as const;

interface WelcomeCodeFormProps {
  codeParam: string;
  partnerParam: string;
}

const WelcomeCodeForm = (props: WelcomeCodeFormProps) => {
  const { codeParam, partnerParam } = props;
  const t = useTranslations('Welcome');

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const [codeInput, setCodeInput] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setCodeInput(codeParam);
  }, [codeParam]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push({
      pathname: '/auth/register',
      ...(partnerParam && {
        query: { partner: partnerParam.toLocaleLowerCase(), ...(codeInput && { code: codeInput }) },
      }),
    });
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="accessCode"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          label={t.rich('form.codeLabel', { partnerName: partnerParam })}
          variant="standard"
          fullWidth
        />

        <Button
          onClick={() => {
            logEvent(generatePartnerPromoGetStartedEvent(partnerParam), eventUserData);
          }}
          sx={{ mt: 2 }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
        >
          {t('getStarted')}
        </Button>
      </form>
    </Box>
  );
};

export default WelcomeCodeForm;
