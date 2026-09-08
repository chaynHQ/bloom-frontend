# Typeform → in-app contact forms: old → new mapping

Every entry point that pointed at the old Typeform feedback form now opens the
in-app dialog (`useContactDialog().open({ type, source })` from
`components/contact/ContactDialogProvider`). See
[`configure-zapier-contact-forms.md`](./configure-zapier-contact-forms.md) for
where each `type` lands.

## Removed

| Old                                                   | Value                                                                                        | Replacement                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_FEEDBACK_FORM_URL` env var               | prod `https://chayn.typeform.com/to/OY9Wdk4h?typeform-source=bloom.chayn.co`                 | removed from code, `.env.local`, `docs/configure-env.md`. **Still set in Vercel** — see Deployment below |
| `FEEDBACK_FORM_URL` in `lib/constants/common.ts`      | `process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL \|\| '#'`                                         | deleted; `SUPPORT_EMAIL = 'tech@chayn.co'` added                                                         |
| `Shared.feedbackTypeform` message key (all 8 locales) | en/de/tr/ar `…/OY9Wdk4h`, es `…/smGSjlCo`, fr `…/WP73HFzz`, pt `…/ZGoDbg20`, hi `…/oHbPDvL2` | deleted — was unreferenced in code                                                                       |
| `FEEDBACK_FORM_LINK` in `RedesignNewsBanner.tsx`      | `https://form.typeform.com/to/OY9Wdk4h?typeform-source=chayn.typeform.com`                   | deleted                                                                                                  |

The per-locale Typeform IDs were dropped, not remapped — the dialog is fully
localised through the `Contact` message namespace.

## Deployment (Vercel)

Order matters — the new forms and the old var live on different deploys:

1. **Before this branch reaches a given environment:** add
   `NEXT_PUBLIC_ZAPIER_WEBHOOK_BUG_REPORT`, `NEXT_PUBLIC_ZAPIER_WEBHOOK_APP_FEEDBACK`,
   `NEXT_PUBLIC_ZAPIER_WEBHOOK_CONTACT` to that environment. If they are missing the
   forms render but every submit fails to the `mailto:` fallback.
2. **After this branch is live in production** (not before): delete
   `NEXT_PUBLIC_FEEDBACK_FORM_URL` from Vercel Preview **and** Production. Deleting it
   while any deploy still runs pre-migration code makes that code fall back to `'#'`.
   Leaving it set indefinitely is harmless — nothing reads it.

## Call sites

| File                                              | Trigger                              | New call                                |
| ------------------------------------------------- | ------------------------------------ | --------------------------------------- |
| `components/banner/RedesignNewsBanner.tsx`        | "Give feedback" CTA                  | `feedback` / `redesign_banner`          |
| `components/forms/LoginForm.tsx`                  | `form.getUserError` link             | `bug` / `login_error`                   |
| `components/forms/RegisterForm.tsx`               | `codeErrors.internal` link           | `bug` / `register_code_error`           |
| `components/forms/BaseRegisterForm.tsx`           | `createUserError` link (×2)          | `bug` / `register_error`                |
| `components/forms/RegisterNotesForm.tsx`          | `subscribeErrors.internal` link      | `bug` / `whatsapp_signup_error`         |
| `components/forms/ApplyCodeForm.tsx`              | `form.codeErrors.internal` link      | `bug` / `apply_code_error`              |
| `components/forms/EmailSettingsForm.tsx`          | `updateError` link                   | `bug` / `email_settings_error`          |
| `components/forms/ProfileSettingsForm.tsx`        | `updateError` link                   | `bug` / `profile_settings_error`        |
| `components/forms/EmailRemindersSettingsForm.tsx` | `updateError` link                   | `bug` / `email_reminders_error`         |
| `components/forms/WhatsappSubscribeForm.tsx`      | `subscribeErrors.alreadyExists` link | `contact` / `whatsapp_subscribe_exists` |
| `components/forms/WhatsappSubscribeForm.tsx`      | `subscribeErrors.internal` link      | `bug` / `whatsapp_subscribe_error`      |
| `components/forms/WhatsappUnsubscribeForm.tsx`    | `unsubscribeErrors.internal` link    | `bug` / `whatsapp_unsubscribe_error`    |
| `components/cards/AccountActionsCard.tsx`         | delete-account `updateError` link    | `bug` / `delete_account_error`          |
| `components/pages/DisableServiceEmailsPage.tsx`   | `error` link                         | `bug` / `disable_emails_error`          |
| `components/pages/DisableServiceEmailsPage.tsx`   | `description` prose link             | `contact` / `disable_emails`            |
| `components/guards/PartnerAdminGuard.tsx`         | `introduction` link                  | `contact` / `partner_admin_denied`      |
| `components/guards/TherapyAccessGuard.tsx`        | `introduction` link                  | `contact` / `therapy_access_denied`     |

All render inside `ContactDialogProvider` (mounted in `BaseLayout`), including the
guards and the error boundary.

## Dead links removed, not remapped

The `t.rich(...)` handler here had no matching tag in any locale string, so the
Typeform link never rendered. Simplified to plain `t(...)`:

- `components/guards/SuperAdminGuard.tsx` — `Admin.accessGuard.introduction`
- `components/cards/ProfileSettingsCard.tsx` —
  `Account.accountSettings.profileSettings.description`

## Fallback

`components/contact/ContactFormBody.tsx` `errors.submitFailed` ("email the team
directly") now points at `mailto:${SUPPORT_EMAIL}` (`tech@chayn.co`) instead of
the Typeform. This shows only if the browser → Zapier POST fails.
