'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import { useGetPartnersQuery, useUpdatePartnerActiveMutation } from '@/lib/api';
import {
  UPDATE_PARTNER_ACTIVE_ERROR,
  UPDATE_PARTNER_ACTIVE_REQUEST,
  UPDATE_PARTNER_ACTIVE_SUCCESS,
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

const UpdatePartnerActiveForm = () => {
  const partners = useTypedSelector((state) => state.partners);
  const rollbar = useRollbar();

  useGetPartnersQuery(undefined);

  const t = useTranslations('Admin.updatePartner');

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const [updatePartnerActive] = useUpdatePartnerActiveMutation();
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectPartner = (value: string) => {
    setLoading(true);
    setSelectedPartner(value);
    const partner = partners.find((partner) => partner.id === value);
    if (partner) {
      setIsActive(partner.isActive);
      setSelectedPartnerName(partner.name);
    }
    setIsSuccess(false);
    setLoading(false);
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(UPDATE_PARTNER_ACTIVE_REQUEST, { active: !isActive });

    const partnerResponse = await updatePartnerActive({
      id: selectedPartner,
      active: !isActive as boolean,
    });

    if (partnerResponse.data) {
      logEvent(UPDATE_PARTNER_ACTIVE_SUCCESS, { active: !isActive });
    }

    if (partnerResponse.error) {
      const error = partnerResponse.error;
      const errorMessage = getErrorMessage(error);

      logEvent(UPDATE_PARTNER_ACTIVE_ERROR, {
        active: !isActive,
        error: errorMessage,
      });
      rollbar.error(t('error') + errorMessage);

      setFormError(t('error') + errorMessage);
      setLoading(false);
      return;
    }

    setLoading(false);
    setIsSuccess(true);
  };

  const resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSuccess(false);
    setSelectedPartner('');
    setIsActive(null);
  };

  if (isSuccess) {
    return (
      <Box>
        <Typography fontWeight={500} mb={1}>
          {t.rich('successDescription', {
            status: isActive ? 'inactive' : 'active',
            partner: selectedPartnerName || 'partner',
          })}
        </Typography>
        <Typography>
          {t.rich(isActive ? 'inactiveSuccess' : 'activeSuccess', { partner: selectedPartnerName })}
        </Typography>
        <Box>
          <Button sx={{ mt: 3 }} variant="contained" color="secondary" onClick={resetForm}>
            {t('reset')}
          </Button>
        </Box>
      </Box>
    );
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
        onChange={selectPartner}
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

      {formError && <Typography color="error.main">{formError}</Typography>}

      {selectedPartner && (
        <Typography>
          {t.rich(isActive ? 'activeDescription' : 'inactiveDescription', {
            partner: selectedPartnerName,
          })}
        </Typography>
      )}
      {selectedPartner && isActive !== null && (
        <LoadingButton
          variant="contained"
          color={isActive ? 'error' : 'secondary'}
          type="submit"
          loading={loading}
          sx={{ mt: 2 }}
        >
          {t.rich(isActive ? 'activeLabel' : 'inactiveLabel', { partner: selectedPartnerName })}
        </LoadingButton>
      )}
    </form>
  );
};

export default UpdatePartnerActiveForm;
