import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { useValidateCodeMutation } from '../api/partnerAccess';
import { useAddUserMutation } from '../api/user';
import { LANGUAGES } from '../common/constants';
import { firebaseAuth } from '../config/firebase';

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
  const [contactPermissionInput, setContactPermissionInput] = useState<boolean>(false);

  const [createUser, { isLoading: createIsUpdating }] = useAddUserMutation();
  const [validateCode, { isLoading: validateIsUpdating, error: validateCodeError }] =
    useValidateCodeMutation();

  const submitHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const validateCodeResponse = await validateCode({
      partnerAccessCode: codeInput,
    });
    console.log('validate code response', validateCodeResponse);

    firebaseAuth
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
        console.log('user response', userResponse);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('firebase error', errorCode, errorMessage);
      });
  };

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off">
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
        <FormControl>
          <FormControlLabel
            sx={{ fontSize: '14px' }}
            label="Can we email you for feedback on how to improve Bloom?"
            control={
              <Checkbox
                aria-label="Can we email you for feedback on how to improve Bloom?"
                onChange={(e) => setContactPermissionInput(e.target.value === 'true')}
              />
            }
          />
        </FormControl>

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
