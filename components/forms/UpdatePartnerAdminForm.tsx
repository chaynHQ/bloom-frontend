import {
  Autocomplete,
  Checkbox,
  debounce,
  FormControl,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { GetUserDto } from '../../app/userSlice';
import LoadingButton from '@mui/lab/LoadingButton';
import { useTranslations } from 'next-intl';
import { api } from '../../app/api';
import { useAppDispatch } from '../../hooks/store';

const UpdatePartnerAdminForm = () => {
  const t = useTranslations('Admin.updatePartner');
  const dispatch: any = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [autocompleteInputValue, setAutocompleteInputValue] = useState<GetUserDto | null>(null);
  const [autocompleteSearchQuery, setAutocompleteSearchQuery] = useState<string>('');
  const [autocompleteSearchQueryIsLoading, setAutocompleteSearchQueryIsLoading] =
    useState<boolean>(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<Array<GetUserDto>>([]);

  const [partnerUserData, setPartnerUserData] = useState<GetUserDto | null>(null);
  useEffect(() => {
    async function getUserData() {
      setAutocompleteSearchQueryIsLoading(true);
      const searchCriteria = {
        email: autocompleteSearchQuery,
        partnerAdmin: { partnerAdminId: 'IS NOT NULL' },
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

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log('submit');
    event.preventDefault();
    // TODO: Implement the update logic
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

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
      {partnerUserData && (
        <FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={partnerUserData.user.isActive}
                onChange={(e) =>
                  setPartnerUserData({
                    ...partnerUserData,
                    user: { ...partnerUserData.user, isActive: e.target.checked },
                  })
                }
              />
            }
            label={t('activeAdminLabel')}
          />
        </FormControl>
      )}

      {/*  TODO: error message here */}

      <LoadingButton variant="contained" color="secondary" type="submit" loading={loading}>
        {t('title')}
      </LoadingButton>
    </form>
  );
};

export default UpdatePartnerAdminForm;
