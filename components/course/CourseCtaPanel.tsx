'use client';

import { AccessFullCourseCard } from '@/components/course/AccessFullCourseCard';
import { Link as i18nLink } from '@/i18n/routing';
import { Box, Button } from '@mui/material';

// Positioning only — stays pinned beside the course copy as the page scrolls into the session list.
const wrapperStyle = {
  flexShrink: 0,
  alignSelf: { md: 'flex-start' },
  position: { md: 'sticky' },
  top: { md: 'calc(9rem + var(--top-banner-height, 0px))' },
  width: { xs: '100%', md: 360 },
} as const;

// On desktop the illustration stacks above the title in the copy column; offsetting the panel by
// its height drops it down so it sits alongside the title rather than the illustration.
const CTA_ILLUSTRATION_OFFSET = 'calc(135px + 16px)';

const loggedInPanelStyle = {
  p: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'pageBackground',
} as const;

// The button fills the panel; the theme otherwise caps buttons at 25rem.
const ctaButtonStyle = { maxWidth: 'none' } as const;

interface CourseCtaPanelProps {
  // Logged in: a "Begin/Continue course" button. Logged out: the "Access the full course" card.
  loggedIn: boolean;
  // The session to resume; absent when the course has no sessions yet (button just logs the click).
  ctaHref?: string;
  ctaLabel: string;
  onCtaClick: () => void;
  // The course hero image pushes the panel down to line up with the title rather than the image.
  offsetForIllustration: boolean;
}

export function CourseCtaPanel({
  loggedIn,
  ctaHref,
  ctaLabel,
  onCtaClick,
  offsetForIllustration,
}: CourseCtaPanelProps) {
  return (
    <Box
      sx={{
        ...wrapperStyle,
        ...(offsetForIllustration && { mt: { md: CTA_ILLUSTRATION_OFFSET } }),
      }}
    >
      {loggedIn ? (
        <Box sx={loggedInPanelStyle}>
          <Button
            qa-id="course-cta"
            variant="contained"
            color="error"
            fullWidth
            sx={ctaButtonStyle}
            onClick={onCtaClick}
            {...(ctaHref ? { component: i18nLink, href: ctaHref } : {})}
          >
            {ctaLabel}
          </Button>
        </Box>
      ) : (
        <AccessFullCourseCard source="course" />
      )}
    </Box>
  );
}
