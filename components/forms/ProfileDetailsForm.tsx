import { Box, TextField, Container, Typography } from '@mui/material';
import Link from '../common/Link';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { useTypedSelector } from '../../hooks/store';
import { LoadingButton } from '@mui/lab';
import { getAuth, verifyBeforeUpdateEmail } from 'firebase/auth';
import { useUpdateUserMutation } from '../../app/api';
import { ReactElement, JSXElementConstructor, ReactNode, useCallback } from "react"

const containerStyle = {
  marginY: 3,
} as const;


const onEmailUpdate = (newEmail: string) => {
  const auth = getAuth()
  const currUser = auth.currentUser

  if (currUser === null) {
    return
  }

  verifyBeforeUpdateEmail(currUser, newEmail).then((res) => {
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
}

type Err = string | ReactElement<any, string | JSXElementConstructor<any>> | ReactNode | null

const ProfileDetailsForm = () => {
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const [error, setError] = useState<Err>(null);

  const name = useTypedSelector(state => state.user.name)
  const email = useTypedSelector(state => state.user.email)

  const [nameInput, setNameInput] = useState<string>(name ?? "");
  const [emailInput, setEmailInput] = useState<string>(email ?? "");

  const tA = useTranslations('Account.accountSettings.form');

  const onUserUpdate = ({ name, email }: { name?: string, email?: string }) => {
    try {
      updateUser({ name, email })
      if (email) {
        onEmailUpdate(email)
      }
    } catch (error) {
      setError(error?.toString());
    }
  }

  const onSubmit = useCallback(async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    setError(null)
    onUserUpdate({ name: nameInput, email: emailInput })
  }, [])

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" onSubmit={onSubmit} >
        <TextField
          id="name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          label={tA('nameLabel')}
          variant="standard"
          fullWidth
          required
        />
        <TextField
          id="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          label={tA('emailLabel')}
          variant="standard"
          type="email"
          fullWidth
          required
        />
        <LoadingButton
          sx={{ mt: 2, mr: 1.5, }}
          variant="contained"
          fullWidth
          loading={isLoading}
          color="secondary"
          type="submit"
        >
          {tA('saveProfile')}
        </LoadingButton>
        {error && (
          <Container>
            <Typography>{error}</Typography>
          </Container>
        )}
      </form>
    </Box>
  );
};

export default ProfileDetailsForm;
