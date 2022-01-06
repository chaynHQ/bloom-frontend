import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState } from 'react';

interface CodeFormProps {}

const containerStyle = {
  marginY: 3,
} as const;

const CodeForm = (props: CodeFormProps) => {
  const t = useTranslations('Welcome');
  const [codeInput, setCodeInput] = useState<string | null>(null);
  const router = useRouter();

  const submitHandler = () => {
    router.push({
      pathname: '/auth/register',
      query: codeInput ? { code: codeInput } : {},
    });
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off">
        <TextField
          id="accessCode"
          onChange={(e) => setCodeInput(e.target.value)}
          label={t.rich('form.codeLabel')}
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
          {t.rich('getStarted')}
        </Button>
      </form>
    </Box>
  );
};

export default CodeForm;
