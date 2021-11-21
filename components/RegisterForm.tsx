import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import * as React from 'react';

interface RegisterFormProps {}

const containerStyle = {
  marginY: 3,
} as const;

const RegisterForm = (props: RegisterFormProps) => {
  const t = useTranslations('Register.form');

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off">
        <TextField id="code" label={t.rich('codeLabel')} variant="standard" fullWidth />
        <TextField id="name" label={t.rich('nameLabel')} variant="standard" fullWidth />
        <TextField id="email" label={t.rich('emailLabel')} variant="standard" fullWidth />
        <TextField
          id="password"
          label={t.rich('passwordLabel')}
          type="password"
          variant="standard"
          fullWidth
        />
        <Button sx={{ mt: 2, mr: 1.5 }} variant="contained" fullWidth color="secondary">
          {t.rich('submit')}
        </Button>
      </form>
    </Box>
  );
};

export default RegisterForm;
