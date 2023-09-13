import LoadingButton from '@mui/lab/LoadingButton';
import { Autocomplete, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import rollbar from '../../config/rollbar';
import { useGetUsersWithPartnerAccessCodesQuery, useUpdateAccessCodeTherapySessionCountMutation } from '../../app/api';
import {
  UPDATE_THERAPY_SESSIONS,
  UPDATE_THERAPY_SESSIONS_ERROR,
  CREATE_PARTNER_ACCESS_SUCCESS,
} from '../../constants/events';
import { RootState } from '../../app/store';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { getErrorMessage } from '../../utils/errorMessage';

const UpdateTherapyAdminForm = () => {
  const { user } = useTypedSelector(
    (state: RootState) => state,
  );

  const eventUserData = getEventUserData({ user });

  const t = useTranslations('Admin.updateTherapy');
  const tS = useTranslations('Shared');

  const [loading, setLoading] = useState<boolean>(false);
  const [partnerAccessCode, setPartnerAccessCode] = useState<string | null>(null);
  const [therapySessions, setTherapySessions] = useState<string | null>(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [updateTherapySessions, { isLoading: updateTherapySessionsIsLoading }] = useUpdateAccessCodeTherapySessionCountMutation();

  // useGetUsersWithPartnerAccessCodesQuery(undefined);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(UPDATE_THERAPY_SESSIONS, eventUserData);
    if (partnerAccessCode == null || therapySessions == null) {
      setFormError('Make sure you have selected a user');
      setLoading(false);
      return;
    }

    const updateTherapyResponse = await updateTherapySessions({
      partnerAccessCode,
      therapySessions,
    });

    if ('error' in updateTherapyResponse) {
      const error = updateTherapyResponse.error;
      const errorMessage = getErrorMessage(error);

      logEvent(UPDATE_THERAPY_SESSIONS_ERROR, {
        ...eventUserData,
        error: errorMessage,
      });
      rollbar.error(t('error') + errorMessage);

      setFormError(t('error') + errorMessage);
      setLoading(false);
      return;
    }

    setLoading(false);
    setFormSubmitSuccess(true);
  };

  const resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setFormSubmitSuccess(false);
    setPartnerAccessCode(null);
    setTherapySessions(null);
  };

  const FormResetButton = () => (
    <Box>
      <Button sx={{ mt: 3 }} variant="contained" color="secondary" onClick={resetForm}>
        {t('reset')}
      </Button>
    </Box>
  );

  const FormSuccess = () => (
    <Box>
      <Typography>{t('successDescription')}</Typography>
      <FormResetButton />
    </Box>
  );

  if (formSubmitSuccess) {
    return <FormSuccess />;
  }

  const testOptions = [
    {
      "useremail": "cypresstestemail+1692971717797@chayn.co",
      "therapytotal": "7",
      "partneraccesscode": "WG965E"
    },
    {
      "useremail": "cypresstestemail+1691059115800@chayn.co",
      "therapytotal": "6",
      "partneraccesscode": "T0WF5S"
    }
  ]

  const userOnChange = (e, v) => {
    setTherapySessions(v?.total || null);
    setPartnerAccessCode(v?.id || null);
  }


  return (
    <form autoComplete="off" onSubmit={submitHandler}>
      <Autocomplete
        options={testOptions.map((option) => {
            return {
              label: option.useremail, 
              id: option.partneraccesscode,
              total: option.therapytotal
            }
          }
        )}
        onChange={userOnChange}
        id="User-email-address"
        autoComplete
        includeInputInList
        renderInput={(params) => (
          <TextField {...params} label={t('emailLabel')} variant="standard" />
        )}
      />

      <TextField
        key="therapy-sessions-count"
        onChange={(e) => setTherapySessions(e.target.value)}
        label= {t('sessionsLabel')}
        variant="standard"
        type="number"
        fullWidth
        required
        inputProps={{ min:0, max:20 }}
        value={therapySessions}
      />

      {formError && <Typography color="error.main">{formError}</Typography>}

      <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
        {t('title')}
      </LoadingButton>
    </form>
  );
};

export default UpdateTherapyAdminForm;
