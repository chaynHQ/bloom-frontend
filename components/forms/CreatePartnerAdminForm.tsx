import LoadingButton from '@mui/lab/LoadingButton';
import { MenuItem, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { useAddPartnerAdminMutation, useGetPartnersQuery } from '../../app/api';
import { RootState } from '../../app/store';
import rollbar from '../../config/rollbar';
import {
  CREATE_PARTNER_ADMIN_ERROR,
  CREATE_PARTNER_ADMIN_REQUEST,
  CREATE_PARTNER_ADMIN_SUCCESS,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const CreatePartnerAdminForm = () => {
  const { partnerAdmin, user, partnerAccesses, partners } = useTypedSelector(
    (state: RootState) => state,
  );
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });
  useGetPartnersQuery(undefined);

  const t = useTranslations('Admin.createPartnerAdmin');
  const tS = useTranslations('Shared');

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [addPartnerAdmin, { isLoading: addPartnerAdminIsLoading }] = useAddPartnerAdminMutation();
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(CREATE_PARTNER_ADMIN_REQUEST, eventUserData);
    if (email == null || name == null) {
      setFormError('Make sure you have supplied email address and name');
      setLoading(false);
      return;
    }
    const partnerAdminResponse = await addPartnerAdmin({
      email,
      partnerId: selectedPartner,
      name,
    });

    if ('data' in partnerAdminResponse) {
      logEvent(CREATE_PARTNER_ADMIN_SUCCESS, eventUserData);
    }

    if ('error' in partnerAdminResponse) {
      const error = partnerAdminResponse.error;
      const errorMessage = getErrorMessage(error);

      logEvent(CREATE_PARTNER_ADMIN_ERROR, {
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
    setSelectedPartner('');
    setEmail(null);
    setName(null);
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

  return (
    <form autoComplete="off" onSubmit={submitHandler}>
      <TextField
        key="select-partner"
        fullWidth
        select
        label={t('partnerNameLabel')}
        onChange={(e) => setSelectedPartner(e.target.value)}
        variant="standard"
        required
        value={selectedPartner}
      >
        {partners.partners.map((option, index) => (
          <MenuItem key={`partner-name-${index}`} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        key="email-input"
        onChange={(e) => setEmail(e.target.value)}
        label={t('emailAddressLabel')}
        variant="standard"
        type="email"
        fullWidth
        required
        value={email}
      />
      <TextField
        key="name-input"
        onChange={(e) => setName(e.target.value)}
        label={t('nameLabel')}
        variant="standard"
        type="text"
        fullWidth
        required
        value={name}
      />

      {formError && <Typography color="error.main">{formError}</Typography>}

      <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
        {t('title')}
      </LoadingButton>
    </form>
  );
};

export default CreatePartnerAdminForm;
