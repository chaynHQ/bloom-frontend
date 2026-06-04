'use client';

import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useMemo, useState, type ReactNode } from 'react';

import chatIcon from '@/public/chat_icon.svg';
import illustrationCourses from '@/public/illustration_courses.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import {
  bucketOf,
  FORMAT_META,
  FORMATS,
  ITEMS,
  LENGTHS,
  LibraryCard,
  SupportCard,
  THEME_LABEL,
  THEMES,
  toggle,
  type Format,
  type Kind,
  type LengthBucket,
  type ThemeKey,
} from './library/libraryContent';

// A subtle, integrated explainer shown under the All/Courses/Single sessions toggle —
// framed as session vs course so a first-time user understands the distinction in context.
const KIND_HINT: Record<'all' | Kind, string> = {
  all: 'Courses are guided journeys made of several sessions. Single sessions are short and standalone.',
  course: 'A course is a guided journey — a series of sessions to work through over time.',
  session: 'A single session is short and standalone — explore one whenever you have a moment.',
};

export default function LibraryPage({
  initialKind = 'all',
  initialThemes = [],
}: {
  initialKind?: 'all' | Kind;
  initialThemes?: ThemeKey[];
}) {
  const [keyword, setKeyword] = useState('');
  const [kind, setKind] = useState<'all' | Kind>(initialKind);
  const [themes, setThemes] = useState<ThemeKey[]>(initialThemes);
  const [formats, setFormats] = useState<Format[]>([]);
  const [lengths, setLengths] = useState<LengthBucket[]>([]);

  // Everything matching the filters EXCEPT the course/session toggle — so we can show how
  // many of each type are available and let the toggle counts guide a first-time user.
  const baseFiltered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (themes.length && !themes.includes(item.theme)) return false;
      if (kw && !`${item.title} ${item.description}`.toLowerCase().includes(kw)) return false;
      // Format filter only applies to single sessions; selecting a format hides courses.
      if (formats.length && (item.kind !== 'session' || !formats.includes(item.format!)))
        return false;
      // Length is a per-session concept; selecting a length hides courses.
      if (lengths.length && (item.kind !== 'session' || !lengths.includes(bucketOf(item.minutes!))))
        return false;
      return true;
    });
  }, [keyword, themes, formats, lengths]);

  const results = useMemo(
    () => (kind === 'all' ? baseFiltered : baseFiltered.filter((item) => item.kind === kind)),
    [baseFiltered, kind],
  );

  const counts = {
    all: baseFiltered.length,
    course: baseFiltered.filter((item) => item.kind === 'course').length,
    session: baseFiltered.filter((item) => item.kind === 'session').length,
  };

  const activeChips = [
    ...themes.map((t) => ({ label: THEME_LABEL[t], clear: () => setThemes((p) => toggle(p, t)) })),
    ...formats.map((f) => ({
      label: FORMAT_META[f].label,
      clear: () => setFormats((p) => toggle(p, f)),
    })),
    ...lengths.map((l) => ({
      label: LENGTHS.find((x) => x.key === l)!.label,
      clear: () => setLengths((p) => toggle(p, l)),
    })),
  ];

  const clearAll = () => {
    setKeyword('');
    setKind('all');
    setThemes([]);
    setFormats([]);
    setLengths([]);
  };

  return (
    <Box>
      {/* ---- Hero ---- */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #F3D6D8 36.79%, #FFEAE1 73.59%)',
          px: { xs: 3, md: 'calc((100vw - 1000px) / 2)' },
          pt: { xs: 5, md: 7 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}
        >
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="h1" sx={{ mb: 2 }}>
              Explore the library
            </Typography>
            <Typography sx={{ maxWidth: 480 }}>
              Everything from Bloom in one place — guided courses to work through step by step, and
              single sessions you can explore whenever you need them.
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: { sm: 150, md: 200 },
              height: { sm: 150, md: 200 },
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.45)',
            }}
          >
            <Image
              src={illustrationCourses}
              alt=""
              width={140}
              height={140}
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Box>
      </Box>

      {/* ---- Guided entry: themes ---- */}
      <Container
        sx={{ backgroundColor: 'secondary.light', pt: { xs: 3, md: 4 }, pb: { xs: 4, md: 5 } }}
      >
        <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' }, mb: 1 }}>
          Where would you like to start?
        </Typography>
        <Typography sx={{ mb: 3, color: 'grey.800' }}>
          Pick a theme to guide your search, or browse everything below.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.5,
            my: 3,
          }}
        >
          {THEMES.map((t) => {
            const active = themes.includes(t.key);
            return (
              <Card
                key={t.key}
                sx={{
                  m: 0,
                  borderRadius: '12px',
                  backgroundColor: 'common.white',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.06)',
                }}
              >
                <CardActionArea
                  onClick={() => setThemes((p) => toggle(p, t.key))}
                  sx={{
                    p: 2,
                    py: 1.5,
                    height: '100%',
                    backgroundColor: 'common.white',
                    border: '2px solid',
                    borderColor: active ? 'primary.dark' : 'transparent',
                    borderRadius: '12px',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{t.label}</Typography>
                    {active && <CheckCircleRounded sx={{ fontSize: 18, color: 'primary.dark' }} />}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'grey.700', mt: 0.5 }}>
                    {t.blurb}
                  </Typography>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Container>

      {/* ---- Filters + results ---- */}
      <Container
        sx={{ backgroundColor: 'background.default', pt: { xs: 4, md: 5 }, pb: { xs: 6, md: 8 } }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 5 },
          }}
        >
          {/* Sidebar */}
          <Box sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 600, pb: 1.5 }}>Filter the library</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by keywords…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '100px',
                  backgroundColor: 'common.white',
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FilterGroup title="Theme">
              {THEMES.map((t) => (
                <CheckRow
                  key={t.key}
                  label={t.label}
                  checked={themes.includes(t.key)}
                  onChange={() => setThemes((p) => toggle(p, t.key))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Format">
              {FORMATS.map((f) => (
                <CheckRow
                  key={f.key}
                  label={f.label}
                  checked={formats.includes(f.key)}
                  onChange={() => setFormats((p) => toggle(p, f.key))}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Session length">
              {LENGTHS.map((l) => (
                <CheckRow
                  key={l.key}
                  label={l.label}
                  checked={lengths.includes(l.key)}
                  onChange={() => setLengths((p) => toggle(p, l.key))}
                />
              ))}
            </FilterGroup>
          </Box>

          {/* Results */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 2,
              }}
            >
              <ToggleButtonGroup
                exclusive
                size="small"
                value={kind}
                onChange={(_, v) => v && setKind(v)}
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    px: 2,
                    borderRadius: '100px !important',
                    border: '1px solid',
                    borderColor: 'secondary.dark',
                    mr: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.dark',
                      color: 'common.white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    },
                  },
                }}
              >
                <ToggleButton value="all">All ({counts.all})</ToggleButton>
                <ToggleButton value="course">Courses ({counts.course})</ToggleButton>
                <ToggleButton value="session">Single sessions ({counts.session})</ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="body2" sx={{ color: 'grey.700' }}>
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'grey.700' }}>
                {KIND_HINT[kind]}
              </Typography>
            </Box>

            {activeChips.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                {activeChips.map((c, i) => (
                  <Chip
                    key={i}
                    label={c.label}
                    onDelete={c.clear}
                    deleteIcon={<CloseRounded />}
                    sx={{ backgroundColor: 'secondary.light' }}
                  />
                ))}
                <Button onClick={clearAll} size="small" sx={{ textTransform: 'none' }}>
                  Clear all
                </Button>
              </Stack>
            )}

            {results.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center', color: 'grey.700' }}>
                <Typography sx={{ mb: 1 }}>Nothing matches those filters yet.</Typography>
                <Button onClick={clearAll} variant="outlined" color="secondary">
                  Clear filters
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                {results.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* ---- Get support ---- */}
      <Container
        sx={{ backgroundColor: 'secondary.light', pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 8 } }}
      >
        <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' }, mb: 1 }}>
          Get support
        </Typography>
        <Typography sx={{ mb: 3, color: 'grey.800' }}>
          Prefer to talk to someone? Bloom&apos;s support services are here whenever you need them.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
            mt: 3,
          }}
        >
          <SupportCard
            iconSrc={chatIcon}
            title="1-to-1 messaging"
            description="Thoughtful replies to your questions and reflections, from our multilingual team, within 1–2 days."
          />
          <SupportCard
            iconSrc={notesFromBloomIcon}
            title="Notes from Bloom"
            description="Support from Bloom, delivered to your WhatsApp twice a week."
          />
        </Box>
      </Container>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Sidebar sub-components (specific to the search page)
// ---------------------------------------------------------------------------

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      {children}
    </Box>
  );
}

// Row styled to match the reference: label on the left, checkbox on the right, with a
// thin divider under each row.
function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <FormControlLabel
      labelPlacement="start"
      control={
        <Checkbox checked={checked} onChange={onChange} size="small" sx={{ color: 'grey.500' }} />
      }
      label={
        <Typography variant="body2" sx={{ color: 'grey.700' }}>
          {label}
        </Typography>
      }
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        m: 0,
        py: 1.75,
        borderBottom: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.1)',
      }}
    />
  );
}
