# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bloom is a trauma healing support web app by Chayn. It serves survivors via video courses, 1:1 therapy booking, and messaging. The `develop` branch is the source of truth — all PRs target `develop`, which auto-deploys to staging via Vercel. `develop` → `main` triggers production deployment.

## Commands

```bash
yarn dev          # Start dev server (Turbopack) at localhost:3000
yarn build        # Production build
yarn lint         # ESLint
yarn lint:fix     # ESLint with auto-fix
yarn format       # Prettier
yarn type-check   # TypeScript check (tsc)

yarn test                  # Jest unit tests
yarn test:watch            # Jest in watch mode

yarn cypress               # Open Cypress UI
yarn cypress:headless      # Run all Cypress tests headless
yarn cypress:headless-spec # Run a single spec: SPEC=<path> yarn cypress:headless-spec
```

To run a single Jest test file: `yarn test path/to/file.test.ts`

Husky + Pre-commit run lint and format on every commit. If a commit fails, fix lint errors and re-stage any auto-formatted files before committing again.

## Environment Setup

Requires a running [bloom-backend](https://github.com/chaynHQ/bloom-backend) at `http://localhost:35001`. Create `.env.local` from `docs/configure-env.md`. The Storyblok read-only token is public: `NEXT_PUBLIC_STORYBLOK_TOKEN=xB5HoaLRkYs8ySylSUnZjQtt`.

Cypress tests need additional env vars (see `docs/configure-cypress.md`) and a seeded local database.

## Architecture

### Routing & Internationalisation

All routes live under `app/[locale]/` — Next.js App Router with `next-intl`. Supported locales: `en`, `de`, `fr`, `es`, `pt`, `hi` (default: `en`, prefix omitted via `localePrefix: 'as-needed'`). The middleware in `middleware.ts` handles locale routing. Use `Link`, `redirect`, `usePathname`, `useRouter` from `i18n/routing` (not `next/navigation`) to keep locale context.

Translation strings live in `i18n/messages/`. The `next-intl` plugin is wired in `next.config.js`.

### Auth & User Loading

Authentication is Firebase-based (`lib/firebase.ts`, `lib/auth.ts`). The `useLoadUser` hook (`lib/hooks/useLoadUser.ts`) listens to Firebase's `onIdTokenChanged` and drives the Redux user slice. Auth state flows:

1. Firebase emits token → Redux `user.token` is set
2. `useLoadUser` triggers `getUser` RTK Query call → populates all user slices
3. `AuthGuard` (`components/guards/AuthGuard.tsx`) wraps the entire app in `BaseLayout` and redirects unauthenticated users. Pages under `admin`, `partner-admin`, `therapy`, `account`, `conversations`, `videos`, and course session paths require auth; everything else is public.

### State Management

RTK Query (`lib/api.ts`) handles all backend API calls with auto-reauth on 401 (refreshes Firebase token). Redux store (`lib/store.ts`) holds: `user`, `courses`, `partnerAccesses`, `partnerAdmin`, `partners`, `resources`, `therapySessions`. Use `useTypedSelector` and `useAppDispatch` from `lib/hooks/store` — not raw `useSelector`/`useDispatch`.

### Partner Access Model

Bloom is white-labelled for partners (Bumble, Badoo, Fruitz, etc.). A user's `partnerAccesses` array (from Redux) controls feature access: `featureTherapy`, `featureLiveChat`, therapy session quotas. Static partner branding (logos, footer links, social) is stored in `lib/constants/partners.ts` and merged into partner access state at hydration time.

### Content: Storyblok CMS

All course, session, page, and resource content comes from Storyblok. `lib/storyblok.ts` registers all Storyblok component mappings (e.g. `course` → `StoryblokCoursePage`). Dynamic `[slug]` pages fetch and render Storyblok stories. Images are only allowed from `a.storyblok.com`.

### Layout & Providers

`app/[locale]/layout.tsx` → `BaseLayout` wraps every page with:

- `RollbarProvider` + `AppRouterCacheProvider` (MUI/Emotion SSR)
- `NextIntlClientProvider`
- `ReduxProvider` (store)
- `StoryblokProvider`
- `AuthGuard`
- TopBar, Footer, MobileBottomNav, CookieBanner

MUI v7 with Emotion is the UI library. Theme is at `styles/theme.ts`. Fonts: Open Sans + Montserrat via `next/font`.

### Key Integrations

| Integration | Purpose                                              | Config                                                   |
| ----------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Firebase    | Auth                                                 | `lib/firebase.ts`, `NEXT_PUBLIC_FIREBASE_*` env vars     |
| Storyblok   | CMS                                                  | `lib/storyblok.ts`, `NEXT_PUBLIC_STORYBLOK_TOKEN`        |
| Simplybook  | Therapy booking                                      | `lib/simplybook.ts`, `NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL` |
| Front       | 1:1 chat via Application Channel API (custom widget) | `components/live-chat/`                                  |
| Rollbar     | Error tracking                                       | `lib/rollbar.ts`                                         |
| New Relic   | Performance (prod only)                              | `newrelic.js`, injected via `BaseLayout`                 |

### Feature Flags

Feature flags are environment-variable based, checked via `lib/featureFlag.ts` (`FeatureFlag` namespace). All flags use `NEXT_PUBLIC_FF_` prefix.

### Testing

- **Unit tests (Jest):** Co-located as `*.test.ts(x)`. Use `@testing-library/react`. Module alias `@/` maps to repo root.
- **E2E tests (Cypress):** In `cypress/integration/`, grouped into `auth`, `user-accounts`, `admin`, `user-content`, `partners`, `system`, `public`. Run individual groups via `yarn cypress:auth`, etc.
