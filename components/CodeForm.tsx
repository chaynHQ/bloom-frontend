import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import Link from '../components/Link';

interface CodeFormProps {}

const containerStyle = {
  marginY: 3,
} as const;

const CodeForm = (props: CodeFormProps) => {
  const t = useTranslations('Welcome');

  return (
    <Box sx={containerStyle}>
      <form autoComplete="off">
        <TextField
          id="partnerAccessCode"
          label={t.rich('form.codeLabel')}
          variant="standard"
          fullWidth
        />
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          fullWidth
          color="secondary"
          component={Link}
          href="/register"
        >
          {t.rich('getStarted')}
        </Button>
      </form>
    </Box>
  );
};

export default CodeForm;
