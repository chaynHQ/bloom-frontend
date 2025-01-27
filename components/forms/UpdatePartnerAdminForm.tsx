'use client';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  debounce,
  FormControl,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useEffect, useState } from 'react';
import { UPDATE_PARTNER_ADMIN, UPDATE_PARTNER_ADMIN_ERROR } from '../../constants/events';
import { useAppDispatch, useTypedSelector } from '../../hooks/store';
import { api, useUpdatePartnerAdminMutation } from '../../lib/api';
import { GetUserDto } from '../../lib/store/userSlice';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const UpdatePartnerAdminForm = () => {
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const rollbar = useRollbar();

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const t = useTranslations('Admin.updatePartner');
  const dispatch: any = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [autocompleteInputValue, setAutocompleteInputValue] = useState<GetUserDto | null>(null);
  const [autocompleteSearchQuery, setAutocompleteSearchQuery] = useState<string>('');
  const [autocompleteSearchQueryIsLoading, setAutocompleteSearchQueryIsLoading] =
    useState<boolean>(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<Array<GetUserDto>>([]);

  const [partnerUserData, setPartnerUserData] = useState<GetUserDto | null>(null);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  useEffect(() => {
    async function getUserData() {
      setAutocompleteSearchQueryIsLoading(true);
      const searchCriteria = {
        email: autocompleteSearchQuery,
        partnerAdmin: { partnerAdminId: 'IS NOT NULL' },
        include: ['partnerAdmin'],
        limit: '10',
      };

      const result = await dispatch(
        api.endpoints.getUsers.initiate(
          {
            searchCriteria: JSON.stringify(searchCriteria),
          },
          // We don't want this request cached as a user might use this request to check their updates have worked on the form
          { forceRefetch: true },
        ),
      );

      if (result.data) {
        setAutocompleteOptions(result.data);
      }
      setAutocompleteSearchQueryIsLoading(false);
    }

    if (autocompleteSearchQuery.length > 3) {
      getUserData();
    }
  }, [autocompleteSearchQuery, dispatch]);

  const onChange = (event: SyntheticEvent<Element, Event>, value: GetUserDto | null) => {
    setAutocompleteInputValue(value);
    setPartnerUserData(value);
  };

  const onInputChange = debounce((event, value) => {
    setAutocompleteSearchQuery(value);
  }, 300);

  const getOptionLabel = (option: GetUserDto): string => {
    return option.user.email;
  };

  const [updateUserData, { isLoading }] = useUpdatePartnerAdminMutation();

  const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (partnerUserData === null || !partnerUserData.partnerAdmin) {
      setFormError(t('formError'));
      return;
    }
    setPartnerUserData({
      ...partnerUserData,
      partnerAdmin: { ...partnerUserData.partnerAdmin, active: e.target.checked },
    });
  };

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(UPDATE_PARTNER_ADMIN, eventUserData);

    if (
      partnerUserData === null ||
      !partnerUserData.partnerAdmin ||
      partnerUserData.partnerAdmin.id === null ||
      partnerUserData.partnerAdmin.active === null
    ) {
      setFormError(t('formError'));
      setLoading(false);
      return;
    }

    const updateResponse = await updateUserData({
      id: partnerUserData.partnerAdmin.id,
      active: partnerUserData.partnerAdmin.active,
    });

    if (updateResponse.error) {
      const error = updateResponse.error;
      const errorMessage = getErrorMessage(error);

      logEvent(UPDATE_PARTNER_ADMIN_ERROR, {
        ...eventUserData,
        errorMessage,
      });
      rollbar.error(t('error') + errorMessage);
      setFormError(t('error') + errorMessage);
    } else {
      setFormSubmitSuccess(true);
    }

    setLoading(false);
  };

  const resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setFormSubmitSuccess(false);
    setFormError('');
    setPartnerUserData(null);
    setAutocompleteInputValue(null);
    setAutocompleteSearchQuery('');
    setAutocompleteOptions([]);
  };

  return !formSubmitSuccess ? (
    <form autoComplete="off" onSubmit={submitHandler}>
      <Autocomplete
        id="partnerAdmin"
        componentName="partnerAdmin"
        value={autocompleteInputValue}
        onChange={onChange}
        onInputChange={onInputChange}
        getOptionLabel={getOptionLabel}
        loading={autocompleteSearchQueryIsLoading}
        blurOnSelect={true}
        options={autocompleteOptions}
        includeInputInList
        isOptionEqualToValue={(option, value) => option.user.id === value.user.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('emailLabel')}
            variant="standard"
            value={autocompleteInputValue}
          />
        )}
      />
      {partnerUserData?.partnerAdmin && (
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!partnerUserData.partnerAdmin.active}
                onChange={onCheckboxChange}
              />
            }
            label={t('activeAdminLabel')}
          />
        </FormControl>
      )}

      {formError && <Typography color="error.main">{formError}</Typography>}

      <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
        {t('title')}
      </LoadingButton>
    </form>
  ) : (
    <Box>
      <Typography>{t('successDescription')}</Typography>
      <Box>
        <Button sx={{ mt: 3 }} variant="contained" color="secondary" onClick={resetForm}>
          {t('reset')}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdatePartnerAdminForm;
