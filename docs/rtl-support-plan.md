# RTL & New Locale Support Plan (Arabic + Turkish)

> Goal: add **Arabic (`ar`)** and **Turkish (`tr`)** as fully supported locales, and make the
> app correctly render **right-to-left (RTL)** for Arabic. This is a single source-of-truth task
> list intended to be executed largely by AI agents — every task is scoped, ordered, and lists
> the concrete files involved.

## Important framing

There are **two separate concerns** bundled in this request. Keeping them separate is what makes
the solution clean:

1. **Adding two new locales** (`ar`, `tr`) — routing, message files, date-fns locales, Storyblok
   dimensions, language menu, metadata. This applies to _both_ languages and has nothing to do
   with direction.
2. **Direction (RTL) support** — only **Arabic is RTL**. **Turkish is LTR** (Latin script with
   extended characters: ç ğ ı ş ö ü). The RTL layer must be driven by a `locale → direction`
   map (`ar → rtl`, everything else → `ltr`), never hardcoded to "the newly added languages".
   This keeps the door open for future RTL locales (Urdu, Farsi, Hebrew) with a one-line change.

## Recommended technical approach (the "best/cleanest" choice)

For RTL we use **CSS Logical Properties + native `dir` switching**, _not_ `stylis-plugin-rtl`.

Rationale:

- **MUI v7 (we're on `^7.3.9`) and Emotion already emit logical properties internally**, so MUI's
  own components (Drawer, Menu, Slider, inputs, etc.) flip automatically when `dir="rtl"` +
  `theme.direction = 'rtl'` are set. We only need to fix _our own_ hardcoded physical styles.
- Logical properties (`marginInlineStart`, `paddingInlineEnd`, `insetInlineStart`, `textAlign:
'start'`, etc.) flip automatically based on the inherited `dir` — **no runtime plugin, no second
  Emotion cache, no SSR double-render, no hydration mismatch risk.** `stylis-plugin-rtl` requires a
  per-direction Emotion cache and is the classic source of App-Router SSR pain.
- It is the modern, standards-based, future-proof recommendation and produces less code than the
  plugin approach. Since effort is not a constraint, converting our ~180 physical declarations to
  logical ones is the right investment.

Both `dir="rtl"` on `<html>` **and** `theme.direction = 'rtl'` must be set — the HTML attribute
drives logical-property resolution; the theme flag drives the handful of MUI components that read
`theme.direction` in JS.

What logical properties **cannot** auto-fix (handled explicitly in Phase 4):

- Directional **icons** (back/forward chevrons & arrows) — must be mirrored.
- **Transforms** (`translateX`, `rotate` on chevrons) — must be made direction-aware.
- Third-party **iframes/widgets** that take their own RTL flag (Simplybook).

---

## Phase 0 — Foundations: locale → direction model

- [ ] **0.1 Add the new locales to the routing config.**
      `i18n/routing.ts` — `locales: ['en','de','fr','es','pt','hi','ar','tr']`. Keep `defaultLocale:
'en'`, `localePrefix: 'as-needed'`.
- [ ] **0.2 Extend the `LANGUAGES` enum.** `lib/constants/enums.ts` — add `ar = 'ar'`, `tr = 'tr'`.
      Grep for exhaustive `switch`/object-map usages of `LANGUAGES` and update them.
- [ ] **0.3 Create the single direction utility.** New file `lib/utils/getLocaleDirection.ts`:
  ```ts
  export const RTL_LOCALES = ['ar'] as const; // add 'ur','fa','he' here in future
  export type Direction = 'ltr' | 'rtl';
  export const getLocaleDirection = (locale: string): Direction =>
    (RTL_LOCALES as readonly string[]).includes(locale) ? 'rtl' : 'ltr';
  ```
  This is the _only_ place direction is decided. Everything else imports from here.

## Phase 1 — Wire direction into the document & MUI

- [ ] **1.1 Set `dir` on `<html>`.** `components/layout/BaseLayout.tsx:78` — compute
      `const dir = getLocaleDirection(locale)` and render `<html lang={locale} dir={dir} ...>`.
- [ ] **1.2 Make the MUI theme direction-aware.** `styles/theme.ts` currently exports a single
      static theme (`createTheme({...})`). Refactor to a factory `createAppTheme(direction:
'ltr'|'rtl')` that injects `direction` into the `createTheme` options (keep
      `responsiveFontSizes` wrapping). Memoize the two instances (`ltrTheme`, `rtlTheme`) so we don't
      rebuild per render. Update the default export or provide `getTheme(direction)`.
- [ ] **1.3 Pass the right theme into `ThemeProvider`.** `BaseLayout.tsx:85` — `<ThemeProvider
theme={getTheme(dir)}>`.
- [ ] **1.4 Pass timezone/direction context to the client where needed.** `NextIntlClientProvider`
      already wraps everything; direction is available via `theme.direction` and `useLocale()`. Add a
      tiny client hook `useIsRtl()` (wraps `useTheme().direction === 'rtl'`) for the few components
      that need runtime direction (icon mirroring, transforms).
- [ ] **1.5 Confirm `AppRouterCacheProvider` stays default.** No custom Emotion cache / stylis
      plugin is added — this is intentional with the logical-properties approach. Note it in the PR
      description so nobody "helpfully" re-adds stylis-plugin-rtl.

## Phase 2 — Fonts for Arabic (and Turkish character coverage)

- [ ] **2.1 Add Latin-extended subset for Turkish.** `BaseLayout.tsx:31-43` — Open Sans &
      Montserrat currently use `subsets: ['latin']`. Add `'latin-ext'` so Turkish glyphs (ğ, ş, ı,
      etc.) render from the primary font rather than a fallback.
- [ ] **2.2 Add an Arabic-capable font.** Latin fonts cannot render Arabic. Load an Arabic font via
      `next/font/google` — recommended **IBM Plex Sans Arabic** or **Noto Sans Arabic** (clean,
      free, good weight range; Cairo is a warmer alternative). Expose it as a CSS variable
      (`--font-arabic`) alongside the existing variables on `<html>`.
- [ ] **2.3 Apply the Arabic font only for `ar`.** Cleanest: in `createAppTheme`, when
      `direction === 'rtl'` set `typography.fontFamily` (and the `h1`/`h2`/`h3` `fontFamily`) to
      `'var(--font-arabic)'` with the Latin fonts as fallback. Montserrat headings have no Arabic
      glyphs, so headings must also switch for `ar`. Verify weights map (Montserrat uses 300/400/500).
- [ ] **2.4 Sanity-check line-height/letter-spacing for Arabic.** Arabic needs more vertical space
      and no letter-spacing tracking. Add per-direction overrides in the theme typography if needed
      (review after first visual pass).

## Phase 3 — Convert hardcoded physical styles to logical properties (the big sweep)

~180 physical declarations across ~60 files. Convert mechanically; logical equivalents below.
A finding-by-finding inventory exists in the analysis — work directory by directory.

Mapping cheatsheet:

| Physical                      | Logical (use this)                                 |
| ----------------------------- | -------------------------------------------------- |
| `marginLeft` / `ml`           | `marginInlineStart` / `marginInlineStart` via `sx` |
| `marginRight` / `mr`          | `marginInlineEnd`                                  |
| `paddingLeft` / `pl`          | `paddingInlineStart`                               |
| `paddingRight` / `pr`         | `paddingInlineEnd`                                 |
| `left:` (positioning)         | `insetInlineStart`                                 |
| `right:` (positioning)        | `insetInlineEnd`                                   |
| `textAlign: 'left' / 'right'` | `textAlign: 'start' / 'end'`                       |
| `borderLeft` / `borderRight`  | `borderInlineStart` / `borderInlineEnd`            |
| `borderTopLeftRadius` etc.    | `borderStartStartRadius` etc. (logical radius)     |
| `float: 'left'/'right'`       | `float: 'inline-start'/'inline-end'`               |

Notes:

- MUI `sx` accepts logical longhands directly (`marginInlineStart: 2`). The `ml/mr/pl/pr`
  shorthands are physical — replace them with the logical longhands (there's no logical shorthand).
- `flexDirection: 'row'` and `justifyContent: 'flex-start'/'flex-end'` **flip automatically** under
  `dir="rtl"` — usually leave them. Audit each `flex-end` to confirm it's a layout edge (should
  flip) vs. a true visual anchor (rare).
- **`row-reverse` is the dangerous one** — it reverses _again_ on top of the dir flip. Audit
  `components/resources/ResourceConversationHeader.tsx:36`,
  `components/pages/MessagingPage.tsx:21`, `components/forms/RegisterNotesForm.tsx:44`.

Sub-tasks by area (most-affected first):

- [ ] **3.1 Shared style helpers & theme.** `styles/common.ts` (e.g. breadcrumb `left:` →
      `insetInlineStart`), `styles/theme.ts` MuiContainer/MuiButton padding (lines ~106-129, 177-178)
      → logical padding; MuiSlider value-label positioning (`right: '-34px'`, `transformOrigin:
'bottom left'`, lines ~480-491) → make direction-aware.
- [ ] **3.2 `styles/globals.css`.** `padding-left: 1.75rem` on `ul, ol` (line ~35) →
      `padding-inline-start`. Audit any other physical CSS.
- [ ] **3.3 Layout components (11).** Header, TopBar, HomeHeader, Footer, CookieBanner,
      LeaveSiteButton, MobileBottomNav (`left:0; right:0` → `insetInline: 0`), LoginDialog,
      DesktopTopNav, DesktopMainNav, PartnerHeader.
- [ ] **3.4 Storyblok components (9).** StoryblokCard, StoryblokImage, StoryblokVideo,
      StoryblokAudio, StoryblokAccordion, StoryblokTeamMemberCard, StoryblokTeamMembersCards/Section,
      StoryblokSessionPage. Note the alignment prop logic (`alignment === 'right' ? 'right' : 'left'`)
      — map to `'end'/'start'` and decide whether CMS "left/right" should mean physical or logical.
      **Decision point:** for editorial content, content authors usually mean _visual_ left/right.
      Recommend: treat Storyblok alignment as **logical** (start/end) so RTL content reads naturally;
      document this for the content team.
- [ ] **3.5 Form components (9).** LoginForm, ResetPasswordForm, RegisterForm, RegisterNotesForm,
      ApplyCodeForm, PhoneInput (note flag/dropdown positioning at lines ~31,34,43,88,101 — phone
      input is LTR-by-nature for the number itself; keep the numeric field `dir="ltr"`),
      AboutYouDemographicForm, AboutYouSetAForm, EmailRemindersSettingsForm.
- [ ] **3.6 Page components (7).** LoginPage, NotesPage, ErrorPage, NotFound, AboutYouPage,
      RegisterPage, ApplyACodePage (watch negative margins like `marginLeft: -3`).
- [ ] **3.7 Card components (4).** CourseCard, SessionCard, ResourceCard, RelatedContentCard
      (`marginLeft: 'auto'` push patterns → `marginInlineStart: 'auto'`).
- [ ] **3.8 Resource headers (3) & remaining (common/, therapy/, banner/, video/, session/,
      messaging/).** Including VideoTranscriptModal corner radii, TherapyBookingItem `borderLeft`
      accent (line ~239), MessageBubble chat-bubble radii/alignment (chat bubbles must mirror sender
      side in RTL).

## Phase 4 — Directional icons & transforms (cannot be auto-flipped)

- [ ] **4.1 Mirror navigational chevrons/arrows.** ~23 instances across 10 files: `KeyboardArrow
Left/Right`, `ArrowBack`, `ArrowForward`, `ArrowForwardIos` in Header, LoginPage, NotesPage,
      LoginDialog, StoryblokSessionPage, RelatedContentCard, Carousel, ResourceShortsHeader,
      ResourceSingleVideoHeader, ResourceConversationHeader. Cleanest approach: a small wrapper
      (`<DirectionalIcon>`) or `sx={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}` via `useIsRtl()`.
      For "back/next" semantics consider swapping the icon component itself (Back uses ArrowForward in
      RTL) rather than mirroring, where the glyph would otherwise look wrong.
- [ ] **4.2 Make chevron rotations direction-neutral.** The `rotate(180deg)` expand/collapse
      chevrons (CourseCard, SessionCard, SessionContentCard, StoryblokCard, TherapyBookingItem) rotate
      on the vertical axis and are **direction-safe** — but verify any paired `marginLeft:'auto'` was
      converted in Phase 3.
- [ ] **4.3 Carousel navigation.** `components/common/Carousel.tsx` prev/next must swap meaning in
      RTL (left arrow → next). Confirm the slide transform also respects direction.

## Phase 5 — Locale data: dates, numbers, third-party widgets

- [ ] **5.1 date-fns locales.** `lib/utils/dates.ts` — import and map `ar` and `tr` from
      `date-fns/locale` (`ar`, `tr`). Verify `formatTherapyDates.ts` format strings render acceptably
      in Arabic (month/weekday names) and that Arabic-Indic vs Western digit choice is intentional.
- [ ] **5.2 Number/date display via next-intl/Intl.** Confirm any `Intl.DateTimeFormat`/
      `toLocaleString` calls receive the active locale (they pick up Arabic-Indic numerals
      automatically for `ar`). Decide product-wise whether Arabic numerals are desired; if Western
      digits are preferred, use the `ar-u-nu-latn` locale extension.
- [ ] **5.3 Simplybook booking widget.** `lib/simplybook.ts:25` — `is_rtl` is hardcoded `false`.
      Make it `getLocaleDirection(locale) === 'rtl'` and pass the locale to the widget config.
- [ ] **5.4 Front/messaging chat.** WebSocket-based; the bubble layout is ours (Phase 3.8). Ensure
      message input and bubbles inherit `dir` and that user-typed content uses `dir="auto"` so mixed
      LTR/RTL messages render correctly.
- [ ] **5.5 Video players (react-player / Vimeo).** Player chrome handles itself; just verify the
      container positioning (Phase 3) and any custom overlay controls (transcript modal) mirror.
- [ ] **5.6 `dir="auto"` on user-generated / CMS text fields.** Apply to inputs, chat, and any
      free-text Storyblok rich-text so the browser infers direction per string.

## Phase 6 — Translations & CMS content

- [ ] **6.1 UI string files.** Create `ar.json` and `tr.json` in **all 12 message namespaces**
      (`shared, navigation, auth, account, courses, admin, therapy, welcome, partnerAdmin, messaging,
resources, whatsapp`) under `i18n/messages/*/`. Add the two imports per locale in
      `i18n/request.ts` (they already glob by `${locale}`, so just the files are needed — verify).
      → 24 new files. Seed from `en.json` keys; route to professional/AI translation.
- [ ] **6.2 Storyblok language dimensions.** `lib/storyblok.ts` passes `language: locale` straight
      through, so no code change is needed — **but the Storyblok space must have `ar` and `tr`
      language dimensions created and content translated**. This is a CMS/ops task and a hard
      dependency for course/session/resource/policy pages to show translated content. Track it
      explicitly; without it those pages fall back to default content.
- [ ] **6.3 Metadata & SEO.** `lib/utils/generateMetadataBase.ts` — add `ar` and `tr` to the
      `alternates.languages` hreflang map (`ar`, `tr`), and extend the `localeString` mapping for
      OpenGraph (`ar_AR`/`ar`, `tr_TR`). Confirm the canonical/localized URL logic handles the new
      locales.
- [ ] **6.4 Language menu.** `components/layout/LanguageMenu.tsx:19-26` — add `ar: 'العربية'`,
      `tr: 'Türkçe'` to `languageMap`. The menu itself should render its labels with `dir="auto"` so
      the Arabic entry displays correctly within an LTR menu.

## Phase 7 — Verification & QA

- [ ] **7.1 Type-check & lint.** `yarn type-check`, `yarn lint` after the enum/routing changes
      (exhaustive switches on `LANGUAGES` will surface missing cases).
- [ ] **7.2 Unit tests.** Add a test for `getLocaleDirection`. Run `yarn test`; update any
      snapshot/test that asserts on physical CSS props or the locale list.
- [ ] **7.3 Cypress.** The locale list and language menu are exercised in e2e; update fixtures and
      add an `ar` smoke test asserting `<html dir="rtl">` and that a known page mirrors. Consider one
      visual check per major template (home, course, session, therapy booking, account, messaging).
- [ ] **7.4 Manual RTL visual pass** (the real bug-finder). Walk every top-level route in `ar`:
      home, courses + course/[slug], session pages, therapy + book-session (Simplybook iframe),
      account + sub-pages, auth (login/register/reset), conversations/shorts/videos, messaging,
      meet-the-team, welcome/[partner], policies, admin & partner-admin. Check: text alignment,
      icon/chevron direction, modals/drawers anchoring, sliders, carousels, chat bubble sides, fixed
      buttons (LeaveSiteButton, PWA banners, MobileBottomNav), and font rendering.
- [ ] **7.5 LTR regression pass.** Confirm `en` (and one other LTR locale) is visually unchanged —
      logical properties must be byte-for-byte equivalent in LTR. Pay attention to the converted
      Storyblok alignment logic and any `flex-end`.
- [ ] **7.6 Turkish content pass.** Verify `tr` works as a normal LTR locale: glyph rendering
      (latin-ext), date formatting, all strings present, no accidental RTL applied.

---

## Dependency / ordering summary

```
Phase 0 (locales + direction util)
   ├─► Phase 1 (dir attr + theme direction)         ─┐
   ├─► Phase 2 (fonts)                                ├─► Phase 7 (QA)
   ├─► Phase 3 (logical-property sweep)  ◄────────────┤
   ├─► Phase 4 (icons/transforms)        ◄── needs 1  │
   ├─► Phase 5 (dates/widgets)                         │
   └─► Phase 6 (translations + Storyblok dims) ────────┘
```

Phases 3–6 are largely parallelizable once 0–1 land. The two hard external dependencies that are
**not** code and must be scheduled early are: (a) **professional/AI translation** of 24 message
files, and (b) **Storyblok `ar`/`tr` dimensions + translated CMS content**.

## Key decisions captured

1. **Logical properties over `stylis-plugin-rtl`** — cleaner, no SSR/cache complexity, MUI v7
   native. (See "Recommended technical approach".)
2. **Direction is locale-derived** (`ar → rtl`), never tied to "new languages"; Turkish is LTR.
3. **Storyblok alignment treated as logical** (start/end) so authored content reads naturally in
   RTL — requires a note to the content team.
4. **Arabic gets a dedicated font**; Turkish only needs `latin-ext`.
