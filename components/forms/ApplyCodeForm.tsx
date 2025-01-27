'use client';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FEEDBACK_FORM_URL } from '../../constants/common';
import { PARTNER_ACCESS_CODE_STATUS } from '../../constants/enums';
import {
  ASSIGN_NEW_PARTNER_ACCESS_ERROR,
  ASSIGN_NEW_PARTNER_ACCESS_INVALID,
  ASSIGN_NEW_PARTNER_ACCESS_REQUEST,
  ASSIGN_NEW_PARTNER_ACCESS_SUCCESS,
} from '../../constants/events';
import { useAssignPartnerAccessMutation } from '../../lib/api';
import { PartnerAccess } from '../../lib/store/partnerAccessSlice';

import { useRollbar } from '@rollbar/react';
import { ErrorDisplay } from '../../constants/common';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent from '../../utils/logEvent';

const ApplyCodeForm = () => {
  const t = useTranslations('Account.applyCode');
  const rollbar = useRollbar();

  const [codeInput, setCodeInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [newPartnerAccess, setNewPartnerAccess] = useState<PartnerAccess | null>(null);
  const [formError, setFormError] = useState<ErrorDisplay>();

  const [assignPartnerAccess] = useAssignPartnerAccessMutation();

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    logEvent(ASSIGN_NEW_PARTNER_ACCESS_REQUEST);

    const partnerAccessResponse = await assignPartnerAccess({
      partnerAccessCode: codeInput,
    });

    if (partnerAccessResponse.data) {
      const eventData = {
        new_partner: partnerAccessResponse.data.partner?.name,
        feature_courses: true,
        feature_live_chat: partnerAccessResponse.data.featureLiveChat,
        feature_therapy: partnerAccessResponse.data.featureTherapy,
        therapy_sessions_remaining: partnerAccessResponse.data.therapySessionsRemaining,
      };
      logEvent(ASSIGN_NEW_PARTNER_ACCESS_SUCCESS, eventData);
      setNewPartnerAccess(partnerAccessResponse.data);
      setLoading(false);
      setFormSubmitSuccess(true);
    }

    if (partnerAccessResponse.error) {
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
            contactLink: (children) => (
              <Link target="_blank" href={FEEDBACK_FORM_URL}>
                {children}
              </Link>
            ),
          }),
        );

        rollbar.error('Assign partner access error', partnerAccessResponse.error);

        logEvent(ASSIGN_NEW_PARTNER_ACCESS_ERROR, {
          message: error,
        });
        setLoading(false);
        throw error;
      }
      logEvent(ASSIGN_NEW_PARTNER_ACCESS_INVALID, { message: error });
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
