'use client';

import chatIcon from '@/public/chat_icon.svg';
import courseIcon from '@/public/course_icon.svg';
import groundingIcon from '@/public/grounding_icon.svg';
import notesIcon from '@/public/notes_from_bloom_icon.svg';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// ---------------------------------------------------------------------------
// Prototype of the OPTIMISED secondary nav.
//
// Current nav: Courses · 1-to-1 messaging · Activities · Grounding · Bloom notes
// Optimised:   Library · Grounding · 1-to-1 messaging · Bloom notes
//
// What changed and why:
//  - "Courses" + the new "Sessions" concept merge into one "Library" (learning place).
//  - "Activities" is REMOVED as a destination — activities are now a format filter
//    inside the library, so they don't need a separate tab.
//  - "Grounding" keeps its own tab and its name: it's the accurate trauma-care term,
//    already used across the codebase (route, icon, events), and recognised by survivors.
//
// This is presentational only — to ship it, update lib/navigation/navigationConfig.ts.
// ---------------------------------------------------------------------------

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
}

const ITEMS: NavItem[] = [
  { key: 'library', label: 'Library', href: '/library', icon: courseIcon },
  { key: 'grounding', label: 'Grounding', href: '/grounding', icon: groundingIcon },
  { key: 'messaging', label: '1-to-1 messaging', href: '/messaging', icon: chatIcon },
  { key: 'notes', label: 'Bloom notes', href: '/subscription/whatsapp', icon: notesIcon },
];

// The prototype routes that should show this nav instead of the standard secondary nav.
// usePathname includes the locale prefix for non-default locales, so we match by suffix.
const PROTOTYPE_PATHS = ['/library', '/library-home'];
export function isLibraryPrototypePath(pathname: string): boolean {
  return PROTOTYPE_PATHS.some((p) => pathname === p || pathname.endsWith(p));
}

export default function LibraryNav() {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: 'palePrimaryLight',
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      {ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.endsWith(item.href);
        return (
          <Box
            key={item.key}
            component="a"
            href={item.href}
            sx={{
              // Each item takes an equal share of the bar so the nav spreads evenly
              // across the full width, matching the standard fullWidth secondary nav.
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 2,
              color: 'text.primary',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              borderBottom: '2px solid',
              borderColor: isActive ? 'primary.dark' : 'transparent',
              '&:hover': { borderColor: 'primary.dark' },
            }}
          >
            <Image src={item.icon} alt="" width={26} height={26} style={{ objectFit: 'contain' }} />
            <Typography sx={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}
