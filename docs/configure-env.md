# Configure Environment Variables

## Summary

The frontend and backend each have required and optional environment variables. Required variables are necessary for local development, and optional variables are for specific features.

_Note: Variables provided by Chayn are public, not linked to production, and subject to change at any time. Check for updates if you are experiencing problems. The absence of some optional environment variables may result in test failures. If you require an optional environment variable and cannot acquire it yourself (some must be connected to Chayn in some way), please reach out to the team in GitHub’s issue discussions._

## Directions

Create a new `.env.local` file and fill it with the required environment variables:

```
# Variables for building, unit tests, and integration tests.
# Provided variables are read-only and subject to change.
#====================================================================
# REQUIRED VARIABLES FOR LOCAL DEVELOPMENT
#--------------------------------------------------------------------
# CORE ENVIRONMENT VARIABLES
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_API_URL=http://localhost:35001/api/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_PORT=3000

# FIREBASE AUTH AND ANALYTICS
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# CONTENT TOKEN (read-only)
NEXT_PUBLIC_STORYBLOK_TOKEN=xB5HoaLRkYs8ySylSUnZjQtt

# FEATURE FLAGS
NEXT_PUBLIC_FF_USER_RESEARCH_BANNER=true

# FEEDBACK FORM
NEXT_PUBLIC_FEEDBACK_FORM_URL=https://chayn.typeform.com/to/OY9Wdk4h?typeform-source=bloom.chayn.co

# REQUIRED VARIABLES FOR CYPRESS INTEGRATION TESTING
# SEE docs/configure-cypress.md FOR INSTRUCTIONS
#--------------------------------------------------------------------
# CYPRESS PROJECT
CYPRESS_PROJECT_ID=

# MAILSLURP
CYPRESS_MAIL_SLURP_API_KEY=
CYPRESS_INBOX_ID=

# LOCAL BLOOM USERS
CYPRESS_SUPER_ADMIN_EMAIL=
CYPRESS_SUPER_ADMIN_PASSWORD=
CYPRESS_PUBLIC_NAME=
CYPRESS_PUBLIC_EMAIL=
CYPRESS_PUBLIC_PASSWORD=
CYPRESS_BUMBLE_PARTNER_ADMIN_EMAIL=
CYPRESS_BUMBLE_PARTNER_ADMIN_PASSWORD=
CYPRESS_BADOO_PARTNER_ADMIN_EMAIL=
CYPRESS_BADOO_PARTNER_ADMIN_PASSWORD=

# OPTIONAL VARIABLES
#--------------------------------------------------------------------
# NEW RELIC TRACKING
NEW_RELIC_LICENSE_KEY=eu01xx6fc63a14eea79c367dfe82e702FFFFNRAL
NEW_RELIC_APP_NAME=bloom-frontend
NEW_RELIC_BROWSER_MONITORING_KEY=NRJS-0f9d5f21ee9234a45cc

# ANALYTICS
NEXT_PUBLIC_HOTJAR_ID=
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=

# ADDITIONAL FEATURES
NEXT_PUBLIC_CRISP_WEBSITE_ID= # User messaging
NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL= # Booking session forms
NEXT_PUBLIC_ZAPIER_WEBHOOK_DEMO_FORM= # User data form webhooks
NEXT_PUBLIC_ZAPIER_WEBHOOK_SETA_FORM= # User data form webhooks
NEXT_PUBLIC_ROLLBAR_TOKEN= # Rollbar logging
```

### Configure Firebase Variables:

To configure the Firebase variables, [create a Firebase project in the Firebase console](https://firebase.google.com/) (Google account required). Ensure the toggle is turned on to enable Google Analytics as it is required for `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`

###

### Create New Environment Variables:

If creating new environment variables, please tag Chayn staff developers in PR / issue discussions to let us know. New environment variables may require being added to Vercel (required for production-level variables) and GitHub Actions (required for app to build and pass CI tests). Note: Environment variables that are exposed to the client/browser must be prefixed with `NEXT_PUBLIC_` - see [next.js docs](https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser).

#### Additional Helper Environment Variables (optional):

- `FF_DISABLED_COURSES`: This feature flag is intended to remove courses from the users course home page. Note that this does not prevent the user from accessing the course completely - the user may still be able to access the course if they navigate to the URL.

  In terms of use, the variable could be used to disable a course when it has not been translated to a particular language e.g. if the `healing-from-sexual-trauma/` course is ready in English but not in French, then the course can be enabled in storyblok but still disabled in french. To do this, the the french url slug `fr/courses/healing-from-sexual-trauma/` should be included in the environment variable. This means the course will be hidden in the French version of bloom but still visible to the English version of bloom. If multiple courses need to be disabled, the slugs will need to be separated by commas.

- `NEXT_PUBLIC_FF_USER_RESEARCH_BANNER`: This feature flag enables a banner which displays a banner message aimed to gathering users for Bloom feedback. It is intended to be turned on temporarily, for saw 1-2 weeks at a time. It links to an external form which users can fill out if they would like to take part in research.

#### How to Import Environment Variables with Vercel (Chayn team only):

- Chayn staff can import all environment variables from Vercel. Ask the team for access, then proceed to the [Vercel Environment Variable Import](#vercel-environment-variable-import) for directions. Environment variables are defined and stored in Vercel for each of the environments: development, preview and production. Read more about Vercel environment variables [here](https://vercel.com/docs/concepts/projects/environment-variables). These environment variables can be imported using the Vercel CLI.

  Download and login to the Vercel CLI:

  ```bash
  npm i -g vercel
  vercel login
  ```

  Link the Vercel project to your local directory:

  ```bash
  vercel link

  # copy these answers
  Vercel CLI 24.1.0
  ? Set up “~/yourpath/bloom-frontend? [Y/n] y
  ? Which scope should contain your project? Chayn
  ? Found project “chaynhq/bloom-frontend”. Link to it? [Y/n] y
  ✅  Linked to chaynhq/bloom-frontend (created .vercel)
  ```

  Download the local environment variables files from Vercel:

  ```bash
  vercel env pull .env.local
  ```
