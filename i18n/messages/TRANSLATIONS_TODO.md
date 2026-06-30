# Translations: Arabic (`ar`) & Turkish (`tr`)

## In-app strings — DONE ✅

The `ar.json` and `tr.json` files in every namespace folder have been **fully
translated** from `en.json` (previously they were English-seeded copies). All 12
namespaces are complete: account, admin, auth, courses, messaging, navigation,
partnerAdmin, resources, shared, therapy, welcome, whatsapp.

Verified: valid JSON, key sets identical to `en.json`, all ICU placeholders
(`{partnerName}`, `{hours}`, …) and rich-text tags (`<loginLink>`, `<bold>`, …)
preserved, Prettier-clean.

### Translation register (keep consistent for any future edits)

- **Arabic** — gender-neutral phrasing (nominal sentences, infinitives/masdar,
  plural "we"; avoid gendered verb/pronoun forms). Bloom is a feminist,
  trauma-informed service for survivors of gender-based violence, so the copy
  stays inclusive rather than defaulting to masculine or feminine.
- **Turkish** — warm informal "sen" address.
- Brand/legal names stay in Latin (Bloom, Chayn, Bumble, Badoo, Fruitz, WhatsApp,
  Google Meet, SimplyBook.me). URLs and company legal names are left unchanged.
- Turkish is left-to-right; Arabic is right-to-left (handled automatically via
  `lib/utils/getLocaleDirection.ts`).

Note: a handful of values are intentionally identical to English — age ranges
(`18-25` …), URLs, the `Bloom` brand string, and company legal names.

## Still pending: Storyblok CMS

**Storyblok CMS** must have `ar` and `tr` language dimensions created and content
translated — otherwise course/session/resource/policy pages fall back to default
content. That is a CMS/ops task tracked outside this repo.
