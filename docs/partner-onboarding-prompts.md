# Partner onboarding: phase 4 prompt

Phases 1–3 of [partner-onboarding-plan.md](partner-onboarding-plan.md) are built: the backend in chaynHQ/bloom-backend#1302, the Storyblok content type and drafts directly in Storyblok, and the frontend and admin dashboard in chaynHQ/bloom-frontend#2032. Phase 4, asset generation, is the one left. Start it once phases 1–3 are stable in production, by pasting this prompt into a fresh Claude Code session in `/Users/anna/Sites/bloom-frontend`.

```
You are building phase 4 of partner onboarding, asset generation: a separate PR to develop.

Rules. Read the whole plan (/Users/anna/Sites/bloom-frontend/docs/partner-onboarding-plan.md) and the repo's CLAUDE.md first. Edit only these files: lib/partnerAssets/, its font, package.json, yarn.lock, next.config.js and app/api/revalidate/route.ts; if you need a change anywhere else, stop and tell me. Write the tests first and watch them fail, then implement. Never touch a staging or production database, and never publish in Storyblok. There are no test partners: never create test partner data in Storyblok or any database, and use only Bumble, Badoo, Fruitz and Bumble For Friends in tests (plan: Partners used for testing). Follow CLAUDE.md's code style and keep comments to a non-obvious why. Build only what the plan asks for; its "Left out on purpose" table lists what not to add. Until I approve the output, write nothing to Storyblok: generate to local files, and test write-back against a mocked Management API. Done means lint, type-check and tests pass, then commit, push, open a draft PR against develop that lists what it covers and anything not done, and report the link. Never merge.

Set-up:
  git fetch && git worktree add ../bloom-frontend-g -b partners/assets origin/develop
  cd ../bloom-frontend-g
  cp ../bloom-frontend/.env.local .
  yarn install

Build lib/partnerAssets/:
1. Lockup per language (en, de, fr, es, pt, hi):
   - an SVG layout matching the old public/bloom_bumble_logo.svg (deleted by #2032; take it from git history): Bloom wordmark from public/bloom_logo.svg, then footer.inPartnershipWith for that language, then the partner logo scaled to the wordmark's width (nested SVG by viewBox, or an embedded PNG);
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
- generate for Bumble, Badoo, Fruitz and Bumble For Friends (its logo from the BFF story) plus two awkward logos (very wide, square icon), in all six languages, and look at every image;
- compare the English Bumble output with the old public/bloom_bumble_logo.svg;
- show me a contact sheet.

Verify:
- unit tests for layout maths, colour clamping, empty-field-only write-back and the staging skip;
- once I approve the output: a local webhook call for partners/bff fills only its empty fields in the draft, and a second call changes nothing.

Finish: the PR description notes that production needs STORYBLOK_OAUTH_TOKEN and STORYBLOK_SPACE_ID in Vercel's production environment only, preferably a dedicated account's token.
```
