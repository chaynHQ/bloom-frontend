# Partner onboarding: lane prompts

Prompts for the five Claude Code sessions in [partner-onboarding-plan.md](partner-onboarding-plan.md#lanes), building three PRs. Start B, F and S together now; start A once S has finished and B's PR is up; start G once phases 1–3 are stable in production. Paste a prompt into a fresh session in the folder it names.

Every prompt includes these rules:

> **Lane rules.** Read the whole plan (`/Users/anna/Sites/bloom-frontend/docs/partner-onboarding-plan.md`) and this repo's `CLAUDE.md` first. Edit only the files your lane owns in the plan's Lanes table; if you need a change anywhere else, stop and tell me. Write your critical-path tests first and watch them fail, then implement. Never touch a staging or production database. Never publish in Storyblok unless you are lane S and I have said so. There are no test partners: never create test partner data in Storyblok or any database, and use only Bumble, Badoo, Fruitz and Bumble For Friends in tests (plan: Partners used for testing). Follow `CLAUDE.md`'s code style and keep comments to a non-obvious why. Implement the API contract exactly; if it can't work as written, stop and tell me. Build only what the plan asks for; its "Left out on purpose" table lists what not to add. Done means lint, type-check and tests pass, then commit and push. Lanes B, F and G open a draft PR against `develop` that lists the critical-path tests and anything not done, and report the link; lanes S and A push their branch and tell me it's ready for F to merge. Never merge into `develop`: I merge in the plan's order.

---

## B: Backend (PR 1)

Folder: `/Users/anna/Sites/bloom-backend` (main checkout). Start now.

```
You are lane B (Backend) of the partner onboarding build: phase 1, PR 1. [Lane rules from /Users/anna/Sites/bloom-frontend/docs/partner-onboarding-prompts.md apply.] Your sections of the plan: Backend, API contract, and Critical paths 1, 2 and 6 (and Partners used for testing).

Set-up: git switch develop && git pull && git switch -c partners/backend.

Tests first, for every backend row of critical paths 1, 2 and 6. Then:

1. PartnerEntity and the migration (yarn migration:generate, then hand-edit), as in the plan's "partner table":
   - slug: add nullable, backfill with slugify(name), then NOT NULL and unique;
   - storyblokUuid: unique, nullable;
   - therapySessionsPerCode: int, not null, default 0, then UPDATE every existing row to 6;
   - nothing else: no column is dropped. yarn migration:generate will also generate DROP COLUMN for the branding fields you remove from the entity; delete those statements.
   Remove the branding fields from PartnerEntity (the columns stay in the database; they're all nullable). Write a working down migration. Put slugify in src/partner/ and use it everywhere a slug is made.
2. DTOs:
   - UpdatePartnerDto: remove the branding fields; add therapySessionsPerCode (integer 0–20) and automaticAccessCode (boolean);
   - GetPartnerDto and formatPartnerObject: add slug and therapySessionsPerCode.
3. PartnerService and PartnerController:
   - getPartner and getPartnerWithPartnerFeaturesByName both match LOWER(name) = LOWER(:value) OR slug = LOWER(:value), with no LIKE;
   - createPartner sets slug;
   - new public GET /v1/partner/active returning ActivePartner[] (id, name, slug) for active partners only, declared before GET :name so "active" isn't read as a name;
   - GET /v1/partner (super admin) also returns slug, storyblokUuid, therapySessionsPerCode and automaticAccessCode (true when the AUTOMATIC_ACCESS_CODE partner_feature row is active);
   - PATCH /v1/partner/:id: cascade to partner admins and accesses only when `active` differs from the partner's current isActive; otherwise keep the cascade exactly as it is. Apply therapySessionsPerCode. Handle automaticAccessCode by creating the AUTOMATIC_ACCESS_CODE partner_feature row (and the feature if missing) or setting its active; never a second row. Don't spread it into the entity save.
4. Access codes, validation only:
   - remove @Max(6) from CreatePartnerAccessDto;
   - in createPartnerAccess, load the partner and throw 400 if featureTherapy is true and the limit is 0, or if therapySessionsRemaining is over the limit;
   - store the values sent unchanged.
   Don't touch PATCH partner-access/:id, user.service, basePartnerAccess, redemption or therapy booking.
5. Storyblok webhook: STORYBLOK_PAGE_COMPONENTS.PARTNER = 'partner', and the partner branch exactly as in the plan's "Storyblok webhook" (lookup order uuid → slug → name; create inactive; never rename or reactivate; log a slug or name mismatch). updateInactiveStoryStatus must not throw for a partner UUID.

Verify:
- the full test suite and lint;
- on the local database: migration:run, migration:revert, migration:run;
- curl GET /v1/partner/active, GET /v1/partner/bumble and GET /v1/partner/Bumble;
- through the services against the local database: a Badoo code with 6 therapy sessions succeeds and one with 7 gets 400; PATCH Badoo with { active: true } leaves a deactivated access deactivated.
Leave the local backend running on 35001 when you're done; lanes F and A use it.

Finish: the PR description adds these notes:
- before production, run on the production database and send me the output:
  SELECT name, "isActive" FROM partner ORDER BY name;
  I'll check that names match the datasource values (Badoo, Fruitz, Bumble) apart from case and that no two slugify alike;
- on staging, the content team adds Bumble For Friends in Storyblok and its row comes from this PR's webhook (plan: Partners used for testing);
- the previous backend works against this schema, so a rollback is safe; the branding columns are dropped in a later PR.
```

## F: Frontend (PR 2)

Folder: `/Users/anna/Sites/bloom-frontend` (main checkout). Start now.

```
You are lane F (Frontend) of the partner onboarding build: phase 3, PR 2. You own the PR; lanes S and A build parts of it on their own branches, and you merge those in when I say. [Lane rules from docs/partner-onboarding-prompts.md apply.] Your sections of the plan: Branded and launched partners, API contract, Frontend (Partner data, Changes, Welcome pages), Critical paths 3, 4 and 5. This is the riskiest lane: partner sign-up and attribution must behave exactly as today for Bumble and Badoo. PR 2 stays a draft until S's and A's branches are merged into it.

Set-up: git switch develop && git pull && git switch -c partners/frontend. The untracked docs/partner-onboarding-plan.md and docs/partner-onboarding-prompts.md come with you. Run the dev server with yarn dev (port 3000). Until lane B's backend runs locally, mock GET /v1/partner/active from the API contract. Ask me when you need the real one.

Step 0, the contract. Do exactly this, then commit as "Partner onboarding: plan and shared contract", push, and open the draft PR so the preview deploys. Lane A branches from this commit.
- lib/partners/types.ts: `ActivePartner` exactly as in the plan's API contract (id, name, slug); `PartnerBrand`, the camelCase shape of a partner story from the plan's "partner content type" table: slug, name, legalName, logo, brandColor, partnershipLogo, illustration (asset fields as URL strings; partnershipLogo and illustration may be null), website, facebook, instagram, twitter, youtube, tiktok (string | null). Types only.
- lib/constants/common.ts: export const PARTNERS_CACHE_TAG = 'partners', next to COURSE_STORIES_CACHE_TAG.
- app/api/revalidate/route.ts: revalidateTag(PARTNERS_CACHE_TAG, { expire: 0 }) next to the existing revalidateTag.
- lib/store/partnersSlice.tsx: add optional slug?: string, storyblokUuid?: string | null, therapySessionsPerCode?: number and automaticAccessCode?: boolean to Partner.
- lib/store/partnerAdminSlice.tsx: type PartnerAdmin.partner as (PartnerContent & Partner) | null, which is what it already holds at runtime.
- i18n/messages/shared/<locale>.json for all 8 locales, adding keys and changing no existing key: Shared.footer.inPartnershipWith, a copy of that locale's footer.bumbleLine1; Shared.alt.partnerLogo, that locale's alt.bumbleLogo with "Bumble" replaced by {name}; Shared.alt.partnershipLogo, that locale's alt.bloomBumbleLogo with the partner's name replaced by {name} (Hindi's says "Badoo" there; replace that). Keep the translators' wording otherwise. Run node scripts/checkTranslation.js.
Step 0 changes no behaviour. Run yarn type-check, yarn lint and yarn test before committing.

Then tests first: every row of critical paths 3, 4 and 5. Then, one commit per step so the review can follow it:
1. lib/partners/:
   - a server loader per locale returning the branded and launched sets as the plan defines them, joined by slug, cached with PARTNERS_CACHE_TAG and revalidate 14400. Stories "exist" in STORYBLOK_ENVIRONMENT, so drafts count on staging and locally; never filter on `published`;
   - on any failed fetch the loader throws and caches nothing, and a GET /v1/partner/active response that isn't a list counts as failed. No caller catches it and there is no empty fallback (the plan's "Partner data" explains why);
   - mapping from Storyblok to PartnerBrand;
   - PartnersProvider; usePartner(name) over the branded set, for members and partner admins; resolveLaunchedPartner(slug) for anything from a URL or referral; both return the existing PartnerContent shape. A hook for the launched set.
2. BaseLayout loads the sets and wraps everything that uses them in PartnersProvider, including ReferralPartnerTracker and Footer.
3. Every row of the plan's Changes table, each in one place. In particular:
   - Footer uses usePartner for partner accesses and the partner admin, and resolveLaunchedPartner for ?partner= and the referral cookie; RegisterPage's ?partner= uses resolveLaunchedPartner;
   - hasAccessToPage and getUserContentPartners receive the launched partner's name, with the capitalising removed;
   - useRegisterPath keeps the slug;
   - pages resolve slug → partner once and pass partner.name to anything expecting a name;
   - TopBar's partner-admin welcome link uses slug;
   - CreateAccessCodePage's header takes its logo from usePartner (lane A owns the form below it);
   - export publicContent from lib/constants/partners.ts and use it in Footer and lib/utils/structuredData.tsx;
   - UTM matching prefers the longest launched slug;
   - leave useReferralPartner's dead register-path branch alone.
4. The welcome gate, generateStaticParams and the sitemap use the launched set.
5. Strings and assets:
   - switch to the shared strings from step 0, then remove the per-partner footer and alt keys from all 8 locales and run node scripts/checkTranslation.js;
   - delete exactly the public/ files the plan lists (keep illustration_bloom_head_yellow.svg);
   - remote SVGs use unoptimized, with width and height read from the Storyblok URL.
6. Update the Cypress specs that check old filenames, constants or name-based welcome links: cypress/integration/partners/, and the partner lines of admin/partner-content-access, system/navigation, system/initial-exploration, auth/create-user and user-accounts/user-apply-a-code.

Verify:
- unit tests, yarn type-check, yarn lint;
- against the local backend and S's Bumble, Badoo and Fruitz drafts, run the Cypress partners suite and the other specs above. Check with me that lane A isn't running Cypress at the same time;
- screenshot the Bumble and Badoo welcome pages, the register page with ?partner=bumble, the footer for a Bumble member, and the partner admin's create-access-code header, before and after. They must look the same; show me the pairs.

When I say S or A is ready: git fetch && git merge origin/partners/storyblok (or origin/partners/admin), with no squash; rerun type-check, lint, unit tests and both Cypress suites; push. Finally, write the PR description: what changed, a table mapping each critical path (3, 4, 5, and A's rows of 1 and 6) to its tests and commits, the staging checks from the plan, and "merge to develop after PR 1; release to production only as in the plan's Release section". Tell me when it's ready for review.
```

## S: Storyblok (part of PR 2)

Folder: `/Users/anna/Sites/bloom-frontend`. Start now.

```
You are lane S (Storyblok) of the partner onboarding build: phase 2, part of PR 2. [Lane rules from docs/partner-onboarding-prompts.md apply.] Your sections of the plan: Storyblok, Moving existing partners, Partners used for testing. One Storyblok space serves staging and production: schema changes are live for editors at once, and a publish fires both backends' and both frontends' webhooks.

Set-up:
  git fetch && git worktree add ../bloom-frontend-s -b partners/storyblok origin/develop
  cd ../bloom-frontend-s
  cp ../bloom-frontend/.env.local .
  yarn install
The plan is untracked in the main checkout; read it at the absolute path above. Use STORYBLOK_OAUTH_TOKEN and STORYBLOK_SPACE_ID with the Management API, following scripts/storyblokLokalise.lib.mjs.

Write scripts in scripts/partners/. Each one is idempotent, dry-run by default, and writes only with --apply:
1. createPartnerSchema.mjs:
   - the partner content type exactly as the plan's field table: required fields, brand_color regex, partnership_logo translatable, asset fields limited to images;
   - a partners/ folder.
   Change no existing component and leave the partners datasource alone.
2. migratePartners.mjs creates draft stories partners/bumble, partners/badoo and partners/fruitz:
   - logo, lockup and illustration uploaded from public/, as lib/constants/partners.ts maps them, keeping their filenames; the current English lockup goes in the default-language partnership_logo;
   - name exactly equal to the partners datasource value (Bumble, Badoo, Fruitz);
   - legal_name from the English footer.<partner>Line2;
   - website and socials from the constants;
   - brand_color read from each illustration's circle fill (for a gradient, its first stop).
   A separate --publish flag publishes these three. Don't run it until I say the team has signed off on staging.

Show me each dry run before you apply it. Verify: the draft CDN API returns every new story, and the published CDN API returns none of them until --publish.

Finish: commit only the scripts, push partners/storyblok, and tell me it's ready for F to merge. Keep this session open: you run --publish later.
```

## A: Admin (part of PR 2)

Folder: `/Users/anna/Sites/bloom-frontend`. Start once S has finished and B's PR is up.

```
You are lane A (Admin) of the partner onboarding build: phase 3, part of PR 2. [Lane rules from docs/partner-onboarding-prompts.md apply.] Your sections of the plan: Admin dashboard, API contract, and the frontend rows of critical paths 1 and 6.

Set-up:
  git fetch && git worktree add ../bloom-frontend-a -b partners/admin origin/partners/frontend
  cd ../bloom-frontend-a
  cp ../bloom-frontend/.env.local .
  yarn install
Run the dev server with yarn dev -p 3001, against lane B's backend on 35001.

Tests first: the Cypress rows of critical paths 1 and 6. Then:
1. lib/api.ts: replace the updatePartnerActive mutation with updatePartner, taking the contract's UpdatePartner body. Update the getPartners response type.
2. Replace the "update partner" card in AdminDashboardPage with a partners table: name, slug, status, therapy limit (integer 0–20), automatic access code, a link to /welcome/<slug>, and activate/deactivate. Each control sends only its own field; never send `active` except from the activate/deactivate control. Deactivating asks for confirmation and says it also deactivates the partner's admins and every member's access. Remove UpdatePartnerActiveForm if nothing else uses it.
3. A server action, called after each successful update. It sends the user's Firebase token to the backend's GET user/me, requires isSuperAdmin, then revalidateTag(PARTNERS_CACHE_TAG, { expire: 0 }).
4. CreateAccessCodeForm:
   - send partnerAdmin.partner.therapySessionsPerCode instead of 6;
   - hide the therapy option when it's 0, and say how many sessions a therapy code includes;
   - build the welcome link from slug.
   Lane F owns CreateAccessCodePage's header.
5. Strings in i18n/messages/admin and partnerAdmin for all 8 locales (English placeholders in the others); run node scripts/checkTranslation.js.

Iterate on the table's design with screenshots at desktop and mobile widths, using MUI and the existing dashboard cards' styles. Show me the result.

Verify:
- yarn type-check, yarn lint, unit tests;
- the Cypress admin suite (except partner-content-access, which is lane F's). Check with me that lane F isn't running Cypress;
- by hand, on your local database only: change Badoo's therapy limit and check the request body holds only that field; switch Fruitz's automatic access code off and on, and deactivate and reactivate Fruitz (it isn't launched); create a Badoo code as Badoo's admin. Put every value back afterwards.

Finish: push partners/admin and tell me it's ready for F to merge.
```

## G: Asset generation (PR 3)

Folder: `/Users/anna/Sites/bloom-frontend`. Start once phases 1–3 are stable in production.

```
You are lane G (Asset generation) of the partner onboarding build: phase 4, PR 3. [Lane rules from docs/partner-onboarding-prompts.md apply.] Your section of the plan: Asset generation. Until I approve the output, write nothing to Storyblok: generate to local files, and test write-back against a mocked Management API.

Set-up:
  git fetch && git worktree add ../bloom-frontend-g -b partners/assets origin/develop
  cd ../bloom-frontend-g
  cp ../bloom-frontend/.env.local .
  yarn install

Build lib/partnerAssets/:
1. Lockup per language (en, de, fr, es, pt, hi):
   - an SVG layout matching public/bloom_bumble_logo.svg (deleted by PR 2; take it from git history): Bloom wordmark from public/bloom_logo.svg, then footer.inPartnershipWith for that language, then the partner logo scaled to the wordmark's width (nested SVG by viewBox, or an embedded PNG);
   - rendered to PNG at 3× with @resvg/resvg-js and a bundled Open Sans Light Italic (OFL; include its licence).
2. Illustration: public/illustration_bloom_head_yellow.svg with its circle fill replaced by a pastel of brand_color (same hue; lightness and chroma clamped, e.g. with culori). Check the line art's contrast.
3. Write-back through the Management API (STORYBLOK_OAUTH_TOKEN):
   - upload the assets;
   - fill only empty fields in the story draft: partnership_logo for the default language and partnership_logo__i18n__<lang> for the others, plus illustration;
   - keep every other field and translation; never publish;
   - add the partners datasource entry (name = slug, value = name) if it's missing.
4. Trigger: in app/api/revalidate/route.ts, after the existing signature check and revalidation, use after() to run generation when the action is published, full_slug starts with partners/, and either field is empty. Skip it when ENVIRONMENT is staging (staging shares the Storyblok space and its webhooks). Export maxDuration = 60 from the route.
5. next.config.js: whatever @resvg/resvg-js needs to bundle on Vercel (e.g. serverExternalPackages).

Iterate with screenshots:
- generate for Bumble, Badoo, Fruitz and Bumble For Friends (its logo from the BFF story once the content team has added it) plus two awkward logos (very wide, square icon), in all six languages, and look at every image;
- compare the English Bumble output with the old public/bloom_bumble_logo.svg;
- show me a contact sheet.

Verify:
- unit tests for layout maths, colour clamping, empty-field-only write-back and the staging skip;
- once I approve the output: a local webhook call for partners/bumble-for-friends fills only its empty fields in the draft, and a second call changes nothing.

Finish: the PR description notes that production needs STORYBLOK_OAUTH_TOKEN and STORYBLOK_SPACE_ID in Vercel's production environment only, preferably a dedicated account's token.
```
