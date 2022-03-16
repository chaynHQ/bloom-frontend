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

interface CodeFormProps {
  codeParam: string;
  partnerParam: string;
}

const CodeForm = (props: CodeFormProps) => {
  const { codeParam, partnerParam } = props;
  const t = useTranslations('Welcome');

  const [codeInput, setCodeInput] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setCodeInput(codeParam);
  }, [codeParam]);

  const submitHandler = () => {
    router.push({
      pathname: '/auth/register',
      query: partnerParam
        ? { partner: partnerParam.toLocaleLowerCase(), ...(codeInput && { code: codeInput }) }
        : {},
    });
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off">
        <TextField
          id="accessCode"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          label={t.rich('form.codeLabel', { partnerName: partnerParam })}
          variant="standard"
          fullWidth
        />
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          fullWidth
          color="secondary"
          onClick={submitHandler}
        >
          {t('getStarted')}
        </Button>
      </form>
    </Box>
  );
};

export default CodeForm;
