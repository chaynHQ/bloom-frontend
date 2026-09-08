// Payload + validation for the in-app contact forms (components/contact/), which
// POST straight to per-form Zapier hooks with no backend in the path.
//
// Privacy: a submission identifies the reporter only by `state.user.id` (the
// opaque backend account uuid) — never a name, email or token. Coarse device
// context is added only on the bug form, and only on explicit opt-in; it reuses
// getClientContext()'s allow-listed families (no IP, location or raw user-agent).

import { getClientContext } from '@/lib/utils/clientContext';

export const CONTACT_FORM_TYPES = ['bug', 'feedback', 'contact'] as const;
export type ContactFormType = (typeof CONTACT_FORM_TYPES)[number];

export const FEEDBACK_TAGS = [
  'easy_to_use',
  'hard_to_navigate',
  'helpful',
  'confusing',
  'missing_something',
  'something_broke',
] as const;
export type FeedbackTag = (typeof FEEDBACK_TAGS)[number];

export const CONTACT_REASONS = [
  'question',
  'account_login',
  'access_code',
  'data_request',
  'partner',
  'other',
] as const;
export type ContactReason = (typeof CONTACT_REASONS)[number];

export const BUG_BLOCKING_OPTIONS = ['yes', 'no', 'unsure'] as const;
export type BugBlocking = (typeof BUG_BLOCKING_OPTIONS)[number];

export interface ContactFormValues {
  formType: ContactFormType;
  message: string;
  bugExpected?: string;
  bugContext?: string;
  bugBlocking?: BugBlocking | '';
  feedbackTags?: FeedbackTag[];
  contactReason?: ContactReason | '';
  email?: string;
  includeDeviceData?: boolean; // bug form only
  honeypot?: string;
}

export interface ContactPayloadContext {
  pagePath: string;
  pageUrl: string;
  locale: string;
  signedIn: boolean;
  userId: string;
  partner: string;
  appVersion: string;
  source: string;
}

export interface ContactValidationError {
  field: 'message' | 'email';
  messageKey: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

// Feedback accepts a tag-only submission; bug and contact need a written message.
export function validateContactForm(values: ContactFormValues): ContactValidationError | null {
  const message = values.message?.trim() ?? '';
  const email = values.email?.trim() ?? '';

  if (values.formType === 'feedback') {
    if (!message && !(values.feedbackTags?.length ?? 0)) {
      return { field: 'message', messageKey: 'errors.feedbackEmpty' };
    }
  } else if (!message) {
    return { field: 'message', messageKey: 'errors.messageRequired' };
  }

  if (email && !isValidEmail(email)) {
    return { field: 'email', messageKey: 'errors.emailInvalid' };
  }

  return null;
}

const bool = (value: boolean) => (value ? 'true' : 'false');

function viewportSize(): string {
  return typeof window === 'undefined' ? '' : `${window.innerWidth}x${window.innerHeight}`;
}

function screenSize(): string {
  return typeof window === 'undefined' || !window.screen
    ? ''
    : `${window.screen.width}x${window.screen.height}`;
}

// A flat, all-string object: Zapier hooks flatten cleanly and each field maps
// straight to a Slack merge tag or Notion property.
export function buildContactPayload(
  values: ContactFormValues,
  ctx: ContactPayloadContext,
): Record<string, string> {
  const isBug = values.formType === 'bug';
  const withDevice = isBug && !!values.includeDeviceData;
  const client = withDevice ? getClientContext() : {};
  const deviceField = (value: string | undefined) => (withDevice ? (value ?? '') : '');

  return {
    form_type: values.formType,
    submitted_at: new Date().toISOString(),
    message: values.message.trim(),

    bug_expected: isBug ? (values.bugExpected?.trim() ?? '') : '',
    bug_context: isBug ? (values.bugContext?.trim() ?? '') : '',
    bug_blocking: isBug ? (values.bugBlocking ?? '') : '',
    feedback_tags: values.formType === 'feedback' ? (values.feedbackTags ?? []).join(',') : '',
    contact_reason: values.formType === 'contact' ? (values.contactReason ?? '') : '',
    email: values.email?.trim() ?? '',

    include_device_data: bool(withDevice),
    page_path: ctx.pagePath,
    page_url: withDevice ? ctx.pageUrl : '',
    device_type: deviceField(client.deviceType),
    os: deviceField(client.os),
    browser: deviceField(client.browser),
    browser_language: deviceField(client.browserLanguage),
    timezone: deviceField(client.timezone),
    viewport: withDevice ? viewportSize() : '',
    screen_size: withDevice ? screenSize() : '',

    user_id: ctx.userId,
    locale: ctx.locale,
    signed_in: bool(ctx.signedIn),
    partner: ctx.partner,
    app_version: ctx.appVersion,
    source: ctx.source,
    hp: values.honeypot?.trim() ?? '',
  };
}
