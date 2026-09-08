import {
  buildContactPayload,
  ContactFormValues,
  ContactPayloadContext,
  isValidEmail,
  validateContactForm,
} from './contactForm';

jest.mock('@/lib/utils/clientContext', () => ({
  getClientContext: () => ({
    browserLanguage: 'en-GB',
    timezone: 'Europe/London',
    deviceType: 'mobile',
    os: 'iOS',
    browser: 'Safari',
  }),
}));

const ctx: ContactPayloadContext = {
  pagePath: '/courses/healing',
  pageUrl: 'https://bloom.chayn.co/courses/healing?ref=x',
  locale: 'en',
  signedIn: true,
  userId: 'user-uuid-123',
  partner: 'bumble',
  appVersion: 'abc1234',
  source: 'footer_contact',
};

const values = (overrides: Partial<ContactFormValues>): ContactFormValues => ({
  formType: 'contact',
  message: 'Something is off',
  ...overrides,
});

describe('isValidEmail', () => {
  it.each([
    ['a@b.co', true],
    ['  a@b.co  ', true],
    ['no-at', false],
    ['a@b', false],
    ['', false],
  ])('%s -> %s', (input, expected) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});

describe('validateContactForm', () => {
  it('requires a message for bug and contact', () => {
    expect(validateContactForm(values({ formType: 'bug', message: '  ' }))).toEqual({
      field: 'message',
      messageKey: 'errors.messageRequired',
    });
    expect(validateContactForm(values({ formType: 'contact', message: '' }))).toEqual({
      field: 'message',
      messageKey: 'errors.messageRequired',
    });
  });

  it('accepts feedback with only a tag and no message', () => {
    expect(
      validateContactForm(values({ formType: 'feedback', message: '', feedbackTags: ['helpful'] })),
    ).toBeNull();
  });

  it('rejects feedback with neither a message nor a tag', () => {
    expect(
      validateContactForm(values({ formType: 'feedback', message: '', feedbackTags: [] })),
    ).toEqual({ field: 'message', messageKey: 'errors.feedbackEmpty' });
  });

  it('rejects a malformed email when one is given', () => {
    expect(validateContactForm(values({ email: 'bad' }))).toEqual({
      field: 'email',
      messageKey: 'errors.emailInvalid',
    });
  });

  it('passes a valid bug report with only a message', () => {
    expect(validateContactForm(values({ formType: 'bug' }))).toBeNull();
  });
});

describe('buildContactPayload', () => {
  it('includes the opaque user id and never leaks the form type fields across types', () => {
    const payload = buildContactPayload(
      values({
        formType: 'bug',
        message: 'It broke',
        bugExpected: 'It should not',
        bugBlocking: 'yes',
      }),
      ctx,
    );
    expect(payload.form_type).toBe('bug');
    expect(payload.user_id).toBe('user-uuid-123');
    expect(payload.signed_in).toBe('true');
    expect(payload.bug_expected).toBe('It should not');
    expect(payload.bug_blocking).toBe('yes');
    expect(payload.feedback_tags).toBe('');
    expect(payload.contact_reason).toBe('');
  });

  it('omits device + page_url when the opt-in is off', () => {
    const payload = buildContactPayload(values({ formType: 'bug', includeDeviceData: false }), ctx);
    expect(payload.include_device_data).toBe('false');
    expect(payload.page_url).toBe('');
    expect(payload.device_type).toBe('');
    expect(payload.browser).toBe('');
    expect(payload.page_path).toBe('/courses/healing');
  });

  it('includes coarse device context when the opt-in is on', () => {
    const payload = buildContactPayload(values({ formType: 'bug', includeDeviceData: true }), ctx);
    expect(payload.include_device_data).toBe('true');
    expect(payload.page_url).toBe('https://bloom.chayn.co/courses/healing?ref=x');
    expect(payload.device_type).toBe('mobile');
    expect(payload.os).toBe('iOS');
    expect(payload.browser).toBe('Safari');
    expect(payload.browser_language).toBe('en-GB');
    expect(payload.timezone).toBe('Europe/London');
  });

  it('only attaches device data on the bug form, never feedback or contact', () => {
    const feedback = buildContactPayload(
      values({
        formType: 'feedback',
        feedbackTags: ['helpful', 'confusing'],
        includeDeviceData: true,
      }),
      ctx,
    );
    expect(feedback.include_device_data).toBe('false');
    expect(feedback.feedback_tags).toBe('helpful,confusing');
    expect(feedback.device_type).toBe('');

    const contact = buildContactPayload(
      values({ formType: 'contact', includeDeviceData: true }),
      ctx,
    );
    expect(contact.include_device_data).toBe('false');
    expect(contact.device_type).toBe('');
    expect(contact.page_url).toBe('');
  });

  it('passes the honeypot through for the Zapier filter', () => {
    const payload = buildContactPayload(values({ honeypot: 'spam' }), ctx);
    expect(payload.hp).toBe('spam');
  });

  it('sends an empty user id when signed out', () => {
    const payload = buildContactPayload(values({}), { ...ctx, signedIn: false, userId: '' });
    expect(payload.user_id).toBe('');
    expect(payload.signed_in).toBe('false');
  });
});
