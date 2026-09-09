'use client';

import { EmailRemindersSettingsBanner } from '@/components/banner/EmailRemindersSettingsBanner';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import SignUpButton from '@/components/common/SignUpButton';
import { SignUpSection } from '@/components/common/SignUpSection';
import { EMAIL_REMINDERS_FREQUENCY } from '@/lib/constants/enums';
import {
  LIBRARY_FILTERED,
  LIBRARY_FILTERS_CLEARED,
  LIBRARY_ITEM_CLICKED,
  LIBRARY_LOAD_MORE_CLICKED,
  LIBRARY_SEARCHED,
  LIBRARY_SUPPORT_CARD_CLICKED,
  LIBRARY_VIEWED,
} from '@/lib/constants/events';
import { useLogEventOnce } from '@/lib/hooks/useLogEventOnce';
import { useTypedSelector } from '@/lib/hooks/store';
import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import { rememberLibraryPath } from '@/lib/hooks/useLibraryReturnHref';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import {
  filterLibraryItems,
  FORMAT_KEYS,
  KIND_KEYS,
  libraryFiltersToQuery,
  parseLibraryFilters,
  PROGRESS_STATUS_BY_ITEM_PROGRESS,
  THEME_KEYS,
  type Format,
  type KindFilter,
  type LengthBucket,
  type LibraryFilters,
  type LibraryItem,
  type LibraryStories,
  type ThemeKey,
} from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import illustrationCourses from '@/public/illustration_courses.svg';
import CloseRounded from '@mui/icons-material/CloseRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';
import {
  Box,
  Button,
  Chip,
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
import { SupportSection } from '../common/SupportSection';
import Header from '../layout/Header';
import { FilterGroups } from '../library/FilterGroups';
import { LibraryCard } from '../library/LibraryCard';
import { SectionLabel } from '../library/SectionLabel';
import { ThemeCards } from '../library/ThemeCards';

const PAGE_SIZE = 8;

const SEARCH_EVENT_DEBOUNCE_MS = 1000;

const KEYWORD_URL_SYNC_MS = 300;

const SIDEBAR_CONTENT = 264;
const SIDEBAR_GUTTER = 3; // theme spacing units
const SIDEBAR_GUTTER_PX = SIDEBAR_GUTTER * 8;

const BROWSE_PY = { xs: 4, md: 6 };

const browseContainerStyle = { backgroundColor: 'pageBackground', py: '0 !important' } as const;

const browseRowStyle = { display: 'flex', flexDirection: { xs: 'column', md: 'row' } } as const;

const sidebarStyle = {
  width: { xs: '100%', md: SIDEBAR_CONTENT + SIDEBAR_GUTTER_PX },
  flexShrink: 0,
  pt: BROWSE_PY,
  pb: { xs: 0, md: 6 },
  pr: { md: SIDEBAR_GUTTER },
  borderInlineEnd: { md: '1px solid' },
  borderColor: { md: 'cardBorder' },
} as const;

const searchRowStyle = { display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 } as const;

const searchFieldStyle = {
  m: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: '100px',
    backgroundColor: 'common.white',
    '& fieldset': { borderColor: 'inputBorder' },
    '&:hover:not(.Mui-focused) fieldset': { borderColor: 'primary.dark' },
    '&.Mui-focused fieldset': { borderColor: 'secondary.main', borderWidth: 2 },
  },
} as const;

const FILTERS_ID = 'library-filters';

const filtersStyle = (open: boolean) =>
  ({ display: { xs: open ? 'block' : 'none', md: 'block' } }) as const;

const mobileFilterButtonStyle = {
  display: { xs: 'inline-flex', md: 'none' },
  flexShrink: 0,
  height: 40,
  minHeight: 0,
  paddingInline: 1.75,
  borderRadius: '100px',
  backgroundColor: 'common.white',
} as const;

const searchChipStyle = {
  mt: 1.5,
  maxWidth: '100%',
  height: 32,
  borderRadius: '8px',
  backgroundColor: 'chipBackground',
  '&:hover, &:focus-within': { backgroundColor: 'chipBackgroundHover' },
  '& .MuiChip-label': {
    fontFamily: 'headingFontFamily',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'grey.800',
    pl: 1.5,
    pr: 0.5,
  },
  // MUI's default delete icon is a 22px glyph with negative margins.
  '& .MuiChip-deleteIcon': {
    m: 0,
    mr: 1,
    fontSize: 18,
    color: 'grey.700',
    '&:hover': { color: 'grey.900' },
  },
} as const;

const resultsColumnStyle = {
  flexGrow: 1,
  minWidth: 0,
  pt: BROWSE_PY,
  pb: 6,
  pl: { md: SIDEBAR_GUTTER },
} as const;

const resultsHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
} as const;

const kindToggleStyle = {
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
    fontFamily: 'headingFontFamily',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
    textTransform: 'none',
    color: 'grey.800',
    backgroundColor: 'common.white',
    '&:hover': { backgroundColor: 'secondary.light' },
    '&.Mui-selected': {
      color: 'grey.900',
      borderColor: 'secondary.dark',
      backgroundColor: 'secondary.main',
      '&:hover': { backgroundColor: 'secondary.main' },
    },
  },
} as const;

const themeDetailStyle = {
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'cardBorder',
  p: { xs: 2, md: 2.5 },
  mb: 2,
} as const;

const themeDetailTitleStyle = { fontWeight: 500, mb: 1 } as const;

const noResultsStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  py: { xs: 7, md: 10 },
  px: 2,
} as const;

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap: 3,
} as const;

const reportList = (values: string[]) => (values.length ? values.join(',') : 'none');

export default function LibraryPage({ stories }: { stories: LibraryStories }) {
  const t = useTranslations('Library');
  const items = useLibraryItems(stories);

  // Filters live in the URL query string, so back navigation and reloads restore them while a
  // fresh visit to /library starts clean. The search box keeps local state for responsiveness
  // and is pushed to the URL on a debounce.
  const searchParams = useSearchParams();

  const {
    kind,
    themes,
    formats,
    lengths,
    keyword: urlKeyword,
  } = useMemo(
    () => parseLibraryFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [keyword, setKeyword] = useState(urlKeyword);
  const [prevUrlKeyword, setPrevUrlKeyword] = useState(urlKeyword);
  if (urlKeyword !== prevUrlKeyword) {
    setPrevUrlKeyword(urlKeyword);
    setKeyword(urlKeyword);
  }

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentFilters = useMemo<LibraryFilters>(
    () => ({ keyword, kind, themes, formats, lengths }),
    [keyword, kind, themes, formats, lengths],
  );

  // history.replaceState rather than router.replace: filter clicks and the debounced search sync
  // then can't race each other, and neither cancels an in-flight navigation to a clicked result.
  // `null` state, not the current one — Next skips its useSearchParams sync for its own `__NA` state.
  const replaceUrl = useCallback((query: string) => {
    const path = window.location.pathname;
    window.history.replaceState(null, '', query ? `${path}?${query}` : path);
  }, []);

  const writeFilters = useCallback(
    (next: LibraryFilters) => replaceUrl(libraryFiltersToQuery(next)),
    [replaceUrl],
  );

  // Merges `q` against the live URL so a delayed write can't drop a filter set since.
  const syncKeywordToUrl = useCallback(
    (value: string) => {
      const params = new URLSearchParams(window.location.search);
      const trimmed = value.trim();
      if (trimmed) params.set('q', trimmed);
      else params.delete('q');
      replaceUrl(params.toString());
    },
    [replaceUrl],
  );

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userEmailRemindersFrequency = useTypedSelector(
    (state) => state.user.emailRemindersFrequency,
  );
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const userAuthStatus = useUserAuthStatus();
  const isLoggedIn = userAuthStatus === 'signedIn';
  const showEmailRemindersBanner =
    isLoggedIn && userEmailRemindersFrequency === EMAIL_REMINDERS_FREQUENCY.NEVER;

  // Signed-in users briefly look anonymous while getUser is in flight; wait for that so the
  // LIBRARY_VIEWED event carries accurate partner/account attribution.
  const userSettled = userAuthStatus !== 'resolving';

  const eventUserData = useMemo(
    () => getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    [userCreatedAt, partnerAccesses, partnerAdmin],
  );

  const sessionFiltersDisabled = kind === 'course';

  // One analytics event per filter interaction — which group, which value, added or removed — so
  // "what do people filter for" is a single group-by on library_filter_value. results_count comes
  // from the incoming filters, since the URL (and the state derived from it) hasn't updated yet.
  const logFilterChange = (
    group: 'theme' | 'format' | 'length' | 'kind',
    value: string,
    action: 'add' | 'remove',
    next: LibraryFilters,
  ) =>
    logEvent(LIBRARY_FILTERED, {
      library_filter_group: group,
      library_filter_value: value,
      library_filter_action: action,
      library_results_count: filterLibraryItems(items, next).length,
      ...eventUserData,
    });

  const setListFilter = (
    group: 'theme' | 'format' | 'length',
    prev: readonly string[],
    next: readonly string[],
    nextFilters: LibraryFilters,
  ) => {
    next
      .filter((value) => !prev.includes(value))
      .forEach((value) => logFilterChange(group, value, 'add', nextFilters));
    prev
      .filter((value) => !next.includes(value))
      .forEach((value) => logFilterChange(group, value, 'remove', nextFilters));
    writeFilters(nextFilters);
  };

  const setThemes = (next: ThemeKey[]) =>
    setListFilter('theme', themes, next, { ...currentFilters, themes: next });
  const setFormats = (next: Format[]) =>
    setListFilter('format', formats, next, { ...currentFilters, formats: next });
  const setLengths = (next: LengthBucket[]) =>
    setListFilter('length', lengths, next, { ...currentFilters, lengths: next });

  const selectKind = (next: KindFilter) => {
    // Courses have no format or length, so switching to them drops those filters.
    const nextFilters =
      next === 'course'
        ? { ...currentFilters, kind: next, formats: [], lengths: [] }
        : { ...currentFilters, kind: next };
    // On a remove, report the kind being cleared rather than the literal "all".
    logFilterChange(
      'kind',
      next === 'all' ? kind : next,
      next === 'all' ? 'remove' : 'add',
      nextFilters,
    );
    writeFilters(nextFilters);
  };

  const formatOptions = useMemo(
    () => FORMAT_KEYS.filter((format) => items.some((item) => item.format === format)),
    [items],
  );

  const results = useMemo(() => filterLibraryItems(items, currentFilters), [items, currentFilters]);

  const resultsCount = results.length;

  // The whole filter state as one string — the key that resets pagination when any filter changes.
  const filterState = `${kind}|${themes.join(',')}|${formats.join(',')}|${lengths.join(',')}`;
  const filterKey = `${keyword}|${filterState}`;

  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // Push a settled search term into the URL; the other filters write there on click.
  const keywordSyncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (keyword === urlKeyword) return;
    keywordSyncTimer.current = setTimeout(() => syncKeywordToUrl(keyword), KEYWORD_URL_SYNC_MS);
    return () => clearTimeout(keywordSyncTimer.current);
  }, [keyword, urlKeyword, syncKeywordToUrl]);

  // Flush the pending search term before navigating away so browser-back restores it.
  const flushKeywordToUrl = () => {
    clearTimeout(keywordSyncTimer.current);
    if (keyword !== urlKeyword) syncKeywordToUrl(keyword);
  };

  // Remember where the visitor was browsing so a content page's "back to library" link returns here.
  useEffect(() => {
    const query = libraryFiltersToQuery(currentFilters);
    rememberLibraryPath(query ? `/library?${query}` : '/library');
  }, [currentFilters]);

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  useLogEventOnce(
    LIBRARY_VIEWED,
    {
      library_kind: kind,
      library_themes: reportList(themes),
      library_formats: reportList(formats),
      library_lengths: reportList(lengths),
      library_search_active: Boolean(urlKeyword),
      library_logged_in: isLoggedIn,
      library_results_count: resultsCount,
      ...eventUserData,
    },
    userSettled,
  );

  // The search term is never sent to analytics — only its length and the result count.
  const loggedSearch = useRef('');
  useEffect(() => {
    const term = keyword.trim();
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

  const logItemClick = useCallback(
    (item: LibraryItem, index: number) => {
      logEvent(LIBRARY_ITEM_CLICKED, {
        library_item_name: item.title,
        library_item_storyblok_uuid: item.id,
        library_item_kind: item.kind,
        library_item_format: item.format ?? null,
        library_item_themes: reportList(item.themes),
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

  const selectedThemes = THEME_KEYS.filter((theme) => themes.includes(theme));
  const filtersActive = Boolean(keyword) || formats.length > 0 || lengths.length > 0;

  const logFiltersCleared = () =>
    logEvent(LIBRARY_FILTERS_CLEARED, {
      library_formats: reportList(formats),
      library_lengths: reportList(lengths),
      library_had_search_term: Boolean(keyword),
      library_results_count: resultsCount,
      ...eventUserData,
    });

  const clearFilters = () => {
    logFiltersCleared();
    setKeyword('');
    writeFilters({ ...currentFilters, keyword: '', formats: [], lengths: [] });
  };
  const clearAll = () => {
    logFiltersCleared();
    setKeyword('');
    writeFilters({ keyword: '', kind: 'all', themes: [], formats: [], lengths: [] });
  };

  return (
    <Box>
      <Header
        title={t('title')}
        imageSrc={illustrationCourses}
        imageAlt="alt.personSitting"
        introduction={t('introduction')}
        cta={!isLoggedIn ? <SignUpButton source="library" /> : undefined}
      />

      <ThemeCards themes={themes} setThemes={setThemes} />

      <Container sx={browseContainerStyle}>
        <Box sx={browseRowStyle}>
          <Box sx={sidebarStyle}>
            <SectionLabel
              label={t('filterHeading')}
              onReset={filtersActive ? clearFilters : undefined}
            />
            <Box sx={searchRowStyle}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('searchPlaceholder')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                sx={searchFieldStyle}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded fontSize="small" sx={{ color: 'grey.600' }} />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { 'qa-id': 'library-search-input', 'aria-label': t('searchLabel') },
                }}
              />
              <Button
                onClick={() => setMobileFiltersOpen((o) => !o)}
                variant="outlined"
                color="secondary"
                aria-expanded={mobileFiltersOpen}
                aria-controls={FILTERS_ID}
                startIcon={<TuneRounded />}
                sx={mobileFilterButtonStyle}
              >
                {t('filterButtonLabel')}
              </Button>
            </Box>
            {keyword && (
              <Chip
                label={keyword}
                onDelete={() => setKeyword('')}
                deleteIcon={<CloseRounded />}
                sx={searchChipStyle}
              />
            )}

            <Box id={FILTERS_ID} sx={filtersStyle(mobileFiltersOpen)}>
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

          <Box sx={resultsColumnStyle}>
            <Box sx={resultsHeaderStyle}>
              <Typography variant="h4">{t('resultsHeading')}</Typography>
              <Typography
                variant="body2"
                qa-id="library-results-count"
                sx={{ color: 'grey.700', flexShrink: 0 }}
              >
                {t('resultsCount', { count: results.length })}
              </Typography>
            </Box>

            <ToggleButtonGroup
              exclusive
              value={kind}
              onChange={(_, next: KindFilter | null) => next && selectKind(next)}
              aria-label={t('kindLabel')}
              sx={kindToggleStyle}
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

            {selectedThemes.map((theme) => (
              <Box key={theme} sx={themeDetailStyle}>
                <Typography variant="h4" sx={themeDetailTitleStyle}>
                  {t(`themes.${theme}.label`)}
                </Typography>
                <Typography sx={{ color: 'grey.800' }}>
                  {t(`themes.${theme}.description`)}
                </Typography>
              </Box>
            ))}

            {results.length === 0 ? (
              <Box sx={noResultsStyle}>
                <Typography variant="h4" sx={{ mb: 1 }}>
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
                <Box sx={cardGridStyle}>
                  {visibleResults.map((item, index) => (
                    <ScrollReveal fill key={item.id} delay={(index % PAGE_SIZE) * 15}>
                      <LibraryCard
                        item={item}
                        showAccountNeeded={!isLoggedIn}
                        onSelect={() => {
                          flushKeywordToUrl();
                          logItemClick(item, index);
                        }}
                      />
                    </ScrollReveal>
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

      <SupportSection eventUserData={eventUserData} eventName={LIBRARY_SUPPORT_CARD_CLICKED} />

      {!isLoggedIn && <SignUpSection source="library" />}
      {showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
    </Box>
  );
}
