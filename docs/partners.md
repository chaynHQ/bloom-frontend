# Partners

A partner is an organisation whose members use Bloom through it, such as Bumble or Badoo. Branding lives in Storyblok and each partner's status lives in the backend, so adding or changing a partner is a content and admin task with no code change or deploy. The backend side (tables, Storyblok sync, settings, access codes) is in [bloom-backend's `docs/partners.md`](https://github.com/chaynHQ/bloom-backend/blob/develop/docs/partners.md).

## Adding a partner

Do this on staging first, then production.

| Step | Who          | Where           | What                                                                                                                                                                                                                                        |
| ---- | ------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Content team | Storyblok       | Create `partners/<slug>`. In the create dialog, type the slug yourself (e.g. `bff`): Storyblok fills it from the story name otherwise, and it can't change once published. Fill in the fields below and publish it                          |
| 2    | (automatic)  | Backend         | Each backend's webhook creates the partner in its own database, staging and production, **inactive**, with a therapy limit of 0 and no automatic access code                                                                                |
| 3    | (automatic)  | Frontend        | Production's webhook generates the lockups and illustration into the story's draft and, when it generates any, adds the partner to the `partners` datasource. The Storyblok space is shared, so staging, which reads drafts, shows them too |
| 4    | Designer     | Storyblok       | Reload the story, review the generated images, replace any that need it, and publish again                                                                                                                                                  |
| 5    | Content team | Storyblok       | Create `welcome/<slug>`: copy a similar partner's welcome page and replace its content in every language, or start a new one. Tag courses and resources with the partner in `included_for_partners`. Keep the welcome story as a draft      |
| 6    | Super admin  | Admin dashboard | In the staging dashboard: set the therapy limit, automatic access code and, for a sub-brand, its parent, create partner admins, then **activate** the partner                                                                               |
| 7    | Team         | Staging         | Review and test the partner on staging: every welcome page language, sign-up with and without a code, partner-only content and the footer                                                                                                   |
| 8    | Team         | Production      | Launch: publish the welcome story, then in the production dashboard repeat step 6 and activate                                                                                                                                              |

Publishing never launches a partner: only a super admin activating it does. A published partner story can be read through Storyblok's public API, though, so publish it only once the partnership can be public.

Publishing the partner story during staging setup is safe: a partner is live in production only once a super admin activates it there **and** its welcome story is published. Keep `welcome/<slug>` as a draft until launch; staging shows drafts.

If nothing is generated a minute after publishing, the webhook probably didn't reach production (see `docs/configure-env.md`): publish again, or upload the images by hand. If every image was uploaded before the first publish, nothing is generated, so add the datasource entry by hand: name = the slug, value = the partner's name.

## The `partner` content type

| Field                                                                           | Type                      | Translatable | Notes                                                              |
| ------------------------------------------------------------------------------- | ------------------------- | ------------ | ------------------------------------------------------------------ |
| `name`                                                                          | Text, required            | No           | Display name. Must equal the value used in `included_for_partners` |
| `legal_name`                                                                    | Text, required            | No           | The footer's second line, e.g. `BUMBLE HOLDING LTD`                |
| `logo`                                                                          | Asset (image), required   | No           | The partner's own logo, SVG or transparent PNG                     |
| `brand_color`                                                                   | Text, `#rrggbb`, required | No           | Colours the generated illustration                                 |
| `partnership_logo`                                                              | Asset (image)             | Yes          | The "Bloom × partner" lockup, one per language                     |
| `illustration`                                                                  | Asset (image)             | No           | The Bloom-head illustration in the partner's colour                |
| `website`, `facebook`, `instagram`, `twitter`, `youtube`, `tiktok`, `pinterest` | Text                      | No           | Footer links                                                       |

The slug is the partner's permanent key: the welcome page is `/welcome/<slug>`, UTM links name it, and the backend pairs the story with the partner by it. "In partnership with" and the logos' alt text are shared app strings with the partner's name filled in (`footer.inPartnershipWith`, `alt.partnerLogo`, `alt.partnershipLogo`), so a new partner needs no translations.

### Sub-brands

A sub-brand, such as Bumble For Friends of Bumble, has its own partner story, logo included. A super admin sets a partner's parent in the admin dashboard's partners table, in each environment; it's stored in the backend as `partner.parentId` (one level only), so reports can group a brand's partners. While a sub-brand's `logo` is the same file as its parent's, the register and apply-a-code pages show that logo once, linked to the parent's welcome page, with a link to each partner's welcome page below it by name, and the footer shows one block per brand. A sub-brand with a logo of its own, or whose parent isn't active, shows on its own. Each partner keeps its own welcome page, access codes, settings and analytics.

## Changing a partner

- **Branding:** edit the partner story and publish. The webhook refreshes cached pages; without it they refresh within 4 hours.
- **New images:** clear `partnership_logo` (in a language) or `illustration` and publish. Production generates the empty ones into the draft for review. Publishing any partner story with a language's lockup missing does the same, including Bumble, Badoo and Fruitz.
- **Settings:** therapy limit, automatic access code, parent and status are in the admin dashboard's partners table. Changes show on the site straight away.
- **Taking a partner off the site:** unpublish its welcome story. **Don't deactivate it to hide it:** deactivating also deactivates its partner admins and every member's access.
- **Never rename or move a partner story.** The backend keeps the slug it was created with, so a renamed story silently stops launching. If a slug really must change, a developer updates the partner's slug in the database too.

## How the frontend uses partners

`lib/partners/loader.ts` builds two sets per locale, cached under `PARTNERS_CACHE_TAG` for 4 hours and refreshed by the Storyblok webhook (`/api/revalidate`) and by the admin dashboard's server action:

| Set          | A partner is in it when                                                           | Used for                                                                                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Branded**  | its `partners/<slug>` story exists                                                | Branding for signed-in members and partner admins, matched by name (`usePartner`)                                                                                                                       |
| **Launched** | branded, **and** active in the backend, **and** its `welcome/<slug>` story exists | Everything a URL or referral can reach, matched by slug (`resolveLaunchedPartner`): welcome pages, `?partner=`, the referral cookie, UTM links, the sitemap, partner lists on register and apply-a-code |

- **"Exists"** means in `STORYBLOK_ENVIRONMENT`: published in production, draft or published on staging and locally. So a partner can be launched on staging while its welcome story is still a draft.
- **Failures:** if Storyblok or `GET /v1/partner/active` fails, or the backend returns something other than a list, the loader throws and nothing catches it. Pages are statically cached, so an empty fallback would be cached for 4 hours; a failed refresh keeps the last good page instead. A build with the backend down fails.
- **Welcome pages** render only for launched partners, and unknown slugs render on request, so activating a partner makes its page appear without a deploy.
- **UTM attribution:** a launched slug anywhere in the five UTM parameters credits that partner. When the data names more than one, the longest slug wins, so `utm_source=bumble&utm_campaign=bff-launch` credits Bumble: a partner's links should name only its own slug.
- **Analytics:** partner event names use the slug in upper case, with hyphens as underscores (`BFF_PROMO_GET_STARTED_CLICKED`).
- **Footer:** Chayn's own content (`publicContent` in `lib/constants/partners.ts`), then the visitor's own partners and the partner of the welcome page they're on. `?partner=` and the referral cookie only brand signed-out visitors, so someone who browsed Bumble's welcome page and then signed in as a Badoo member sees only Badoo (`getFooterPartners`).

## Image generation

`lib/partnerAssets/` runs from `/api/revalidate`, after the response, when a published partner story has an empty `illustration` or a language's `partnership_logo` is empty. It renders each lockup (Bloom wordmark, "In partnership with" in that language, the partner's logo) to a PNG at 3×, recolours the Bloom-head illustration with a pastel of `brand_color`, uploads them, fills only the empty fields in the draft, and adds the datasource entry if it's missing. With no empty image fields it does nothing, including the datasource entry. It never publishes.

It runs in production and locally, never on staging: both environments receive the same Storyblok webhooks, so it would run twice. The space is shared, so production's run fills the draft staging reads. It needs `STORYBLOK_OAUTH_TOKEN` and `STORYBLOK_SPACE_ID` in Vercel's production environment (see `docs/configure-env.md`); without them it's skipped with a warning. An editor who saves from a tab opened before generation finished clears the generated fields, and the next publish generates them again.

## Tests

There are no test partners anywhere: no seeded rows, no Storyblok test stories. Unit tests use real partners as in-memory fixtures (`lib/partners/partnerFixtures.ts`): Bumble, Badoo, Fruitz (branded, not launched) and Bumble For Friends (`bff`, whose name contains "Bumble"). Cypress uses only Bumble, Badoo, Fruitz and slugs that don't exist.
