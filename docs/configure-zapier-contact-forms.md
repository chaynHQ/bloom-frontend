# Contact forms → Zapier (Slack + Notion)

The in-app **bug report**, **feedback**, and **general contact** forms
(`components/contact/`) POST straight from the browser to a Zapier catch hook —
no bloom-backend involvement, so a report still lands if the backend is down.

There is **one Zap per form** (no Zapier Paths needed). Each Zap is identical in
shape; duplicate the first one twice.

## Per-form config

| Form            | Env var                                   | Suggested Slack channel | Suggested Notion database |
| --------------- | ----------------------------------------- | ----------------------- | ------------------------- |
| Bug report      | `NEXT_PUBLIC_ZAPIER_WEBHOOK_BUG_REPORT`   | `#bloom-bugs`           | Bug reports               |
| Feedback        | `NEXT_PUBLIC_ZAPIER_WEBHOOK_APP_FEEDBACK` | `#bloom-feedback`       | App feedback              |
| General contact | `NEXT_PUBLIC_ZAPIER_WEBHOOK_CONTACT`      | `#bloom-contact`        | Contact / questions       |

## Building a Zap

1. **Trigger — Webhooks by Zapier → Catch Hook.** Copy the custom webhook URL into
   the matching env var in `.env.local` and in Vercel (Preview **and**
   Production).
2. **Filter by Zapier — only continue if:**
   - `hp` (text) **is empty** — the honeypot; real users never fill it.
   - `message` (text) **contains a pattern** `.{5,}` (or length ≥ 5) — drops blank
     / accidental submits.
3. **Action — Slack → Send Channel Message** to the form's channel. Useful fields
   below.
4. **Action — Notion → Create Database Item** in the form's database. Map the
   payload fields to properties.
5. _(Optional)_ **Action — Email/Gmail** acknowledgement when `email` is not empty.

## Payload fields

Every submission is a flat JSON object of strings.

**Always present:** `form_type` (`bug` | `feedback` | `contact`), `submitted_at`
(ISO), `message`, `email` (may be empty), `page_path`, `user_id` (opaque backend
account uuid — **not** a name or email; empty if signed out), `signed_in`,
`locale`, `partner`, `app_version`, `source`, `include_device_data`, `hp`.

**Bug only:** `bug_expected`, `bug_context`, `bug_blocking` (`yes` | `no` |
`unsure` | empty).

**Feedback only:** `feedback_tags` (comma-separated).

**Contact only:** `contact_reason`.

**Device fields — only populated when `include_device_data` is `true`** (the user
ticked the opt-in checkbox): `page_url`, `device_type`, `os`, `browser`,
`browser_language`, `timezone`, `viewport`, `screen_size`. Never an IP address,
name, or precise location.

## Privacy note

`user_id` is the backend database id. It identifies the account only to someone
with database access; no name, email, Firebase uid or token is ever sent. Device
context is sent **only** on explicit opt-in. Keep the privacy policy in step with
what these Zaps store in Slack and Notion, and with their retention.

## Migration from Typeform

These forms replaced the external Typeform feedback form. The old link lived in
`FEEDBACK_FORM_URL` (`lib/constants/common.ts`), fed by
`NEXT_PUBLIC_FEEDBACK_FORM_URL` — production
`https://chayn.typeform.com/to/OY9Wdk4h`, per-locale variants in the
`Shared.feedbackTypeform` message key. Both the constant and the env var are
gone; the full old → new mapping is in
[`contact-forms-migration.md`](./contact-forms-migration.md).

`SUPPORT_EMAIL` (`tech@chayn.co`) is the one remaining direct address — the
`ContactFormBody` fallback shown if the Zapier POST itself fails.

**Vercel env vars:** add the three `NEXT_PUBLIC_ZAPIER_WEBHOOK_*` above to an
environment _before_ this branch deploys there; delete
`NEXT_PUBLIC_FEEDBACK_FORM_URL` only _after_ it is live in production. Details in
[`contact-forms-migration.md`](./contact-forms-migration.md#deployment-vercel).

### Not migrated (out of scope, intentionally external)

- User research banner (`components/banner/UserResearchBanner.tsx`) — a paid
  research recruitment Google Form.
- `CONTRIBUTING.md` contributor feedback Google Form — repo-level, not the app.
