import { useTranslations } from 'next-intl';

const containerStyle = {
  marginY: 3,
} as const;

import { CheckCircleOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { ChangeEvent, useCallback, useState } from 'react';
import { useUpdateUserMutation } from '../../app/api';
import { ErrorDisplay } from '../../constants/common';
import { EMAIL_REMINDERS_FREQUENCY } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle } from '../../styles/common';

const EmailRemindersSettingsForm = () => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [error, setError] = useState<ErrorDisplay>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedInput, setSelectedInput] = useState<EMAIL_REMINDERS_FREQUENCY>();

  const emailRemindersFrequency = useTypedSelector((state) => state.user.emailRemindersFrequency);

  const t = useTranslations('Account.accountSettings.emailRemindersSettings');
  const tS = useTranslations('Shared');

  const onInputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedInput(event.target.value as EMAIL_REMINDERS_FREQUENCY);
    if (isSuccess) {
      setIsSuccess(false);
    }
    if (error) {
      setError(undefined);
    }
  };

  const onSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      if (!selectedInput) return;

      const response = await updateUser({
        emailRemindersFrequency: selectedInput,
      });

      if ((response as any).data.id) {
        setIsSuccess(true);
        setSelectedInput(undefined);
      } else {
        setError(
          t.rich('updateError', {
            link: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );
      }
    },
    [updateUser, selectedInput, t, tS],
  );

  return (
    <form onSubmit={onSubmit}>
      <FormControl fullWidth component="fieldset" id="neurodivergent" sx={{ mt: 3 }}>
        <FormLabel component="legend">{t('fieldLabel')}</FormLabel>
        <RadioGroup
          sx={rowStyle}
          aria-label=""
          name="email-reminders-settings"
          onChange={(e) => onInputChanged(e)}
          value={selectedInput ? selectedInput : emailRemindersFrequency}
        >
          <FormControlLabel
            value={EMAIL_REMINDERS_FREQUENCY.TWO_WEEKS}
            control={<Radio />}
            label={t('twoWeeksLabel')}
          />
          <FormControlLabel
            value={EMAIL_REMINDERS_FREQUENCY.ONE_MONTH}
            control={<Radio />}
            label={t('oneMonthLabel')}
          />
          <FormControlLabel
            value={EMAIL_REMINDERS_FREQUENCY.TWO_MONTHS}
            control={<Radio />}
            label={t('twoMonthsLabel')}
          />
          <FormControlLabel
            value={EMAIL_REMINDERS_FREQUENCY.NEVER}
            control={<Radio />}
            label={t('neverLabel')}
          />
        </RadioGroup>
      </FormControl>
      {error && (
        <Typography color="error.main" mb={2}>
          {error}
        </Typography>
      )}
      <LoadingButton
        sx={{ mt: 1 }}
        variant="contained"
        fullWidth
        loading={isLoading}
        color="secondary"
        type="submit"
        endIcon={isSuccess ? <CheckCircleOutlined /> : undefined}
        disabled={!selectedInput}
      >
        {t('submitLabel')}
      </LoadingButton>
    </form>
  );
};

export default EmailRemindersSettingsForm;
