'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import { useAddPartnerAdminMutation, useGetPartnersQuery } from '@/lib/api';
import {
  CREATE_PARTNER_ADMIN_ERROR,
  CREATE_PARTNER_ADMIN_REQUEST,
  CREATE_PARTNER_ADMIN_SUCCESS,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, MenuItem, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';

const CreatePartnerAdminForm = () => {
  const partners = useTypedSelector((state) => state.partners);
  const rollbar = useRollbar();

  useGetPartnersQuery(undefined);

  const t = useTranslations('Admin.createPartnerAdmin');

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [email, setEmail] = useState<string | null>('');
  const [name, setName] = useState<string | null>('');

  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [addPartnerAdmin] = useAddPartnerAdminMutation();
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(CREATE_PARTNER_ADMIN_REQUEST);
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

    if (partnerAdminResponse.data) {
      logEvent(CREATE_PARTNER_ADMIN_SUCCESS);
    }

    if (partnerAdminResponse.error) {
      const error = partnerAdminResponse.error;
      const errorMessage = getErrorMessage(error);

      logEvent(CREATE_PARTNER_ADMIN_ERROR, {
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
      <SanitizedTextField
        id="selectPartner"
        name="selectPartner"
        key="select-partner"
        fullWidth
        select
        label={t('partnerNameLabel')}
        onChange={setSelectedPartner}
        variant="standard"
        required
        value={selectedPartner}
      >
        {partners.map((option, index) => (
          <MenuItem key={`partner-name-${index}`} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </SanitizedTextField>

      <SanitizedTextField
        id="email"
        name="email"
        key="email-input"
        onChange={setEmail}
        label={t('emailAddressLabel')}
        variant="standard"
        type="email"
        fullWidth
        required
        value={email}
      />
      <SanitizedTextField
        id="name"
        name="name"
        key="name-input"
        onChange={setName}
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
