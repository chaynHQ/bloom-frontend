import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState } from 'react';
import { LANGUAGES, PARTNER_ACCESS_CODE_STATUS } from '../common/constants';
import { auth } from '../config/firebase';
import { useAddUserMutation, useValidateCodeMutation } from '../store/api';

const containerStyle = {
  marginY: 3,
} as const;

const RegisterForm = () => {
  const t = useTranslations('Register.form');
  const router = useRouter();

  const [formError, setFormError] = useState<string>('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);

  const [createUser, { isLoading: createIsLoading }] = useAddUserMutation();
  const [validateCode, { isLoading: validateIsLoading }] = useValidateCodeMutation();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const validateCodeResponse = await validateCode({
      partnerAccessCode: codeInput,
    });

    if (
      'error' in validateCodeResponse ||
      ('data' in validateCodeResponse &&
        validateCodeResponse.data.status !== PARTNER_ACCESS_CODE_STATUS.VALID)
    ) {
      setFormError(t('invalidCodeError'));
      return;
    }

    auth
      .createUserWithEmailAndPassword(emailInput, passwordInput)
      .then(async (userCredential) => {
        const user = userCredential.user;

        const userResponse = await createUser({
          firebaseUid: user?.uid,
          partnerAccessCode: codeInput,
          name: nameInput,
          email: emailInput,
          contactPermission: contactPermissionInput,
          languageDefault: LANGUAGES.en,
        });
        router.push('/therapy-booking');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/invalid-email') {
          setFormError(t('firebase.invalidEmail'));
        }
        if (errorCode === 'auth/weak-password') {
          setFormError(t('firebase.weakPassword'));
        }
        if (errorCode === 'auth/email-already-in-use') {
          setFormError(t('firebase.emailAlreadyInUse'));
        }
      });
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="partnerAccessCode"
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
        {formError && (
          <Typography variant="body2" component="p" color="primary.dark" mb={2}>
            {formError}
          </Typography>
        )}
        <FormControl>
          <FormControlLabel
            label={t.rich('contactPermissionLabel')}
            control={
              <Checkbox
                aria-label={t.raw('contactPermissionLabel')}
                onChange={(e) => setContactPermissionInput(e.target.value === 'true')}
              />
            }
          />
        </FormControl>

        <Button
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          fullWidth
          disabled={createIsLoading || validateIsLoading}
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
