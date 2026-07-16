'use client';

import CloseRounded from '@mui/icons-material/CloseRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Collapse,
  Container,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmailRemindersSettingsBanner } from '@/components/banner/EmailRemindersSettingsBanner';
import { SignUpBanner } from '@/components/banner/SignUpBanner';
import ScrollToSignUpButton from '@/components/common/ScrollToSignUpButton';
import { EMAIL_REMINDERS_FREQUENCY, PROGRESS_STATUS } from '@/lib/constants/enums';
import {
  LIBRARY_FILTERED,
  LIBRARY_FILTERS_CLEARED,
  LIBRARY_ITEM_CLICKED,
  LIBRARY_LOAD_MORE_CLICKED,
  LIBRARY_SEARCHED,
  LIBRARY_SUPPORT_CARD_CLICKED,
  LIBRARY_VIEWED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import chatIcon from '@/public/chat_icon.svg';
import illustrationCourses from '@/public/illustration_courses.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import {
  filterLibraryItems,
  FORMAT_KEYS,
  KIND_KEYS,
  THEME_KEYS,
  toggle,
  type Format,
  type KindFilter,
  type LengthBucket,
  type LibraryItem,
  type LibraryStories,
  type ThemeKey,
} from '@/lib/utils/libraryData';
import Header from '../layout/Header';
import { FilterGroups } from '../library/FilterGroups';
import { LibraryCard } from '../library/LibraryCard';
import {
  BAND_GRADIENT,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  CHIP_BG,
  CHIP_BG_HOVER,
  HEADING_FONT,
  INPUT_BORDER,
  PAGE_BG,
} from '../library/libraryTokens';
import { SectionLabel } from '../library/SectionLabel';
import { SupportCard } from '../library/SupportCard';

// How many cards to show before the "Load more" button, and how many more each press reveals.
const PAGE_SIZE = 8;

// A search event per keystroke would be noise; wait for the typing to settle first.
const SEARCH_EVENT_DEBOUNCE_MS = 1000;

// Design: 264px of sidebar content + a 24px gutter before the divider. Box-sizing is border-box,
// so the column is 264 + 24 wide for its rows to measure 264.
const SIDEBAR_CONTENT = 264;
const SIDEBAR_GUTTER = 3; // theme spacing units → 24px
const SIDEBAR_WIDTH = SIDEBAR_CONTENT + 24;

// Vertical padding for the browse section. It lives on the two columns rather than the Container
// so the divider between them spans the full height of the section, edge to edge.
const BROWSE_PY = { xs: 4, md: 6 };

// Analytics params are scalars, so a multi-select filter reports as a comma-separated list.
const reportList = (values: string[]) => (values.length ? values.join(',') : 'none');

// A LibraryItem's `progress` is a translation key ('started'); analytics reports a PROGRESS_STATUS
// ('Started'), matching course/resource progress events so the library can be compared against them.
const PROGRESS_STATUS_BY_ITEM_PROGRESS: Record<
  NonNullable<LibraryItem['progress']> | 'none',
  PROGRESS_STATUS
> = {
  started: PROGRESS_STATUS.STARTED,
  completed: PROGRESS_STATUS.COMPLETED,
  none: PROGRESS_STATUS.NOT_STARTED,
};

export default function LibraryPage({ stories }: { stories: LibraryStories }) {
  const t = useTranslations('Library');
  const items = useLibraryItems(stories);

  // Deep links seed the initial filter state: `?type=course` opens on the Courses tab,
  // `?theme=<key>` selects a theme card. An unknown theme key is ignored.
  const searchParams = useSearchParams();
  const themeParam = searchParams.get('theme');
  const initialTheme = THEME_KEYS.find((theme) => theme === themeParam);

  const [keyword, setKeyword] = useState('');
  const [themes, setThemes] = useState<ThemeKey[]>(initialTheme ? [initialTheme] : []);
  const [kind, setKind] = useState<KindFilter>(
    searchParams.get('type') === 'course' ? 'course' : 'all',
  );
  const [formats, setFormats] = useState<Format[]>([]);
  const [lengths, setLengths] = useState<LengthBucket[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // On mobile the filter checkboxes collapse behind a "Filter" button (they're always shown on
  // desktop via CSS breakpoints); this only drives the small-screen open/closed state.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userEmailRemindersFrequency = useTypedSelector(
    (state) => state.user.emailRemindersFrequency,
  );
  const userToken = useTypedSelector((state) => state.user.token);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const showEmailRemindersBanner =
    isLoggedIn && userEmailRemindersFrequency === EMAIL_REMINDERS_FREQUENCY.NEVER;

  // A signed-in user briefly looks anonymous: partnerAccesses/createdAt only arrive after the
  // getUser query, which runs once auth resolves. Reporting in that window would misattribute
  // partner users as PUBLIC_USER, so wait until auth has resolved and the user record has landed
  // (or there is no token at all).
  const userSettled = !authStateLoading && (!userToken || Boolean(userId));

  const eventUserData = useMemo(
    () => getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    [userCreatedAt, partnerAccesses, partnerAdmin],
  );

  // Format and length describe a single session; a course has neither. Rather than let the user
  // build a combination that can only ever return nothing, both groups switch off (and clear)
  // while "Courses" is selected.
  const sessionFiltersDisabled = kind === 'course';

  const selectKind = (next: KindFilter) => {
    setKind(next);
    if (next === 'course') {
      setFormats([]);
      setLengths([]);
    }
  };

  // Format options are data-driven: only the single-session formats that actually exist in the
  // library today (audio/video now) are offered.
  const formatOptions = useMemo(
    () => FORMAT_KEYS.filter((format) => items.some((item) => item.format === format)),
    [items],
  );

  const results = useMemo(
    () => filterLibraryItems(items, { keyword, kind, themes, formats, lengths }),
    [items, keyword, themes, kind, formats, lengths],
  );

  // Reset pagination whenever the filters change so "Load more" starts from the top. Adjusting
  // state during render is the React-recommended pattern for deriving state from a changing key.
  const filterKey = `${keyword}|${themes.join(',')}|${kind}|${formats.join(',')}|${lengths.join(',')}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  // ---- Analytics ----
  // Each event reports the result count at the time of the interaction; because the count is an
  // effect dependency, each effect guards on what it last reported so a count change alone can't
  // re-fire it.
  const resultsCount = results.length;

  // The page view waits for the user to settle so it can be attributed to their partner, and
  // reports the filters it opened on (e.g. a `?theme=` deep link).
  const viewLogged = useRef(false);
  useEffect(() => {
    if (!userSettled || viewLogged.current) return;
    viewLogged.current = true;
    logEvent(LIBRARY_VIEWED, {
      library_kind: kind,
      library_themes: reportList(themes),
      ...eventUserData,
    });
    // Reports the filter state the page opened with, not whatever it has become since — the user
    // has had no chance to change it before this fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettled, eventUserData]);

  // The search term is deeply personal, so it is never sent to analytics — only its length and
  // the result count, enough to tell whether the library is findable.
  const loggedSearch = useRef('');
  useEffect(() => {
    const term = keyword.trim();
    // Clearing the box arms the next search, so searching the same term twice reports twice.
    if (!term) {
      loggedSearch.current = '';
      return;
    }
    if (loggedSearch.current === term) return;
    const timer = setTimeout(() => {
      loggedSearch.current = term;
      logEvent(LIBRARY_SEARCHED, {
        library_search_term_length: term.length,
        library_results_count: resultsCount,
        ...eventUserData,
      });
    }, SEARCH_EVENT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword, resultsCount, eventUserData]);

  // Report the whole filter state on every change, so a report can read the combination a user
  // arrived at rather than having to reassemble it from individual toggles.
  const filterState = `${kind}|${themes.join(',')}|${formats.join(',')}|${lengths.join(',')}`;
  const loggedFilterState = useRef(filterState);
  useEffect(() => {
    if (loggedFilterState.current === filterState) return;
    loggedFilterState.current = filterState;
    logEvent(LIBRARY_FILTERED, {
      library_kind: kind,
      library_themes: reportList(themes),
      library_formats: reportList(formats),
      library_lengths: reportList(lengths),
      library_results_count: resultsCount,
      ...eventUserData,
    });
  }, [filterState, kind, themes, formats, lengths, resultsCount, eventUserData]);

  const logItemClick = useCallback(
    (item: LibraryItem, index: number) => {
      logEvent(LIBRARY_ITEM_CLICKED, {
        library_item_name: item.title,
        library_item_storyblok_uuid: item.id,
        library_item_kind: item.kind,
        library_item_format: item.format ?? null,
        library_item_progress: PROGRESS_STATUS_BY_ITEM_PROGRESS[item.progress ?? 'none'],
        library_item_position: index + 1, // 1-based rank in the filtered results
        library_results_count: resultsCount,
        ...eventUserData,
      });
    },
    [resultsCount, eventUserData],
  );

  const loadMore = () => {
    const nextVisible = visibleCount + PAGE_SIZE;
    setVisibleCount(nextVisible);
    logEvent(LIBRARY_LOAD_MORE_CLICKED, {
      library_results_count: resultsCount,
      library_visible_count: Math.min(nextVisible, resultsCount),
      ...eventUserData,
    });
  };

  // Selected themes appear as descriptive cards above the results, not as sidebar filters.
  const selectedThemes = THEME_KEYS.filter((theme) => themes.includes(theme));
  const filtersActive = Boolean(keyword) || formats.length > 0 || lengths.length > 0;

  const clearFilters = () => {
    setKeyword('');
    setFormats([]);
    setLengths([]);
    logEvent(LIBRARY_FILTERS_CLEARED, eventUserData);
  };
  const clearAll = () => {
    clearFilters();
    setThemes([]);
    setKind('all');
  };

  return (
    <Box>
      {/* ---- Hero: the shared, redesigned page header ---- */}
      <Header
        title={t('title')}
        imageSrc={illustrationCourses}
        imageAlt="alt.personSitting"
        introduction={t('introduction')}
        cta={!isLoggedIn ? <ScrollToSignUpButton /> : undefined}
      />

      {/* ---- Explore by theme ---- */}
      <Container
        sx={{
          backgroundColor: PAGE_BG,
          borderBottom: '1px solid',
          borderColor: CARD_BORDER,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <SectionLabel
          label={t('exploreByTheme')}
          onReset={themes.length ? () => setThemes([]) : undefined}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            mt: 1,
          }}
        >
          {THEME_KEYS.map((theme) => {
            const active = themes.includes(theme);
            return (
              <Card
                key={theme}
                sx={{
                  m: 0,
                  borderRadius: '8px',
                  backgroundColor: CARD_SURFACE,
                  boxShadow: CARD_SHADOW,
                }}
              >
                <CardActionArea
                  onClick={() => setThemes((p) => toggle(p, theme))}
                  aria-pressed={active}
                  qa-id={`library-theme-${theme}`}
                  sx={{
                    p: 1.5,
                    height: '100%',
                    backgroundColor: CARD_SURFACE,
                    borderRadius: '8px',
                    // A pink ring marks the active theme; the transparent border on inactive
                    // cards keeps their size identical so selection never shifts the layout.
                    border: '2px solid',
                    borderColor: active ? 'primary.dark' : 'transparent',
                    '&:hover': { backgroundColor: 'common.white' },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: HEADING_FONT,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {t(`themes.${theme}.label`)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.700' }}>
                    {t(`themes.${theme}.blurb`)}
                  </Typography>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Container>

      {/* ---- Filters + results ----
           Vertical padding sits on the two columns, not the Container, so the divider on the
           sidebar's inline edge spans the full section height. On mobile the row stacks and the
           divider is dropped. */}
      <Container sx={{ backgroundColor: PAGE_BG, py: '0 !important' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: { xs: '100%', md: SIDEBAR_WIDTH },
              flexShrink: 0,
              pt: BROWSE_PY,
              pb: { xs: 0, md: 6 },
              pr: { md: SIDEBAR_GUTTER },
              borderInlineEnd: { md: '1px solid' },
              borderColor: { md: CARD_BORDER },
            }}
          >
            <SectionLabel
              label={t('filterHeading')}
              onReset={filtersActive ? clearFilters : undefined}
            />
            {/* Search + (mobile-only) Filter toggle. The checkbox groups are always visible on
                desktop and collapse behind the toggle on mobile. */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('searchPlaceholder')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                sx={{
                  m: 0,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '100px',
                    backgroundColor: 'common.white',
                    '& fieldset': { borderColor: INPUT_BORDER },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded fontSize="small" sx={{ color: 'grey.600' }} />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { 'qa-id': 'library-search-input' },
                }}
              />
              <Button
                onClick={() => setMobileFiltersOpen((o) => !o)}
                variant="outlined"
                color="secondary"
                aria-expanded={mobileFiltersOpen}
                startIcon={<TuneRounded />}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  flexShrink: 0,
                  borderRadius: '100px',
                  backgroundColor: 'common.white',
                }}
              >
                {t('filterButtonLabel')}
              </Button>
            </Box>
            {keyword && (
              <Chip
                label={keyword}
                onDelete={() => setKeyword('')}
                deleteIcon={<CloseRounded />}
                sx={{
                  mt: 1.5,
                  maxWidth: '100%',
                  height: 32,
                  borderRadius: '8px',
                  backgroundColor: CHIP_BG,
                  '&:hover, &:focus-within': { backgroundColor: CHIP_BG_HOVER },
                  '& .MuiChip-label': {
                    fontFamily: HEADING_FONT,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'grey.800',
                    pl: 1.5,
                    pr: 0.5,
                  },
                  // MUI's default delete icon is a heavy 22px glyph with negative margins. The
                  // design uses a light 18px cross, inset 8px from the trailing edge.
                  '& .MuiChip-deleteIcon': {
                    m: 0,
                    mr: 1,
                    fontSize: 18,
                    color: 'grey.700',
                    '&:hover': { color: 'grey.900' },
                  },
                }}
              />
            )}

            {/* Filter groups: always open on desktop; collapsed behind the toggle on mobile. */}
            <Collapse in={mobileFiltersOpen} sx={{ display: { md: 'none' } }}>
              <FilterGroups
                formatOptions={formatOptions}
                formats={formats}
                setFormats={setFormats}
                lengths={lengths}
                setLengths={setLengths}
                disabled={sessionFiltersDisabled}
              />
            </Collapse>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <FilterGroups
                formatOptions={formatOptions}
                formats={formats}
                setFormats={setFormats}
                lengths={lengths}
                setLengths={setLengths}
                disabled={sessionFiltersDisabled}
              />
            </Box>
          </Box>

          {/* Results */}
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              pt: BROWSE_PY,
              pb: { xs: 6, md: 6 },
              pl: { md: SIDEBAR_GUTTER },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: HEADING_FONT,
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  letterSpacing: '0.15px',
                }}
              >
                {t('resultsHeading')}
              </Typography>
              <Typography
                variant="body2"
                qa-id="library-results-count"
                sx={{ color: 'grey.700', flexShrink: 0 }}
              >
                {t('resultsCount', { count: results.length })}
              </Typography>
            </Box>

            {/* Kind: the primary cut through the library, under the results heading. */}
            <ToggleButtonGroup
              exclusive
              value={kind}
              onChange={(_, next: KindFilter | null) => next && selectKind(next)}
              aria-label={t('kindLabel')}
              sx={{
                mt: 2,
                mb: 3,
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  m: 0,
                  border: '1px solid',
                  borderColor: 'secondary.main',
                  borderRadius: '100px !important',
                  px: 2,
                  py: 0.75,
                  fontFamily: HEADING_FONT,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  textTransform: 'none',
                  color: 'grey.800',
                  backgroundColor: 'common.white',
                  '&:hover': { backgroundColor: 'secondary.light' },
                  // Selected peach is a step deeper than the hover wash; label stays dark for
                  // contrast.
                  '&.Mui-selected': {
                    color: 'grey.900',
                    borderColor: 'secondary.dark',
                    backgroundColor: 'secondary.main',
                    '&:hover': { backgroundColor: 'secondary.main' },
                  },
                },
              }}
            >
              {KIND_KEYS.map((option) => (
                <ToggleButton
                  key={option}
                  value={option}
                  qa-id={`library-kind-${option}`}
                  disableRipple
                >
                  {t(`kind.${option}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Selected theme(s): a descriptive card giving context for the guided choice. */}
            {selectedThemes.map((theme) => (
              <Box
                key={theme}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: CARD_BORDER,
                  p: { xs: 2, md: 2.5 },
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: HEADING_FONT,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    letterSpacing: '0.15px',
                    mb: 1,
                  }}
                >
                  {t(`themes.${theme}.label`)}
                </Typography>
                <Typography sx={{ color: 'grey.800' }}>
                  {t(`themes.${theme}.description`)}
                </Typography>
              </Box>
            ))}

            {results.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: { xs: 7, md: 10 },
                  px: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: HEADING_FONT,
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    letterSpacing: '0.15px',
                    mb: 1,
                  }}
                >
                  {t('noResults.title')}
                </Typography>
                <Typography sx={{ color: 'grey.700', maxWidth: 420 }}>
                  {t('noResults.body')}
                </Typography>
                <Button onClick={clearAll} variant="outlined" color="secondary" sx={{ mt: 2 }}>
                  {t('noResults.action')}
                </Button>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 3,
                  }}
                >
                  {visibleResults.map((item, index) => (
                    <LibraryCard
                      key={item.id}
                      item={item}
                      onSelect={() => logItemClick(item, index)}
                    />
                  ))}
                </Box>
                {hasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button onClick={loadMore} variant="outlined" color="primary">
                      {t('loadMore')}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      {/* ---- Get support ---- */}
      <Container sx={{ background: BAND_GRADIENT, pt: { xs: 7, md: 13 }, pb: { xs: 7, md: 13 } }}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, fontWeight: 500, mb: 1 }}
        >
          {t('support.title')}
        </Typography>
        <Typography sx={{ color: 'grey.800' }}>{t('support.introduction')}</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mt: 2,
          }}
        >
          <SupportCard
            iconSrc={chatIcon}
            title={t('support.messaging.title')}
            description={t('support.messaging.description')}
            href="/messaging"
            onSelect={() =>
              logEvent(LIBRARY_SUPPORT_CARD_CLICKED, {
                library_support_card: 'messaging',
                ...eventUserData,
              })
            }
          />
          <SupportCard
            iconSrc={notesFromBloomIcon}
            title={t('support.notes.title')}
            description={t('support.notes.description')}
            href="/subscription/whatsapp"
            onSelect={() =>
              logEvent(LIBRARY_SUPPORT_CARD_CLICKED, {
                library_support_card: 'notes',
                ...eventUserData,
              })
            }
          />
        </Box>
      </Container>

      {/* Sign up (the header CTA scrolls here), and — once signed in — turn on email reminders. */}
      {!isLoggedIn && <SignUpBanner />}
      {showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
    </Box>
  );
}
