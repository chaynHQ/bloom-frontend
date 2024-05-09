import { Box, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';

const containerStyle = {
  marginY: 3,
} as const;

const ProfileDetailsForm = () => {
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const tA = useTranslations('Account.accountSettings.form');

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off" >
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
      </form>
    </Box>
  );
};

export default ProfileDetailsForm;
