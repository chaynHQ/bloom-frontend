'use client';

import { usePathname } from '@/i18n/routing';
import { useUpdateUserMutation } from '@/lib/api';
import { ErrorDisplay, FEEDBACK_FORM_URL } from '@/lib/constants/common';
import { EMAIL_REMINDERS_FREQUENCY } from '@/lib/constants/enums';
import {
  EMAIL_REMINDERS_SET_ERROR,
  EMAIL_REMINDERS_SET_REQUEST,
  EMAIL_REMINDERS_SET_SUCCESS,
  EMAIL_REMINDERS_UNSET_ERROR,
  EMAIL_REMINDERS_UNSET_REQUEST,
  EMAIL_REMINDERS_UNSET_SUCCESS,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';
import { CheckCircleOutlined } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

const radioGroupStyle = {
  ...rowStyle,
  columnGap: 2,
  label: {
    minWidth: '50%',
    marginRight: 0,
  },
  '.MuiRadio-root': {
    paddingY: 0.75,
  },
} as const;

interface EmailRemindersSettingsFormControlProps {
  selectedInput: EMAIL_REMINDERS_FREQUENCY | undefined;
  setSelectedInput: Dispatch<SetStateAction<EMAIL_REMINDERS_FREQUENCY | undefined>>;
}

export const EmailRemindersSettingsFormControl = (
  props: EmailRemindersSettingsFormControlProps,
) => {
  const { selectedInput, setSelectedInput } = props;

  const emailRemindersFrequency = useTypedSelector((state) => state.user.emailRemindersFrequency);
  const t = useTranslations('Account.accountSettings.emailRemindersSettings');

  return (
    <FormControl fullWidth component="fieldset" id="email-reminders-settings" sx={{ mt: 3, mb: 1 }}>
      <FormLabel sx={{ mb: 0.5 }}>{t('fieldLabel')}</FormLabel>
      <RadioGroup
        sx={radioGroupStyle}
        aria-label=""
        name="email-reminders-settings"
        onChange={(e) => setSelectedInput(e.target.value as EMAIL_REMINDERS_FREQUENCY)}
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
  );
};

const EmailRemindersSettingsForm = () => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [error, setError] = useState<ErrorDisplay>();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedInput, setSelectedInput] = useState<EMAIL_REMINDERS_FREQUENCY>();

  const pathname = usePathname();
  const t = useTranslations('Account.accountSettings.emailRemindersSettings');

  useEffect(() => {
    // Reset success and error states if new input selected
    if (selectedInput) {
      if (isSuccess) {
        setIsSuccess(false);
      }
      if (error) {
        setError(undefined);
      }
    }
  }, [selectedInput, isSuccess, error]);

  const onSubmit = useCallback(
    async (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      if (!selectedInput) return;

      const eventData = {
        frequency: selectedInput,
        origin_url: pathname,
      };

      const setOn = selectedInput !== EMAIL_REMINDERS_FREQUENCY.NEVER;
      logEvent(setOn ? EMAIL_REMINDERS_SET_REQUEST : EMAIL_REMINDERS_UNSET_REQUEST, eventData);

      const response = await updateUser({
        emailRemindersFrequency: selectedInput,
      });

      if ((response as any).data.id) {
        setIsSuccess(true);
        setSelectedInput(undefined);
        logEvent(setOn ? EMAIL_REMINDERS_SET_SUCCESS : EMAIL_REMINDERS_UNSET_SUCCESS, eventData);
      } else {
        setError(
          t.rich('updateError', {
            link: (children) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {children}
              </Link>
            ),
          }),
        );
        logEvent(setOn ? EMAIL_REMINDERS_SET_ERROR : EMAIL_REMINDERS_UNSET_ERROR, eventData);
      }
    },
    [updateUser, selectedInput, pathname, t],
  );

  const showUpdateLaterMessage = pathname !== '/account/settings' && !error;

  return (
    <form onSubmit={onSubmit}>
      <EmailRemindersSettingsFormControl
        selectedInput={selectedInput}
        setSelectedInput={setSelectedInput}
      />
      {error && (
        <Typography variant="body2" color={'error.main'}>
          {error}
        </Typography>
      )}
      {showUpdateLaterMessage && <Typography variant="body2">{t('update')}</Typography>}

      <LoadingButton
        qa-id="email-reminders-settings-submit"
        sx={{ mt: 3 }}
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
