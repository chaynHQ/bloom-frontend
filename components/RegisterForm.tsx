import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { useValidateCodeMutation } from '../api/partnerAccess';
import { useAddUserMutation } from '../api/user';

interface RegisterFormProps {}

const containerStyle = {
  marginY: 3,
} as const;

const RegisterForm = (props: RegisterFormProps) => {
  const t = useTranslations('Register.form');

  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  const [createUser, { isLoading: createIsUpdating }] = useAddUserMutation();
  const [validateCode, { isLoading: validateIsUpdating, error: validateCodeError }] =
    useValidateCodeMutation();

  const submitHandler = async () => {
    const validateCodeResponse = await validateCode({
      code: codeInput,
    });
    console.log('res1', validateCodeResponse);

    if (validateCodeResponse.error) {
    } else {
      const result2 = await createUser({
        code: codeInput,
        name: nameInput,
        email: emailInput,
      });
      console.log('res2', result2);
    }
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off">
        <TextField
          id="code"
          onChange={(e) => setCodeInput(e.target.value)}
          label={t.rich('codeLabel')}
          variant="standard"
          fullWidth
          required
        />
        <TextField
          id="name"
          onChange={(e) => setNameInput(e.target.value)}
          label={t.rich('nameLabel')}
          variant="standard"
          fullWidth
          required
        />
        <TextField
          id="email"
          onChange={(e) => setEmailInput(e.target.value)}
          label={t.rich('emailLabel')}
          variant="standard"
          fullWidth
          required
        />
        <TextField
          id="password"
          onChange={(e) => setPasswordInput(e.target.value)}
          label={t.rich('passwordLabel')}
          type="password"
          variant="standard"
          fullWidth
          required
        />
        <Button
          onClick={submitHandler}
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          disabled={createIsUpdating}
          color="secondary"
          type="submit"
        >
          {t.rich('submit')}
        </Button>
      </form>
    </Box>
  );
};

export default RegisterForm;
