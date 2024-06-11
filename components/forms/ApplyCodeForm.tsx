import LoadingButton from '@mui/lab/LoadingButton';
import { Box, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAssignPartnerAccessMutation } from '../../app/api';
import { PartnerAccess } from '../../app/partnerAccessSlice';
import { PARTNER_ACCESS_CODE_STATUS } from '../../constants/enums';
import {
  ASSIGN_NEW_PARTNER_ACCESS_ERROR,
  ASSIGN_NEW_PARTNER_ACCESS_INVALID,
  ASSIGN_NEW_PARTNER_ACCESS_REQUEST,
  ASSIGN_NEW_PARTNER_ACCESS_SUCCESS,
} from '../../constants/events';

import { useTypedSelector } from '../../hooks/store';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const ApplyCodeForm = () => {
  const t = useTranslations('Account.applyCode');
  const tS = useTranslations('Shared');

  const [eventUserData, setEventUserData] = useState<any>(null);
  const [codeInput, setCodeInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [newPartnerAccess, setNewPartnerAccess] = useState<PartnerAccess | null>(null);
  const [formError, setFormError] = useState<
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  >();
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const [assignPartnerAccess, { isLoading: assignPartnerAccessIsLoading }] =
    useAssignPartnerAccessMutation();

  useEffect(() => {
    setEventUserData(getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin));
  }, [userCreatedAt, partnerAccesses, partnerAdmin]);

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(ASSIGN_NEW_PARTNER_ACCESS_REQUEST, eventUserData);

    const partnerAccessResponse = await assignPartnerAccess({
      partnerAccessCode: codeInput,
    });

    if ('data' in partnerAccessResponse) {
      const eventData = {
        new_partner: partnerAccessResponse.data.partner?.name,
        feature_courses: true,
        feature_live_chat: partnerAccessResponse.data.featureLiveChat,
        feature_therapy: partnerAccessResponse.data.featureTherapy,
        therapy_sessions_remaining: partnerAccessResponse.data.therapySessionsRemaining,
      };
      logEvent(ASSIGN_NEW_PARTNER_ACCESS_SUCCESS, { ...eventUserData, ...eventData });
      setNewPartnerAccess(partnerAccessResponse.data);
      setLoading(false);
      setFormSubmitSuccess(true);
    }

    if ('error' in partnerAccessResponse) {
      const error = getErrorMessage(partnerAccessResponse.error);

      if (error === PARTNER_ACCESS_CODE_STATUS.ALREADY_IN_USE) {
        setFormError(t('form.codeErrors.alreadyInUse'));
      } else if (error === PARTNER_ACCESS_CODE_STATUS.ALREADY_APPLIED) {
        setFormError(t('form.codeErrors.alreadyApplied'));
      } else if (error === PARTNER_ACCESS_CODE_STATUS.CODE_EXPIRED) {
        setFormError(t('form.codeErrors.expired'));
      } else if (
        error === PARTNER_ACCESS_CODE_STATUS.DOES_NOT_EXIST ||
        PARTNER_ACCESS_CODE_STATUS.INVALID_CODE
      ) {
        setFormError(t('form.codeErrors.invalid'));
      } else {
        setFormError(
          t.rich('form.codeErrors.internal', {
            contactLink: (children) => <Link href={tS('feedbackTypeform')}>{children}</Link>,
          }),
        );

        (window as any).Rollbar?.error('Assign partner access error', partnerAccessResponse.error);
        logEvent(ASSIGN_NEW_PARTNER_ACCESS_ERROR, {
          ...eventUserData,
          message: error,
        });
        setLoading(false);
        throw error;
      }
      logEvent(ASSIGN_NEW_PARTNER_ACCESS_INVALID, { ...eventUserData, message: error });
      setLoading(false);
      throw error;
    }
  };

  if (formSubmitSuccess && newPartnerAccess)
    return (
      <Box>
        <Typography mb={2}>{t('formSuccess.success')}</Typography>
        <Typography>{t('formSuccess.successLine2')}</Typography>
        <ul>
          <li key="courses-item">{t('formSuccess.courses')}</li>
          {newPartnerAccess?.featureTherapy && (
            <li key="therapy-item">
              {t.rich('formSuccess.therapy', {
                therapySessionsRemaining: newPartnerAccess.therapySessionsRemaining,
              })}
            </li>
          )}
          {newPartnerAccess?.featureLiveChat && (
            <li key="chat-item">{t('formSuccess.liveChat')}</li>
          )}
        </ul>
      </Box>
    );

  return (
    <Box>
      <Typography mb={2}>{t('formIntroduction')}</Typography>

      <form autoComplete="off" onSubmit={submitHandler}>
        <TextField
          id="accessCode"
          onChange={(e) => setCodeInput(e.target.value)}
          label={t.rich('form.codeLabel')}
          variant="standard"
          fullWidth
          required
        />
        {formError && (
          <Typography color="error.main" mb={2}>
            {formError}
          </Typography>
        )}
        <LoadingButton
          sx={{ mt: 2 }}
          variant="contained"
          fullWidth
          color="secondary"
          type="submit"
          loading={loading}
        >
          {t('form.submitLabel')}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default ApplyCodeForm;
