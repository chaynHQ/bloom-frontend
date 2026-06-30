'use client';

import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardActionArea,
  Container,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import type { ReactNode } from 'react';

import chatIcon from '@/public/chat_icon.svg';
import illustrationBloomHead from '@/public/illustration_bloom_head.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import { ITEMS, LibraryCard, SupportCard, type LibraryItem } from './library/libraryContent';

// ---------------------------------------------------------------------------
// Static prototype homepage.
//
// Design decision: courses and single sessions are SPLIT on the homepage (not mixed).
// The homepage's job is to TEACH the difference — a course is a guided journey you commit
// to; a single session is something for right now. Each section's framing copy does that
// teaching. The /library search page is where the two are unified (filters + badges handle
// differentiation there). Same cards/data are shared across both surfaces.
// ---------------------------------------------------------------------------

const courses = ITEMS.filter((i) => i.kind === 'course').slice(0, 3);
const sessions = ITEMS.filter((i) => i.kind === 'session').slice(0, 3);
const continueItems = ITEMS.filter((i) => i.progress === 'started').slice(0, 2);

interface Intent {
  title: string;
  description: string;
  href: string;
}

const INTENTS: Intent[] = [
  {
    title: 'I need help right now',
    description: 'Find immediate help and crisis resources.',
    href: '#',
  },
  {
    title: 'I want to look around',
    description: 'Browse the whole library at your own pace.',
    href: '/library',
  },
  {
    title: 'I want a guided experience',
    description: 'Follow a curated course, step by step.',
    href: '/library?type=course',
  },
];

export default function LibraryHomePage() {
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
              A free, safe space to heal from gender-based violence
            </Typography>
            {/* Spacing lives on the buttons Box (mt), not the paragraph: globals.css resets
                margin-bottom on the last <p>, which would override an mb here. */}
            <Typography sx={{ maxWidth: 480 }}>
              Bloom is a free place to learn, heal, and find support at whatever pace feels right
              for you.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3 }}>
              <Button variant="contained" color="error" href="/library">
                Explore the library
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: { sm: 170, md: 230 },
              height: { sm: 170, md: 230 },
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.45)',
            }}
          >
            <Image
              src={illustrationBloomHead}
              alt=""
              width={150}
              height={150}
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Box>
      </Box>

      {/* ---- Intent router ---- */}
      <Container
        sx={{ backgroundColor: 'background.default', pt: { xs: 5, md: 7 }, pb: { xs: 4, md: 5 } }}
      >
        <SectionHeader title="What brings you here today?" />
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}
        >
          {INTENTS.map((intent) => (
            <IntentCard key={intent.title} intent={intent} />
          ))}
        </Box>
      </Container>

      {/* ---- Continue ---- */}
      {continueItems.length > 0 && (
        <Container
          sx={{ backgroundColor: 'secondary.light', pt: { xs: 5, md: 6 }, pb: { xs: 5, md: 6 } }}
        >
          <SectionHeader title="Pick up where you left off" />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 3,
              maxWidth: 720,
            }}
          >
            {continueItems.map((item) => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </Box>
        </Container>
      )}

      {/* ---- Courses: framed as guided journeys (teaches what a course is) ---- */}
      <ContentSection
        bg="background.default"
        title="Courses"
        description="Guided journeys — a set of sessions that build on each other. Best when you have time to go deeper."
        items={courses}
        ctaLabel="Browse all courses"
        ctaHref="/library?type=course"
      />

      {/* ---- Single sessions: framed as something for right now (teaches the contrast) ---- */}
      <ContentSection
        bg="secondary.light"
        title="Single sessions"
        description="For right now — short, standalone pieces you can explore in a few minutes, in any order."
        items={sessions}
        ctaLabel="Browse all sessions"
        ctaHref="/library?type=session"
      />

      {/* ---- Get support ---- */}
      <Container
        sx={{ backgroundColor: 'background.default', pt: { xs: 5, md: 6 }, pb: { xs: 5, md: 6 } }}
      >
        <SectionHeader
          title="Get support"
          description="Prefer to talk to someone? Bloom's support services are here whenever you need them."
        />
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}
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

      {/* ---- Team ---- */}
      <Container
        sx={{ backgroundColor: 'primary.light', pt: { xs: 5, md: 6 }, pb: { xs: 5, md: 6 } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ maxWidth: 460 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' }, mb: 1.5 }}>
              The team behind Bloom
            </Typography>
            <Typography sx={{ mb: 3, color: 'grey.800' }}>
              Built by a global team of advocates and survivors, united by care for the people who
              come to Bloom.
            </Typography>
            <Button variant="outlined" color="error" sx={{ mt: 3 }}>
              Meet the team
            </Button>
          </Box>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 64, height: 64 } }}>
            <Avatar sx={{ bgcolor: 'secondary.dark' }}>A</Avatar>
            <Avatar sx={{ bgcolor: 'primary.dark' }}>B</Avatar>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>C</Avatar>
            <Avatar sx={{ bgcolor: 'grey.500' }}>D</Avatar>
          </AvatarGroup>
        </Box>
      </Container>

      {/* ---- Testimonials ---- */}
      <Container
        sx={{ backgroundColor: 'background.default', pt: { xs: 5, md: 6 }, pb: { xs: 6, md: 8 } }}
      >
        <SectionHeader title="What Bloom users say" />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            gap: 4,
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Quote text="It has brought so much clarity to my past experiences, putting words and labels to what I didn't know how to explain or process. I just knew the feelings." />
            <Quote text="Bloom has been a great experience for me. The courses made me reflect a lot on what it means to work on yourself — it takes commitment, time, and studying." />
          </Box>
          <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
            <Button variant="contained" color="error" size="large">
              Join Bloom, always free
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ContentSection({
  bg,
  title,
  description,
  items,
  ctaLabel,
  ctaHref,
}: {
  bg: string;
  title: string;
  description: string;
  items: LibraryItem[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <Container sx={{ backgroundColor: bg, pt: { xs: 5, md: 6 }, pb: { xs: 5, md: 6 } }}>
      <SectionHeader title={title} description={description} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {items.map((item) => (
          <LibraryCard key={item.id} item={item} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button variant="contained" color="error" href={ctaHref}>
          {ctaLabel}
        </Button>
      </Box>
    </Container>
  );
}

function IntentCard({ intent }: { intent: Intent }) {
  return (
    <Card
      sx={{
        m: 0,
        borderRadius: '12px',
        backgroundColor: 'common.white',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <CardActionArea
        href={intent.href}
        sx={{
          p: 2.5,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'common.white',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>{intent.title}</Typography>
          <Typography variant="body2" sx={{ color: 'grey.700' }}>
            {intent.description}
          </Typography>
        </Box>
        <ArrowForwardRounded sx={{ color: 'primary.dark' }} />
      </CardActionArea>
    </Card>
  );
}

// Centralises section heading spacing so the gap under titles/paragraphs is consistent:
// the wrapper owns the bottom margin, content that follows has no top margin.
function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' }, mb: description ? 1 : 0 }}
        >
          {title}
        </Typography>
        {description && (
          <Typography sx={{ color: 'grey.800', maxWidth: 560, mb: 0 }}>{description}</Typography>
        )}
      </Box>
      {icon && (
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexShrink: 0,
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  );
}

function Quote({ text }: { text: string }) {
  return (
    <Box sx={{ backgroundColor: 'secondary.light', borderRadius: '12px', p: 3 }}>
      <FormatQuoteRounded sx={{ color: 'primary.dark', transform: 'scaleX(-1)' }} />
      <Typography sx={{ fontStyle: 'italic', color: 'grey.800', mt: 1 }}>{text}</Typography>
    </Box>
  );
}
