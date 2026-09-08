'use client';

import SanitizedTextField from '@/components/common/SanitizedTextField';
import { SUPPORT_EMAIL } from '@/lib/constants/common';
import { ContactFormType, ContactFormValues, ContactPayloadContext } from '@/lib/utils/contactForm';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  BugFields,
  ContactFields,
  contactTextFieldProps,
  FeedbackFields,
  LabelledField,
} from './ContactFieldSets';
import {
  ContactSuccess,
  DeviceDataConsent,
  DialogHeader,
  HoneypotField,
  SupportSignpost,
  SwitchPrompt,
} from './ContactFormParts';
import { useContactSubmit } from './useContactSubmit';

const introStyle = { mb: 3, color: 'grey.700', lineHeight: 1.5 } as const;

const errorTextStyle = { color: 'error.main', mt: 1, fontWeight: 500 } as const;

const submitButtonStyle = { mt: 1.5, width: { xs: '100%', sm: 'auto' } } as const;

interface ContactFormBodyProps {
  type: ContactFormType;
  titleId: string;
  initialEmail: string;
  prefill?: Partial<ContactFormValues>;
  ctx: ContactPayloadContext;
  onSwitch: (type: ContactFormType) => void;
  onClose: () => void;
}

const emptyValues = (
  type: ContactFormType,
  email: string,
  prefill?: Partial<ContactFormValues>,
): ContactFormValues => ({
  formType: type,
  message: '',
  email,
  bugExpected: '',
  bugContext: '',
  bugBlocking: '',
  feedbackTags: [],
  contactReason: '',
  includeDeviceData: false,
  honeypot: '',
  ...prefill,
});

export default function ContactFormBody({
  type,
  titleId,
  initialEmail,
  prefill,
  ctx,
  onSwitch,
  onClose,
}: ContactFormBodyProps) {
  const t = useTranslations('Contact');
  const tShared = useTranslations('Contact.shared');
  const { submit, status, errorKey } = useContactSubmit(ctx);

  const [values, setValues] = useState<ContactFormValues>(() =>
    emptyValues(type, initialEmail, prefill),
  );

  // On switch (the only way `type` changes) keep the message and email but reset
  // the fields that don't apply to the new form.
  const [renderedType, setRenderedType] = useState(type);
  if (type !== renderedType) {
    setRenderedType(type);
    setValues((v) => ({ ...emptyValues(type, v.email ?? ''), message: v.message }));
  }

  const patch = (next: Partial<ContactFormValues>) =>
    setValues((current) => ({ ...current, ...next }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit(values);
  };

  if (status === 'success') {
    return (
      <>
        <DialogHeader titleId={titleId} onClose={onClose} />
        <ContactSuccess formType={type} email={values.email?.trim() ?? ''} onClose={onClose} />
      </>
    );
  }

  const submitFailed = status === 'error';

  return (
    <>
      <DialogHeader titleId={titleId} title={t(`${type}.title`)} onClose={onClose} />

      <Typography component="div" variant="body2" sx={introStyle}>
        {t(`${type}.intro`)}
      </Typography>

      {type === 'contact' && <SupportSignpost />}

      <Box
        component="form"
        autoComplete="off"
        onSubmit={handleSubmit}
        noValidate
        qa-id={`contact-form-${type}`}
      >
        {type === 'bug' && <BugFields values={values} patch={patch} />}
        {type === 'feedback' && (
          <FeedbackFields values={values} patch={patch} onSwitchToBug={() => onSwitch('bug')} />
        )}
        {type === 'contact' && <ContactFields values={values} patch={patch} />}

        <LabelledField id="email" label={tShared('emailLabel')} optional>
          <SanitizedTextField
            {...contactTextFieldProps}
            id="email"
            type="email"
            placeholder="you@example.com"
            value={values.email ?? ''}
            onChange={(v) => patch({ email: v })}
            helperText={tShared('emailHelp')}
          />
        </LabelledField>

        {type === 'bug' && (
          <DeviceDataConsent
            checked={!!values.includeDeviceData}
            onChange={(checked) => patch({ includeDeviceData: checked })}
          />
        )}

        <HoneypotField value={values.honeypot ?? ''} onChange={(v) => patch({ honeypot: v })} />

        {errorKey && !submitFailed && (
          <Typography component="div" qa-id="contact-error" role="alert" sx={errorTextStyle}>
            {tShared(errorKey)}
          </Typography>
        )}
        {submitFailed && (
          <Typography component="div" qa-id="contact-error" role="alert" sx={errorTextStyle}>
            {tShared.rich('errors.submitFailed', {
              link: (chunks) => <Link href={`mailto:${SUPPORT_EMAIL}`}>{chunks}</Link>,
            })}
          </Typography>
        )}

        <LoadingButton
          qa-id="contact-submit"
          type="submit"
          variant="contained"
          color="secondary"
          loading={status === 'submitting'}
          sx={submitButtonStyle}
        >
          {tShared('sendButton')}
        </LoadingButton>
      </Box>

      <SwitchPrompt current={type} onSwitch={onSwitch} />
    </>
  );
}
