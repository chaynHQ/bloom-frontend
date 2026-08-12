'use client';

import { EmailRemindersSettingsBanner } from '@/components/banner/EmailRemindersSettingsBanner';
import ScrollToSignUpButton from '@/components/common/ScrollToSignUpButton';
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
import { useTypedSelector } from '@/lib/hooks/store';
import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import {
  filterLibraryItems,
  FORMAT_KEYS,
  KIND_KEYS,
  PROGRESS_STATUS_BY_ITEM_PROGRESS,
  THEME_KEYS,
  type Format,
  type KindFilter,
  type LengthBucket,
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
  },
} as const;

const FILTERS_ID = 'library-filters';

const filtersStyle = (open: boolean) =>
  ({ display: { xs: open ? 'block' : 'none', md: 'block' } }) as const;

const mobileFilterButtonStyle = {
  display: { xs: 'inline-flex', md: 'none' },
  flexShrink: 0,
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

  // Deep links seed the initial filter state; an unknown theme or type key is ignored.
  const searchParams = useSearchParams();
  const themeParam = searchParams.get('theme');
  const initialTheme = THEME_KEYS.find((theme) => theme === themeParam);
  const typeParam = searchParams.get('type');

  const [keyword, setKeyword] = useState('');
  const [themes, setThemes] = useState<ThemeKey[]>(initialTheme ? [initialTheme] : []);
  const [kind, setKind] = useState<KindFilter>(
    KIND_KEYS.find((option) => option === typeParam) ?? 'all',
  );
  const [formats, setFormats] = useState<Format[]>([]);
  const [lengths, setLengths] = useState<LengthBucket[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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

  // A signed-in user briefly looks anonymous: partnerAccesses/createdAt arrive with getUser.
  const userSettled = !authStateLoading && (!userToken || Boolean(userId));

  const eventUserData = useMemo(
    () => getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    [userCreatedAt, partnerAccesses, partnerAdmin],
  );

  const sessionFiltersDisabled = kind === 'course';

  const selectKind = (next: KindFilter) => {
    setKind(next);
    if (next === 'course') {
      setFormats([]);
      setLengths([]);
    }
  };

  const formatOptions = useMemo(
    () => FORMAT_KEYS.filter((format) => items.some((item) => item.format === format)),
    [items],
  );

  const results = useMemo(
    () => filterLibraryItems(items, { keyword, kind, themes, formats, lengths }),
    [items, keyword, themes, kind, formats, lengths],
  );

  const resultsCount = results.length;

  // The whole filter state as one string: what filter events report, and the pagination reset key.
  const filterState = `${kind}|${themes.join(',')}|${formats.join(',')}|${lengths.join(',')}`;
  const filterKey = `${keyword}|${filterState}`;

  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  const viewLogged = useRef(false);
  useEffect(() => {
    if (!userSettled || viewLogged.current) return;
    viewLogged.current = true;
    logEvent(LIBRARY_VIEWED, {
      library_kind: kind,
      library_themes: reportList(themes),
      library_results_count: resultsCount,
      ...eventUserData,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettled, eventUserData]);

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

  const selectedThemes = THEME_KEYS.filter((theme) => themes.includes(theme));
  const filtersActive = Boolean(keyword) || formats.length > 0 || lengths.length > 0;

  const clearFilters = () => {
    setKeyword('');
    setFormats([]);
    setLengths([]);
    logEvent(LIBRARY_FILTERS_CLEARED, {
      library_formats: reportList(formats),
      library_lengths: reportList(lengths),
      library_had_search_term: Boolean(keyword),
      library_results_count: resultsCount,
      ...eventUserData,
    });
  };
  const clearAll = () => {
    clearFilters();
    setThemes([]);
    setKind('all');
  };

  return (
    <Box>
      <Header
        title={t('title')}
        imageSrc={illustrationCourses}
        imageAlt="alt.personSitting"
        introduction={t('introduction')}
        cta={!isLoggedIn ? <ScrollToSignUpButton /> : undefined}
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

      <SupportSection eventUserData={eventUserData} eventName={LIBRARY_SUPPORT_CARD_CLICKED} />

      {!isLoggedIn && <SignUpSection source="library" />}
      {showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
    </Box>
  );
}
