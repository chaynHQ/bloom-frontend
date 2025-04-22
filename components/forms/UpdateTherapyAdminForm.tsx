'use client';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { api, useUpdatePartnerAccessMutation } from '@/lib/api';
import { UPDATE_THERAPY_SESSIONS, UPDATE_THERAPY_SESSIONS_ERROR } from '@/lib/constants/events';
import { useAppDispatch } from '@/lib/hooks/store';
import { GetUserDto } from '@/lib/store/userSlice';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent from '@/lib/utils/logEvent';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Autocomplete,
  Box,
  Button,
  debounce,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import { SyntheticEvent, useEffect, useState } from 'react';

const UpdateTherapyAdminForm = () => {
  const t = useTranslations('Admin.updateTherapy');
  const rollbar = useRollbar();
  const dispatch: any = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  // State for the autocomplete component
  const [autocompleteInputValue, setAutocompleteInputValue] = useState<GetUserDto | null>(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState<Array<GetUserDto>>([]);
  const [autocompleteSearchQuery, setAutocompleteSearchQuery] = useState<string>('');
  const [autocompleteSearchQueryIsLoading, setAutocompleteSearchQueryIsLoading] =
    useState<boolean>(false);

  const [therapySessionUserData, setTherapySessionUserData] = useState<GetUserDto | null>(null);
  const [therapySessionAdjustmentValue, setTherapySessionAdjustmentValue] = useState<number>(0);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<
    string | React.ReactNode[] | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();

  useEffect(() => {
    async function getUserData() {
      setAutocompleteSearchQueryIsLoading(true);
      const searchCriteria = {
        email: autocompleteSearchQuery,
        partnerAccess: { featureTherapy: true as true, active: true as true },
        include: ['partnerAccess'],
        limit: 10,
      };

      const result = await dispatch(
        api.endpoints.getUsers.initiate(
          { searchCriteria: JSON.stringify(searchCriteria) },

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
    setTherapySessionAdjustmentValue(0);
    setAutocompleteInputValue(value);
    setTherapySessionUserData(value);
  };

  const onInputChange = debounce((event, value) => {
    setAutocompleteSearchQuery(value);
  }, 300);

  const getOptionLabel = (option: GetUserDto): string => {
    return option.user.email;
  };

  const [updateTherapySessions] = useUpdatePartnerAccessMutation();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(UPDATE_THERAPY_SESSIONS);

    if (therapySessionUserData == null || therapySessionAdjustmentValue == 0) {
      setFormError('Make sure you have selected a user or changed the value');
      setLoading(false);
      return;
    }

    const partnerAccessCode = therapySessionUserData.partnerAccesses.find(
      (pa) => pa.featureTherapy,
    );

    if (partnerAccessCode) {
      const updateTherapyResponse = await updateTherapySessions({
        id: partnerAccessCode.id,
        therapySessionsRemaining:
          partnerAccessCode.therapySessionsRemaining + therapySessionAdjustmentValue,
      });

      if (updateTherapyResponse.error) {
        const error = updateTherapyResponse.error;
        const errorMessage = getErrorMessage(error);

        logEvent(UPDATE_THERAPY_SESSIONS_ERROR, {
          error: errorMessage,
        });
        rollbar.error(t('error') + errorMessage);

        setFormError(t('error') + errorMessage);
        setLoading(false);
        return;
      }
      setLoading(false);
      setFormSubmitSuccess(true);
    } else {
      setFormError('Error - User has no therapy access');
      setLoading(false);
    }
  };

  const resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setFormSubmitSuccess(false);
    setTherapySessionAdjustmentValue(0);
    setTherapySessionUserData(null);
    setAutocompleteInputValue(null);
    setAutocompleteSearchQuery('');
    setAutocompleteOptions([]);
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
      <Autocomplete
        value={autocompleteInputValue}
        onChange={onChange}
        onInputChange={onInputChange}
        getOptionLabel={getOptionLabel}
        loading={autocompleteSearchQueryIsLoading}
        blurOnSelect={true}
        options={autocompleteOptions}
        id="user-email-address-search"
        includeInputInList
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('emailLabel')}
            variant="standard"
            value={autocompleteInputValue}
          />
        )}
      />
      {therapySessionUserData && (
        <TherapySessionField
          user={therapySessionUserData}
          onAdd={() => {
            setTherapySessionAdjustmentValue(therapySessionAdjustmentValue + 1);
          }}
          onRemove={() => {
            setTherapySessionAdjustmentValue(therapySessionAdjustmentValue - 1);
          }}
          therapySessionAdjustmentValue={therapySessionAdjustmentValue}
        />
      )}

      {formError && <Typography color="error.main">{formError}</Typography>}

      <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
        {t('title')}
      </LoadingButton>
    </form>
  );
};

const TherapySessionField = ({
  user,
  onAdd,
  onRemove,
  therapySessionAdjustmentValue,
}: {
  user: GetUserDto;
  onAdd: () => void;
  onRemove: () => void;
  therapySessionAdjustmentValue: number;
}) => {
  const t = useTranslations('Admin.updateTherapy');

  const email = user.user.email;
  const therapySessionsRedeemed = user.partnerAccesses.reduce((accCount, pa) => {
    return accCount + pa.therapySessionsRedeemed;
  }, 0);
  const therapySessionsRemaining = user.partnerAccesses.reduce((accCount, pa) => {
    return accCount + pa.therapySessionsRemaining;
  }, 0);
  const therapySessionsTotal = therapySessionsRedeemed + therapySessionsRemaining;
  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="caption">{email}</Typography>
      </Grid>

      <Grid item xs={6}>
        <Typography> {t('therapySessionsRedeemed')}: </Typography>
      </Grid>
      <Grid item xs={6}>
        {therapySessionsRedeemed}
      </Grid>
      <Grid item xs={6}>
        <Typography> {t('therapySessionsTotal')}: </Typography>
      </Grid>
      <Grid item xs={6}>
        {therapySessionsTotal + therapySessionAdjustmentValue}
      </Grid>
      <Grid item xs={12}>
        <IconButton onClick={onRemove} aria-label="delete">
          <RemoveIcon />
        </IconButton>
        <IconButton aria-label="add" onClick={onAdd}>
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
export default UpdateTherapyAdminForm;
