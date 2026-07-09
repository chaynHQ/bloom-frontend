'use client';

import CloseRounded from '@mui/icons-material/CloseRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Checkbox,
  Chip,
  Collapse,
  Container,
  FormControlLabel,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import chatIcon from '@/public/chat_icon.svg';
import illustrationCourses from '@/public/illustration_courses.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import Header from '../layout/Header';
import {
  bucketOf,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  FORMATS,
  HEADING_FONT,
  LENGTHS,
  LibraryCard,
  SupportCard,
  THEMES,
  toggle,
  type ContentType,
  type Format,
  type LengthBucket,
  type LibraryStories,
  type ThemeKey,
} from '../library/libraryContent';
import { useLibraryItems } from '../library/useLibraryItems';

// How many cards to show before the "Load more" button, and how many more each press reveals.
const PAGE_SIZE = 8;

// The top-level "what kind of thing am I looking for" axis, surfaced as buttons above the
// results rather than as a checkbox in the sidebar: a course and a single session are different
// shapes of content, not two ticks in one list. Format and length only describe single sessions,
// so they stay in the sidebar and switch off while "Courses" is selected.
type KindFilter = 'all' | 'course' | 'session';

const KIND_OPTIONS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'course', label: 'Courses' },
  { key: 'session', label: 'Single sessions' },
];

// Warm cream page background for the browse area, from the Figma design.
const PAGE_BG = '#FFF2EB';
// The active search-term chip: a deeper peach than the page behind it so it reads as a thing you
// can dismiss rather than part of the background. Sampled from the design's "Input chip".
const CHIP_BG = '#FFD8C7';
const CHIP_BG_HOVER = '#FFC9B2';

// The design's sidebar column is 264px of content, then a 24px gutter, the divider, and another
// 24px before the results. Box-sizing is border-box, so the column must be 264 + 24 wide for its
// rows to measure 264 and for the divider to land where the design puts it.
const SIDEBAR_CONTENT = 264;
const SIDEBAR_GUTTER = 3; // theme spacing units → 24px
const SIDEBAR_WIDTH = SIDEBAR_CONTENT + 24;

// Vertical padding for the browse section. It lives on the two columns rather than the Container
// so the divider between them spans the full height of the section, edge to edge.
const BROWSE_PY = { xs: 4, md: 6 };
// Soft peach gradient behind the "Get support" band — colours sampled from Figma (a subtle
// top-to-bottom wash matching the header, not a strong pink).
const BAND_GRADIENT = 'linear-gradient(180deg, #FCE7E1 0%, #FEE9E1 100%)';

export default function LibraryPage({
  stories,
  initialContentTypes = [],
  initialThemes = [],
}: {
  stories: LibraryStories;
  initialContentTypes?: ContentType[];
  initialThemes?: ThemeKey[];
}) {
  const t = useTranslations('Library');
  const items = useLibraryItems(stories);
  const [keyword, setKeyword] = useState('');
  const [themes, setThemes] = useState<ThemeKey[]>(initialThemes);
  // `?type=course` deep-links straight to the Courses tab; any format in the initial types
  // pre-ticks the sidebar instead.
  const [kind, setKind] = useState<KindFilter>(
    initialContentTypes.includes('course') ? 'course' : 'all',
  );
  const [formats, setFormats] = useState<Format[]>(() =>
    initialContentTypes.filter((type): type is Format => type !== 'course'),
  );
  const [lengths, setLengths] = useState<LengthBucket[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // On mobile the filter checkboxes collapse behind a "Filter" button (they're always shown on
  // desktop via CSS breakpoints); this only drives the small-screen open/closed state.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
    () => FORMATS.filter((format) => items.some((item) => item.format === format.key)),
    [items],
  );

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return items.filter((item) => {
      if (kind !== 'all' && item.kind !== kind) return false;
      if (themes.length && !item.themes.some((key) => themes.includes(key))) return false;
      if (kw && !`${item.title} ${item.description}`.toLowerCase().includes(kw)) return false;

      // Format and length are single-session concepts, so either one excludes courses outright.
      if (formats.length) {
        if (item.format == null || !formats.includes(item.format)) return false;
      }
      if (lengths.length) {
        if (item.minutes == null || !lengths.includes(bucketOf(item.minutes))) return false;
      }
      return true;
    });
  }, [items, keyword, themes, kind, formats, lengths]);

  // Reset pagination whenever the filters change so "Load more" always starts from the top.
  // Adjusting state during render (rather than in an effect) is the recommended pattern for
  // deriving state from a changing key — no extra render pass, no cascading effect.
  const filterKey = `${keyword}|${themes.join(',')}|${kind}|${formats.join(',')}|${lengths.join(',')}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  // Selected themes are surfaced as descriptive cards atop the results (never as sidebar
  // filters), giving the chosen theme context and a fuller explanation.
  const selectedThemes = THEMES.filter((theme) => themes.includes(theme.key));
  const filtersActive = Boolean(keyword) || formats.length > 0 || lengths.length > 0;

  const clearFilters = () => {
    setKeyword('');
    setFormats([]);
    setLengths([]);
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
        title="Explore the library"
        imageSrc={illustrationCourses}
        introduction="Everything from Bloom in one place — guided courses to work through step by step, and single sessions you can explore whenever you need them."
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
          label="Explore by theme"
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
          {THEMES.map((theme) => {
            const active = themes.includes(theme.key);
            return (
              <Card
                key={theme.key}
                sx={{
                  m: 0,
                  borderRadius: '8px',
                  backgroundColor: CARD_SURFACE,
                  boxShadow: CARD_SHADOW,
                }}
              >
                <CardActionArea
                  onClick={() => setThemes((p) => toggle(p, theme.key))}
                  aria-pressed={active}
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
                    {theme.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.700' }}>
                    {theme.blurb}
                  </Typography>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Container>

      {/* ---- Filters + results ----
           The section's vertical padding sits on the two columns, not on the Container. Both
           columns are flex children of a stretch row, so the shorter one grows to the full row
           height and the divider on the sidebar's inline edge runs the whole height of the
           section — no gap at the top or bottom. On mobile the row stacks and the divider is
           dropped, so the padding collapses to a single seam between the two. */}
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
              label="Filter the library"
              onReset={filtersActive ? clearFilters : undefined}
            />
            {/* Search + (mobile-only) Filter toggle. On desktop the checkbox groups are always
                visible; on mobile they collapse behind the toggle to keep the top of the list
                reachable, matching the mobile design. */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by keywords…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                sx={{
                  m: 0,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '100px',
                    backgroundColor: 'common.white',
                    '& fieldset': { borderColor: '#DECECF' },
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
                Filter
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
                Library
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.700', flexShrink: 0 }}>
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </Typography>
            </Box>

            {/* Kind: the primary cut through the library, sitting directly under the heading it
                qualifies and above the theme card, so the panel reads "what → why → results". */}
            <ToggleButtonGroup
              exclusive
              value={kind}
              onChange={(_, next: KindFilter | null) => next && selectKind(next)}
              aria-label="Filter by content kind"
              sx={{
                mt: 2,
                mb: 3,
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  m: 0,
                  border: '1px solid',
                  borderColor: CARD_BORDER,
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
                  '&.Mui-selected': {
                    color: 'primary.dark',
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                    '&:hover': { backgroundColor: 'primary.light' },
                  },
                },
              }}
            >
              {KIND_OPTIONS.map((option) => (
                <ToggleButton key={option.key} value={option.key} disableRipple>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Selected theme(s): a descriptive card giving context for the guided choice. */}
            {selectedThemes.map((theme) => (
              <Box
                key={theme.key}
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
                  {theme.label}
                </Typography>
                <Typography sx={{ color: 'grey.800' }}>{theme.description}</Typography>
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
                  {visibleResults.map((item) => (
                    <LibraryCard key={item.id} item={item} />
                  ))}
                </Box>
                {hasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      variant="outlined"
                      color="primary"
                    >
                      Load more
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
          Get support
        </Typography>
        <Typography sx={{ color: 'grey.800' }}>
          Prefer to talk to someone? Bloom&apos;s support services are here whenever you need them.
        </Typography>
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
            title="1-to-1 messaging"
            description="Thoughtful replies to your questions and reflections, from our multilingual team, within 1–2 days."
            href="/messaging"
          />
          <SupportCard
            iconSrc={notesFromBloomIcon}
            title="Notes from Bloom"
            description="Support from Bloom, delivered to your WhatsApp twice a week."
            href="/subscription/whatsapp"
          />
        </Box>
      </Container>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Sidebar / section sub-components (specific to the library page)
// ---------------------------------------------------------------------------

// A section/sidebar label with an optional "Reset" action on the trailing edge — used by both
// "Explore by theme" and "Filter the library" to match the design.
function SectionLabel({ label, onReset }: { label: string; onReset?: () => void }) {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'grey.800' }}>
        {label}
      </Typography>
      {onReset && (
        <Button
          onClick={onReset}
          size="small"
          sx={{
            minWidth: 0,
            p: 0,
            fontFamily: HEADING_FONT,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'primary.dark',
            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
          }}
        >
          Reset
        </Button>
      )}
    </Box>
  );
}

// The "Content type" + "Length" checkbox groups. Extracted so the sidebar can render them once
// for desktop (always visible) and once inside a mobile Collapse without duplicating markup.
//
// The design gives each filter row a 64px height: 8px of row padding around a 48px checkbox
// target (a 24px glyph inset by 12px). The global MuiFormControlLabel override in styles/theme.ts
// zeroes the checkbox's vertical padding, pins it to the top, and paints it text.primary via a
// `& .MuiCheckbox-root` descendant selector. That out-specifies an `sx` on the Checkbox itself,
// so the row styling has to be applied from the FormControlLabel to land at all.
const CHECKBOX_SX = {
  '& .MuiCheckbox-root': {
    p: 1.5,
    m: 0,
    alignSelf: 'center',
    color: 'grey.600',
    '&.Mui-checked': { color: 'primary.dark' },
    '&.Mui-disabled': { color: 'grey.400' },
  },
} as const;

function FilterGroups({
  formatOptions,
  formats,
  setFormats,
  lengths,
  setLengths,
  disabled,
}: {
  formatOptions: { key: Format; label: string }[];
  formats: Format[];
  setFormats: Dispatch<SetStateAction<Format[]>>;
  lengths: LengthBucket[];
  setLengths: Dispatch<SetStateAction<LengthBucket[]>>;
  // True while "Courses" is selected: neither group describes a course, so both are inert.
  disabled: boolean;
}) {
  return (
    <Box sx={{ pt: 4 }}>
      {formatOptions.length > 0 && (
        <FilterGroup title="Content type" disabled={disabled}>
          {formatOptions.map((option) => (
            <CheckRow
              key={option.key}
              label={option.label}
              checked={formats.includes(option.key)}
              onChange={() => setFormats((p) => toggle(p, option.key))}
              disabled={disabled}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Length" disabled={disabled}>
        {LENGTHS.map((l) => (
          <CheckRow
            key={l.key}
            label={l.label}
            checked={lengths.includes(l.key)}
            onChange={() => setLengths((p) => toggle(p, l.key))}
            disabled={disabled}
          />
        ))}
      </FilterGroup>
    </Box>
  );
}

function FilterGroup({
  title,
  disabled,
  children,
}: {
  title: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mb: 4, '&:last-of-type': { mb: 0 } }}>
      {/* No margin here: the first filter row's own top padding supplies the gap. */}
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: disabled ? 'grey.500' : 'grey.800',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// Row styled to match the design: label on the leading edge, checkbox on the trailing edge,
// with a thin divider under each row.
function CheckRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <FormControlLabel
      labelPlacement="start"
      disabled={disabled}
      control={<Checkbox checked={checked} onChange={onChange} disableRipple />}
      label={<Typography sx={{ color: disabled ? 'grey.500' : 'grey.700' }}>{label}</Typography>}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        m: 0,
        py: 1,
        borderBottom: '1px solid',
        borderColor: CARD_BORDER,
        ...CHECKBOX_SX,
      }}
    />
  );
}
