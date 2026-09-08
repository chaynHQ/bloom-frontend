'use client';

import { CONTACT_FORM_ERROR, CONTACT_FORM_SUBMITTED } from '@/lib/constants/events';
import {
  buildContactPayload,
  ContactFormType,
  ContactFormValues,
  ContactPayloadContext,
  validateContactForm,
} from '@/lib/utils/contactForm';
import logEvent from '@/lib/utils/logEvent';
import { useRollbar } from '@rollbar/react';
import axios from 'axios';
import { useState } from 'react';

// One Zapier hook per form, so nothing depends on Zapier's paid Paths feature and
// each integration can be owned separately (docs/configure-zapier-contact-forms.md).
const WEBHOOKS: Record<ContactFormType, string | undefined> = {
  bug: process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_BUG_REPORT,
  feedback: process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_APP_FEEDBACK,
  contact: process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_CONTACT,
};

type ContactSubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export const useContactSubmit = (ctx: ContactPayloadContext) => {
  const rollbar = useRollbar();
  const [status, setStatus] = useState<ContactSubmitStatus>('idle');
  // A key under `Contact.shared`, or null when there's nothing to show.
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const submit = async (values: ContactFormValues) => {
    const validationError = validateContactForm(values);
    if (validationError) {
      setStatus('idle');
      setErrorKey(validationError.messageKey);
      return;
    }
    setErrorKey(null);

    // A real user never fills the honeypot; accept it silently and send nothing.
    if (values.honeypot) {
      setStatus('success');
      logEvent(CONTACT_FORM_SUBMITTED, {
        type: values.formType,
        source: ctx.source,
        honeypot: true,
      });
      return;
    }

    const url = WEBHOOKS[values.formType];
    if (!url) {
      setStatus('error');
      setErrorKey('errors.submitFailed');
      rollbar.error('Contact form webhook URL not configured', { formType: values.formType });
      return;
    }

    setStatus('submitting');
    try {
      // Send as text/plain to skip the CORS preflight Zapier rejects
      // (same idiom as AboutYouDemographicForm).
      await axios
        .create({ transformRequest: [(data) => JSON.stringify(data)] })
        .post(url, buildContactPayload(values, ctx));

      logEvent(CONTACT_FORM_SUBMITTED, { type: values.formType, source: ctx.source });
      setStatus('success');
    } catch (error) {
      rollbar.error('Contact form Zapier webhook error', error as Error);
      logEvent(CONTACT_FORM_ERROR, { type: values.formType });
      setStatus('error');
      setErrorKey('errors.submitFailed');
    }
  };

  return { submit, status, errorKey };
};
