# Partner onboarding

Adding a partner today needs a developer: API calls to create it, branding committed to the repo, translation keys in 8 locales and a deploy. This plan makes it a content and admin task. The content team publishes the partner's stories in Storyblok, assets are generated for a designer to review, and a super admin switches the partner on in the admin dashboard. No code change, API call or deploy.

| Phase | What                                                                                                   | Where          | PR                                          | Status    |
| ----- | ------------------------------------------------------------------------------------------------------ | -------------- | ------------------------------------------- | --------- |
| **1** | Partner `slug`, Storyblok link and therapy limit in the database; access codes checked against it      | bloom-backend  | chaynHQ/bloom-backend#1302                  | In review |
| **2** | `partner` content type; Bumble, Badoo and Fruitz moved onto it                                         | Storyblok      | None: done directly in Storyblok, as drafts | Done      |
| **3** | Frontend reads partners from Storyblok and the backend; welcome pages gated on launch; dashboard table | bloom-frontend | chaynHQ/bloom-frontend#2032                 | In review |
| **4** | Lockups and illustrations generated from the partner's logo and colour                                 | bloom-frontend | Later PR                                    | Planned   |
| Later | Drop the unused partner branding columns, once phases 1–3 are stable in production                     | bloom-backend  | One migration                               | Planned   |

Phases 1 and 3 are one PR each, backend and frontend. Both go to staging for the team to test, then to production together. Phases 1–3 remove developers from onboarding. Until phase 4 ships, a designer uploads the lockup and illustration, and the content team adds the partner to the `partners` datasource. The prompt for phase 4 is in [partner-onboarding-prompts.md](partner-onboarding-prompts.md).

- [How it works today](#how-it-works-today)
- [Decisions](#decisions)
- [Branded and launched partners](#branded-and-launched-partners)
- [The new flow](#the-new-flow)
- [Storyblok](#storyblok)
- [Backend](#backend)
- [API contract](#api-contract)
- [Frontend](#frontend)
- [Asset generation](#asset-generation)
- [Moving existing partners](#moving-existing-partners)
- [Critical paths](#critical-paths)
- [Delivery](#delivery)
- [Left out on purpose](#left-out-on-purpose)
- [Open questions](#open-questions)

---

## How it works today

A partner lives in three places, joined only by a case-insensitive name:

| Where                                   | What                                                                                                        | Who                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| `partner` table                         | `POST /v1/partner` (name only); `AUTOMATIC_ACCESS_CODE` via `POST /v1/feature` + `POST /v1/partner-feature` | Developer, Swagger/curl |
| Storyblok                               | `partners` datasource (feeds `included_for_partners` on 8 content types); `welcome/<slug>` story            | Content team            |
| `lib/constants/partners.ts` + `public/` | Logo, "Bloom × partner" lockup, illustration, website, socials, `partnerKeys` for UTM matching              | Developer + deploy      |
| `i18n/messages/shared/`                 | `footer.<partner>Line1/2`, `alt.<partner>Logo`, `alt.bloom<Partner>Logo` in 8 locales                       | Developer               |

The constants are the blocker: `WelcomePage` renders "no data" for any partner `getPartnerContent()` doesn't know.

Bugs this plan fixes on the way:

- `PartnerService.getPartner` matches `LIKE '%name%'`, so one partner's name inside another's tags the wrong partner's courses or automatic access code. `getPartnerWithPartnerFeaturesByName` (`GET /v1/partner/:name`) uses `LIKE` too, so `_` and `%` in a name are wildcards.
- The therapy sessions on an access code are capped only by a hard-coded `@Max(6)`; `CreateAccessCodeForm` hard-codes 6.
- Slugs and names are confused: `hasAccessToPage` capitalises the referral slug to guess the name, and `TopBar` and `CreateAccessCodeForm` build welcome links from `name.toLowerCase()`. Both break for a name with a space.
- Any `/welcome/<anything>` sets a referral, even a 404, and an unrecognised referral hides `Public` content from that visitor.
- UTM matching takes the first partner key it finds, so overlapping slugs credit the wrong partner.
- `PATCH /v1/partner/:id` cascades whenever `active` is in the body, even with the partner's current value, so re-sending `active: true` reactivates every access that was switched off one by one.

## Decisions

| Question                    | Decision                                                                                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where branding lives        | A `partner` content type at `partners/<slug>`. The welcome page stays its own story at `welcome/<slug>`, paired by slug                                                                                                                      |
| What publishing switches on | Nothing on the site. A published partner story creates the partner **inactive**; it launches only when a super admin activates it. The story itself is readable via the public CDN token, so publish only once the partnership can be public |
| Therapy per access code     | A per-partner limit, `therapySessionsPerCode`, set by a super admin (0 = no therapy). The backend refuses codes over it                                                                                                                      |
| Lockup and illustration     | Generated from the partner's logo and brand colour into the story draft, for a designer to review and publish                                                                                                                                |
| Lockup language             | One per language: en, de, fr, es, pt, hi (Hindi is written in Latin script in Bloom). Arabic and Turkish are closed to partners                                                                                                              |
| Fruitz                      | Gets a partner story so its members keep their footer branding, but no welcome page, so it isn't launched. Its database status isn't touched                                                                                                 |

## Branded and launched partners

The frontend works with two sets:

| Set          | A partner is in it when                                                           | Used for                                                                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Branded**  | its `partners/<slug>` story exists                                                | Branding for signed-in members and partner admins: their footer and the partner admin pages                                                                                                                                        |
| **Launched** | branded, **and** active in the backend, **and** its `welcome/<slug>` story exists | Anything driven by a URL or a referral: the welcome page, `?partner=` on register and in the footer, the referral cookie, UTM attribution, the sitemap, the partner lists on register and apply-a-code, referred visitors' content |

"Exists" means in `STORYBLOK_ENVIRONMENT`: published in production, draft or published on staging and locally. A new partner's welcome story stays a draft until launch (Bumble For Friends on staging), so a `published` check would leave it unlaunched on staging and fail every staging check.

Only the launched set is ever reachable from a URL, so a partner that's published but not yet launched shows up nowhere a visitor can type.

Today the launched set is exactly Bumble and Badoo, the same as the hard-coded `partnerKeys` and `getAllPartnersContent()`, so nothing changes for members. Fruitz is branded only.

Never deactivate a partner to hide it: deactivation also deactivates every member's access. Unpublishing its welcome story takes it out of the launched set.

## The new flow

| Step | Who          | Where           | What happens                                                                                                                                   |
| ---- | ------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Content team | Storyblok       | Create `partners/<slug>`: name, legal name, logo, brand colour, website, socials. Publish once the partnership can be public                   |
| 2    | (automatic)  | Backend         | The webhook creates the `partner` row, inactive, therapy limit 0, no automatic access code                                                     |
| 3    | (automatic)  | Frontend        | The webhook generates the lockups and illustration into the story draft and adds the `partners` datasource entry (phase 4; by hand until then) |
| 4    | Designer     | Storyblok       | Reloads the story, reviews the generated assets, replaces any that need it, publishes again                                                    |
| 5    | Content team | Storyblok       | Creates and publishes `welcome/<slug>`; tags courses and resources with the partner                                                            |
| 6    | Super admin  | Admin dashboard | Sets the therapy limit and automatic access code, creates partner admins (existing form), **activates**. Staging first, then production        |

## Storyblok

### `partner` content type

Stories live in a `partners/` folder. The story slug is the partner's permanent key: never rename or move a partner story. The backend keeps the slug it first saw and logs a mismatch, and the frontend pairs the story with its row by slug, so a renamed story silently stops launching. If one must change, a developer updates the row's `slug` too.

| Field                                                              | Type                                      | Translatable | Notes                                                              |
| ------------------------------------------------------------------ | ----------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `name`                                                             | Text, required                            | No           | Display name. Must equal the value used in `included_for_partners` |
| `legal_name`                                                       | Text, required                            | No           | The footer's second line, e.g. `BUMBLE HOLDING LTD`                |
| `logo`                                                             | Asset (image), required                   | No           | The partner's own logo, SVG or transparent PNG                     |
| `brand_color`                                                      | Text, regex `^#[0-9a-fA-F]{6}$`, required | No           | Drives the generated illustration                                  |
| `partnership_logo`                                                 | Asset (image)                             | Yes          | The "Bloom × partner" lockup, one per language                     |
| `illustration`                                                     | Asset (image)                             | No           | The Bloom-head illustration in the partner's colour                |
| `website`, `facebook`, `instagram`, `twitter`, `youtube`, `tiktok` | Text                                      | No           | Footer links                                                       |

Alt text and "In partnership with" are shared app strings with the name filled in: `footer.inPartnershipWith`, `alt.partnerLogo`, `alt.partnershipLogo`. They're added from the existing translators' wording for Bumble, so nothing needs translating again.

The `partners` datasource stays, so the 8 `included_for_partners` fields don't change. Entries are name = slug, value = display name (as today: `bumble | Bumble`); `Public` stays.

## Backend

### `partner` table

| Column                   | Type                     | Notes                                                  |
| ------------------------ | ------------------------ | ------------------------------------------------------ |
| `slug`                   | text, unique, not null   | From the story slug, or a slugify of the name          |
| `storyblokUuid`          | text, unique, nullable   | Links the row to its partner story                     |
| `therapySessionsPerCode` | int, not null, default 0 | The most therapy sessions a code can include; 0 = none |

One migration:

- adds `slug` and backfills it with `slugify(name)` (lowercase, runs of other characters to `-`, trimmed); the unique constraint makes it fail rather than guess if two names slugify alike;
- adds `therapySessionsPerCode` and sets **every existing partner to 6**, exactly today's `@Max(6)`;
- adds nothing else and drops nothing.

The unused branding columns (`logo`, `logoAlt`, `partnershipLogo`, `partnershipLogoAlt`, `bloomGirlIllustration`, `bloomGirlIllustrationAlt`, `website`, `footerLine1`, `footerLine2`, `facebookUrl`, `twitterUrl`, `instagramUrl`, `youtubeUrl`, `tiktokUrl`, `githubUrl`) leave `PartnerEntity` and `UpdatePartnerDto`, but stay in the database; they're all nullable, so the new code ignores them. Keeping the backend PR add-only means the previous backend still works against the new schema, so a backend rollback is safe. A later one-migration PR drops them, after checking they hold no data.

### Storyblok webhook

A `partner` branch in `handleStoryUpdated`, for published and moved `partner` stories:

1. Find the row by `storyblokUuid`, else by `slug`, else by exact lowercase `name`. Set `storyblokUuid` if it's missing.
2. If nothing matches, create it: `isActive: false`, `therapySessionsPerCode: 0`, slug from the story slug, name from `content.name`. Skip with an error log if `content.name` is empty.
3. Never change `isActive`, `name` or `slug` on an existing row; log a mismatch and leave it.

Unpublish and delete do nothing; `updateInactiveStoryStatus` must not throw for a partner story's UUID. Republishing re-runs the branch, which recovers from a missed webhook.

### Partner updates

`PATCH /v1/partner/:id` cascades to partner admins and accesses only when `active` changes the partner's status. Sending the current value does nothing, so a stray `active: true` can't reactivate accesses switched off one by one. Deactivating and reactivating behave exactly as today.

`automaticAccessCode` creates the `AUTOMATIC_ACCESS_CODE` `partner_feature` row if there isn't one (and the feature if it's missing), otherwise sets its `active`. It never creates a second row.

### Access codes

Validation only; how a code is granted doesn't change. `createPartnerAccess` refuses with 400 if `featureTherapy` is true and the partner's limit is 0, or if `therapySessionsRemaining` is over the limit. The values sent are stored exactly as today. Automatic access codes (therapy off, 0 sessions) always pass.

Unchanged: `PATCH /v1/partner-access/:id`, automatic access codes, live chat, redemption, deactivation, therapy booking.

### Lookups

`getPartner(value)` and `getPartnerWithPartnerFeaturesByName(value)` match `LOWER(name) = LOWER(value) OR slug = LOWER(value)`, with no `LIKE`. Callers: the `course_partner` sync (names from `included_for_partners`), the automatic access code lookup (name) and `GET /v1/partner/:name` (the register page; name or slug).

## API contract

Fixed before building started, so backend and frontend were built in parallel.

```ts
// GET /v1/partner/active (public): active partners only, just enough to build the launched set
type ActivePartner = {
  id: string;
  name: string; // "Bumble"
  slug: string; // "bumble"
};

// formatPartnerObject (GET /v1/partner/:name, a user's partnerAccesses[].partner,
// partnerAdmin.partner) adds:  slug: string;  therapySessionsPerCode: number;

// GET /v1/partner (super admin): adds slug, storyblokUuid, therapySessionsPerCode,
// automaticAccessCode: boolean (the AUTOMATIC_ACCESS_CODE partner_feature row is active)

// POST /v1/partner (super admin): request unchanged; also sets slug = slugify(name)

// PATCH /v1/partner/:id (super admin). Send only the fields being changed
type UpdatePartner = {
  active?: boolean; // cascades only when it changes the partner's status
  therapySessionsPerCode?: number; // integer 0–20
  automaticAccessCode?: boolean;
};
```

## Frontend

### Partner data

A server loader, cached with `PARTNERS_CACHE_TAG` and revalidated every 4 hours like other Storyblok data, per locale (`partnership_logo` is translatable):

- **Brand:** `partners/` stories in `STORYBLOK_ENVIRONMENT`.
- **Status:** `GET /v1/partner/active`.
- **Welcome pages:** which `welcome/<slug>` stories exist in `STORYBLOK_ENVIRONMENT`.

It returns the branded and launched sets, joined by slug. `BaseLayout` passes the sets to a `PartnersProvider` wrapping everything that uses them, including `ReferralPartnerTracker` and `Footer`.

**On failure the loader throws, and nothing catches it.** Pages are statically cached, so an empty fallback would be saved into the page for 4 hours: `/welcome/bumble` would cache a 404 and referrals would be dropped. When a regeneration throws, Next keeps serving the last page it generated, so an outage leaves partners stale, never missing. A response from `GET /v1/partner/active` that isn't a list (e.g. from a backend without phase 1) counts as a failure too. A render with no earlier page errors and isn't cached; the next request retries. This makes the backend a dependency of a first render, which is rare because Vercel's data cache survives deploys; a build with the backend down fails rather than shipping without partners.

The Storyblok webhook's `/api/revalidate` refreshes the tag. When a super admin changes a partner, the dashboard calls a server action that checks the caller is a super admin (it sends the Firebase token to `GET /v1/user/me`) and revalidates the tag. The backend never calls the frontend.

### Changes

| Today                                      | Becomes                                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getPartnerContent(name)`                  | `usePartner(name)` over the branded set for members and partner admins (Footer, CreateAccessCodePage); `resolveLaunchedPartner(slug)` for anything from a URL or referral (Footer's `?partner=` and cookie, RegisterPage, WelcomePage). Both return the existing `PartnerContent` shape |
| `getAllPartnersContent()`                  | The launched set                                                                                                                                                                                                                                                                        |
| `partnerKeys`                              | Launched slugs; the longest slug contained in the UTM data wins                                                                                                                                                                                                                         |
| Referral from any `/welcome/<x>`           | Only launched slugs                                                                                                                                                                                                                                                                     |
| Referral slug used as a name               | Resolved once to the launched partner. `hasAccessToPage` and `getUserContentPartners` get its **name** (no more capitalising); `useRegisterPath` keeps the **slug**. Unknown or unlaunched referrals, including old cookies, are ignored                                                |
| Pages pass the URL's partner on            | Pages resolve slug → partner once, then pass `partner.name` to anything that expects a name (e.g. the automatic access code lookup)                                                                                                                                                     |
| Welcome links from `name.toLowerCase()`    | From `slug` (`TopBar`, `CreateAccessCodeForm`)                                                                                                                                                                                                                                          |
| Static branding merged into Redux          | Removed from `partnerAccessSlice` and `partnerAdminSlice`                                                                                                                                                                                                                               |
| Per-partner footer and alt keys            | `footer.inPartnershipWith`, `alt.partnerLogo`, `alt.partnershipLogo` with `{name}`; the per-partner keys removed from all 8 locales                                                                                                                                                     |
| `StaticImageData` imports                  | Storyblok asset URLs. `next/image` needs `width` and `height` for remote URLs (read them from the Storyblok URL) and `unoptimized` for SVGs, which the optimiser rejects                                                                                                                |
| Per-partner event names (`BUMBLE_PROMO_…`) | Unchanged for Bumble and Badoo; hyphens in a slug become underscores (`BUMBLE_FOR_FRIENDS_PROMO_…`)                                                                                                                                                                                     |
| Sitemap lists every published `welcome/*`  | Launched partners only                                                                                                                                                                                                                                                                  |

Chayn's own footer content (`publicContent`) stays in `lib/constants/partners.ts`, exported for `Footer` and `lib/utils/structuredData.tsx`; everything partner-specific leaves it. Delete `bumble_logo.svg`, `badoo_logo.svg`, `fruitz_logo.svg`, `bloom_bumble_logo.svg`, `bloom_badoo_logo.svg`, `bloom_fruitz_logo.svg`, `illustration_bloom_head_pink.svg` and `illustration_bloom_head_purple.svg`. Keep `illustration_bloom_head_yellow.svg`: other pages use it.

`useReferralPartner`'s register-path branch is dead code (it reads a query from `pathname`, and uses `=` for `===`). Leave it, so tracking is otherwise untouched, and remove it separately.

### Welcome pages

`app/[locale]/welcome/[partnerName]` renders only for a launched partner, otherwise `notFound()`. `generateStaticParams` lists launched partners. To check a partner before launch, activate it on staging, which reads drafts and has its own database.

### Admin dashboard

The "update partner" card becomes a partners table: name, slug, status, therapy limit, automatic access code, a link to its welcome page, and activate/deactivate. Each control sends only its own field. Deactivation asks for confirmation and says it cuts members' access. Creating partner admins keeps its existing card.

`CreateAccessCodeForm` sends the partner's `therapySessionsPerCode` instead of 6, hides the therapy option when it's 0, and builds the welcome link from the slug.

## Asset generation

Runs in the frontend's `/api/revalidate`, in `after()` so the webhook returns straight away, when a published `partner` story has an empty `partnership_logo` or `illustration`. The route sets `maxDuration = 60` for it. To regenerate, the designer clears the field and publishes again. It only writes drafts, so publishing a generated story never re-triggers it.

**It never runs on staging.** Staging and production share the Storyblok space and both receive its webhooks, so running in both would generate and upload everything twice, racing on the same draft. It runs in production and locally.

- **Lockup, per language:** an SVG of the Bloom wordmark, `footer.inPartnershipWith` for that language, and the partner logo scaled to the wordmark's width, rendered to PNG at 3× with `@resvg/resvg-js` and a bundled Open Sans Light Italic. All six languages are Latin script.
- **Illustration:** the Bloom-head template with its circle fill replaced by a pastel of the brand colour: same hue, lightness and chroma clamped so the line art keeps its contrast.
- **Writing back:** upload to Storyblok assets, fill only empty fields in the draft, keep every other field and translation, add the `partners` datasource entry if missing. Never publish.

An editor who saves from a tab opened before generation finished clears the generated fields; the next publish just generates them again. Reload the story after publishing.

It needs a Storyblok management token in Vercel's production environment only; use a dedicated account's token so it doesn't depend on one person's account.

## Moving existing partners

1. `partners/bumble`, `partners/badoo` and `partners/fruitz` exist as drafts in Storyblok, made from `lib/constants/partners.ts` and the current files (done). Staging reads drafts, so the team tests with them.
2. Once the team has signed off on staging, the content team publishes them. That's harmless to the production code at the time: its backend ignores `partner` stories and its frontend never reads them. Production reads only published stories, so this must happen before the frontend reaches production.
3. On release day, the backend then the frontend reach production ([Release](#release)). The frontend finds the partners by slug; a later republish of each story sets its `storyblokUuid`. Phase 3 deletes the constants, files and per-partner strings.
4. Optional, after phase 4: clear Bumble's and Badoo's `partnership_logo` and republish for translated lockups.

## Critical paths

Six changes can lose sign-ups or give the wrong access without an error. Each gets its tests written before the code, a line-by-line review and a check on staging. Everything else can be reviewed quickly.

### Partners used for testing

There are no test partners anywhere: no scripts, no Storyblok test stories, no seeded rows. The cases Bumble and Badoo can't show (their slug and name match, and no names overlap) come from real partners:

| Partner            | Slug                 | Why it's useful                                                                                                              |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Bumble, Badoo      | `bumble`, `badoo`    | Today's behaviour must not change                                                                                            |
| Fruitz             | `fruitz`             | Branded but not launched: it has no welcome page                                                                             |
| Bumble For Friends | `bumble-for-friends` | New. Its slug differs from its name, "Bumble" is inside its name and slug, and it's inactive until a super admin launches it |

Unit tests use these four as in-memory fixtures, set up as each test needs (e.g. BFF inactive, or active with a therapy limit of 0 and an automatic access code). Cypress uses only Bumble, Badoo, Fruitz and unknown slugs, which behave the same in every environment. The BFF cases are checked by hand on staging.

**Adding BFF on staging,** once the backend and frontend PRs are there, the way any new partner is added:

1. The content team creates `partners/bumble-for-friends` with BFF's real branding (a designer uploads the lockup and illustration until phase 4), and publishes it. The staging backend's webhook creates its row, inactive. Production's backend ignores it until the backend PR is released.
2. The content team adds `bumble-for-friends | Bumble For Friends` to the `partners` datasource and creates `welcome/bumble-for-friends` as a draft. Staging reads drafts; it's published at launch.
3. A super admin finds BFF in the staging dashboard and changes its settings as each staging check below needs.

### 1. Therapy limit on access codes

| Test                                                                                                   | Where                            |
| ------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Limit 6, therapy with 6 sessions: stored exactly as sent (`featureTherapy`, 6 remaining, live chat on) | `partner-access.service.spec.ts` |
| Limit 6, no therapy: stored as sent                                                                    | `partner-access.service.spec.ts` |
| Limit 6, 7 sessions: 400                                                                               | `partner-access.service.spec.ts` |
| Limit 0, therapy requested: 400                                                                        | `partner-access.service.spec.ts` |
| Automatic access code sign-up for a limit-0 partner still works                                        | `partner-access.service.spec.ts` |
| Migration: existing partners at 6; new rows at 0                                                       | Migration review + local run     |
| Badoo's admin creates a therapy code with 6 sessions                                                   | `cypress/integration/admin/`     |
| A partner admin whose partner's limit is 0 sees no therapy option                                      | `CreateAccessCodeForm.test.tsx`  |

**Staging:** create Bumble and Badoo codes with and without therapy; compare the rows with one created in production.

### 2. Partner lookup

| Test                                                                                                                               | Where                             |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `bumble`, `Bumble`, `BUMBLE` find Bumble; `bumble-for-friends` and `Bumble For Friends` find Bumble For Friends (both lookups)     | `partner.service.spec.ts`         |
| `Bumble` doesn't find Bumble For Friends; `umble` and `B_mble` find nothing                                                        | `partner.service.spec.ts`         |
| A course tagged `Public` and `Bumble For Friends` links Bumble For Friends only, not Bumble                                        | `webhooks.service.spec.ts`        |
| Partner webhook: creates inactive; links an existing row by slug, then by name; never renames or reactivates; unpublish is a no-op | `webhooks.service.spec.ts`        |
| The automatic access code lookup finds Bumble For Friends                                                                          | `partner-feature.service.spec.ts` |

### 3. Content for referred visitors

| Test                                                                                                                                                                             | Where                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Referral `bumble-for-friends` sees content tagged `Bumble For Friends`, not content tagged only `Bumble`; referral `bumble` doesn't see content tagged only `Bumble For Friends` | `partnerContentAccess.test.ts`   |
| Referral `bumble-for-friends` opens a course tagged `Bumble For Friends` (`hasAccessToPage` gets the name)                                                                       | `hasAccessToPage.test.ts`        |
| Referrals to an inactive Bumble For Friends, `nonsense` and an old `fruitz` cookie are ignored: the visitor is public and sees `Public` content                                  | `partnerContentAccess.test.ts`   |
| Referral `bumble` behaves exactly as today                                                                                                                                       | both                             |
| A signed-in member is matched by their access codes, as today                                                                                                                    | `useUserContentPartners.test.ts` |

**Staging:** with BFF active, as a signed-out visitor, open `/welcome/bumble-for-friends`, then the library.

### 4. Welcome page gate and partner data

| Test                                                                                                      | Where                        |
| --------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Launched: renders. Inactive, no welcome story, no partner story, unknown slug: not found                  | Unit test of the loader/gate |
| With drafts (`STORYBLOK_ENVIRONMENT` = `draft`), a draft-only welcome and partner story count as existing | Unit test of the loader      |
| `GET /v1/partner/active` returning an error or a non-list (a backend without phase 1): the loader throws  | Unit test of the loader      |
| Backend or Storyblok fetch fails: the loader throws, caches nothing, and the next call fetches again      | Unit test of the loader      |
| Sitemap and `generateStaticParams` include launched partners only                                         | New `app/sitemap.test.ts`    |
| `/welcome/bumble` renders; `/welcome/fruitz` and `/welcome/nonsense` show not found                       | `welcome.cy.tsx`             |
| `/?partner=fruitz` and `/auth/register?partner=nonsense` show no partner branding                         | `welcome.cy.tsx`             |

Review: no caller of the loader catches its error.

**Staging:** before BFF is activated, `/welcome/bumble-for-friends` 404s. Activate it in the dashboard and check the page renders straight away; deactivate it and check it 404s again. This also checks the dashboard's revalidation.

### 5. Referral and UTM attribution

The mechanism doesn't change: a `/welcome/<slug>` path, or a slug anywhere in the five UTM parameters, stores the partner in Redux and a session cookie; the register page reads `?partner=`. Only the slug list becomes dynamic.

| Test                                                                                                                         | Where                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Every existing case passes unchanged                                                                                         | `useReferralPartner.test.ts`           |
| `/welcome/bumble-for-friends` sets the referral when BFF is launched, not when it's inactive                                 | `useReferralPartner.test.ts`           |
| `utm_source=bumble` and `utm_campaign=bumble-june-2026` attribute Bumble                                                     | `useReferralPartner.test.ts`           |
| `utm_source=bumble-for-friends` attributes Bumble For Friends, not Bumble                                                    | `useReferralPartner.test.ts`           |
| Before BFF launches, `utm_source=bumble-for-friends` attributes Bumble, as it does today (only launched slugs count)         | `useReferralPartner.test.ts`           |
| `bumble` gives `BUMBLE_PROMO_GET_STARTED_CLICKED`; `bumble-for-friends` gives `BUMBLE_FOR_FRIENDS_PROMO_GET_STARTED_CLICKED` | events unit test                       |
| `/welcome/bumble` and `/auth/register?utm_source=bumble` show the register form without a code field, as today               | `register-partner-without-code.cy.tsx` |
| A Bumble welcome link with a code still works                                                                                | `register-partner-*.cy.tsx`            |

**Staging:** register through a Bumble welcome link with a code and through a UTM link, and check the analytics events still carry `bumble`. With BFF active and its automatic access code on, register through `/welcome/bumble-for-friends` and through `?utm_source=bumble-for-friends`; check each creates a BFF access, not a Bumble one.

### 6. Partner updates

| Test                                                                                                                         | Where                        |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `{ therapySessionsPerCode }` changes only the limit; admins and accesses untouched                                           | `partner.service.spec.ts`    |
| `{ active: true }` on an active partner with one deactivated access leaves that access deactivated                           | `partner.service.spec.ts`    |
| `{ active: false }` deactivates the partner, its admins and every access; `{ active: true }` then reactivates them, as today | `partner.service.spec.ts`    |
| `{ automaticAccessCode: true }` creates the row; `false` sets it inactive; `true` again reuses it                            | `partner.service.spec.ts`    |
| Changing the therapy limit or automatic access code in the table sends only that field                                       | `cypress/integration/admin/` |

**Staging:** set BFF's therapy limit to 0 and switch its automatic access code off; check the register page asks for a code and a sign-up without one is refused. Switch it back on and check sign-up works.

## Delivery

### Release

The backend and frontend PRs merge to `develop` once reviewed, so both go to staging. The team tests there for as long as it needs; nothing else changes on `develop` meanwhile. The release PRs to `main` that merging opens wait for release day.

Before release day:

- on production, check that the partners' names in the database match the `partners` datasource values (`Badoo`, `Fruitz`, `Bumble`) apart from case (the course sync now matches names exactly), and that no two slugify alike (the migration would fail);
- check that Storyblok's webhook log shows deliveries succeeding to both frontends' `/api/revalidate` and both backends, and that Render's health check is on, so a backend that fails to start never takes traffic;
- once the team signs off on staging, the content team publishes `partners/bumble`, `partners/badoo` and `partners/fruitz`.

Release day:

1. Release the backend (`develop` → `main`). Check that production's `GET /v1/partner/active` lists the active partners, including Bumble and Badoo. Republish `partners/bumble-for-friends` once, so production gets BFF's row, inactive; it launches when a super admin activates it and its welcome story is published.
2. Release the frontend. If it builds before the backend is live, its build fails (the loader rejects the old backend's response); deploy it again.
3. Smoke-test: the Bumble and Badoo welcome pages, a Bumble welcome link with a code, a UTM link, the footer for a Bumble member, and a partner admin creating a code.

Either side rolls back on its own. Reverting the frontend restores the constants, files and strings; the published partner stories are harmless to it. Reverting the backend is safe because the backend PR drops nothing.

No Storyblok roles or webhook changes are needed: publishing can't launch anything without a super admin.

### Effort and risk

| Phase               | One developer | Complexity | Risk to members |
| ------------------- | ------------- | ---------- | --------------- |
| 1. Backend          | 2–3 days      | Low–medium | Low             |
| 2. Storyblok        | 0.5–1 day     | Low        | Low             |
| 3. Frontend         | 4–6 days      | Medium     | **Medium**      |
| 4. Asset generation | 2–3 days      | Medium     | Low             |

Production follows the team's testing on staging. Phase 4 ships after that, when a designer can review its output.

What still needs people: reviewing roughly 2,000–3,000 changed lines, Storyblok publishes, the Simplybook therapy check, design sign-off, and production releases (`develop` → `main` in both repos).

### Rollout

| Step  | Who                       | What                                                                                                                                                                                       |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Reviewer                  | Review chaynHQ/bloom-backend#1302 and merge it to `develop`. Check the staging backend deployed (the migration runs on startup) and that staging's `GET /v1/partner/active` returns a list |
| 2     | Reviewer                  | Rerun chaynHQ/bloom-frontend#2032's failed checks: its build calls that endpoint, so it fails until step 1 is on staging. Review it and merge it to `develop`                              |
| 3     | Content team, super admin | Add Bumble For Friends on staging ([Partners used for testing](#partners-used-for-testing)) and configure it in the dashboard                                                              |
| 4     | Team                      | Run the staging checks in each critical path above                                                                                                                                         |
| 5     | Content team              | After sign-off, publish `partners/bumble`, `partners/badoo` and `partners/fruitz`                                                                                                          |
| 6     | Release                   | Backend, then frontend, to production ([Release](#release))                                                                                                                                |
| Later | —                         | Phase 4, asset generation ([prompt](partner-onboarding-prompts.md)); one migration to drop the branding columns, after checking they hold no data                                          |

Merging to `develop` opens release PRs to `main` in both repos; leave them until release day.

**Shared things**

- **Storyblok:** one space serves staging and production. Only the content team publishes; phase 4 writes nothing to Storyblok until its output is approved.
- **Cypress:** suites that create and delete Cypress users share a database, so run them one after the other.

## Left out on purpose

| Not built                                                   | Why                                                                                                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activation checks and a readiness checklist                 | An unready partner isn't launched; the welcome link in the dashboard shows the result                                                                    |
| Backend calling the frontend to revalidate                  | The dashboard's server action does it, with no shared secret or firewall rule                                                                            |
| Per-partner live chat, or a separate "therapy enabled" flag | Every partner has live chat; a limit of 0 means no therapy                                                                                               |
| Backend setting therapy sessions itself                     | Would change how every code is granted; checking the values sent is enough                                                                               |
| Welcome page → partner reference field, UTM keyword field   | The slug already pairs them and is what partners use                                                                                                     |
| Joining Storyblok and the database by `storyblokUuid`       | The slug already pairs them, and renaming is ruled out                                                                                                   |
| Test partners, scripts or seeded rows                       | Real partners cover every case: Bumble For Friends for a slug that differs from the name and overlapping names, Fruitz for a partner that isn't launched |
| A cached fallback for a backend outage                      | Next already serves the last good page; any fallback would be cached into pages for 4 hours                                                              |
| Regenerate and resync buttons, CLI                          | Clearing a field and republishing does both                                                                                                              |
| Vector lockups, extra fonts                                 | A 3× PNG is sharp at header size; every partner language is Latin script                                                                                 |
| Storyblok roles, webhook renames                            | Publishing can't launch anything; the webhooks already work                                                                                              |

## Open questions

1. Should members who join through an automatic access code ever get therapy? This plan keeps it off.
2. Partner-specific banners like Fruitz's retirement notice: move to Storyblok later?
3. Hindi's `alt.bloomBumbleLogo` names Badoo instead of Bumble. The new shared string fixes it for every partner; tell the Hindi translator.
