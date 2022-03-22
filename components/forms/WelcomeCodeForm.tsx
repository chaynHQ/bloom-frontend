import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useState } from 'react';

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
        <Button sx={{ mt: 2 }} variant="contained" fullWidth color="secondary" type="submit">
          {t('getStarted')}
        </Button>
      </form>
    </Box>
  );
};

export default WelcomeCodeForm;
