'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import { BackLink } from '@/components/common/BackLink';
import { Link as i18nLink } from '@/i18n/routing';
import { type CourseSession } from '@/lib/utils/courseSessions';
import CheckRounded from '@mui/icons-material/CheckRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { Box, Divider, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const listStyle = { display: 'flex', flexDirection: 'column', gap: 1.5, p: 0, m: 0 } as const;

const itemLinkStyle = (isCurrent: boolean) =>
  ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 2,
    p: 1,
    borderRadius: '10px',
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: isCurrent ? 'supportArrowPanel' : 'transparent',
    '&:hover': { backgroundColor: isCurrent ? 'supportArrowPanel' : 'primary.light' },
  }) as const;

const discStyle = (isCurrent: boolean, isCompleted: boolean) =>
  ({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: isCurrent || isCompleted ? 'primary.dark' : 'grey.300',
    color: isCurrent || isCompleted ? 'common.white' : 'common.black',
    fontFamily: 'headingFontFamily',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
  }) as const;

const titleStyle = (isCurrent: boolean) =>
  ({
    flex: 1,
    minWidth: 0,
    fontWeight: isCurrent ? 600 : 400,
    color: 'common.black',
  }) as const;

// Height is left to the content: a fixed 20px box clips descenders and Arabic diacritics.
const currentBadgeStyle = {
  flexShrink: 0,
  px: 1,
  py: 0.25,
  borderRadius: '8px',
  backgroundColor: 'primary.dark',
  color: 'common.white',
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
} as const;

interface SessionPlaylistProps {
  courseName: string;
  courseHref: string;
  sessions: CourseSession[];
  currentSessionUuid: string;
  progressByUuid: Record<string, CardProgress>;
  accountNeeded: boolean;
  backHref: string;
  backLabel: string;
  onSessionSelect: (session: CourseSession) => void;
}

export function SessionPlaylist({
  courseName,
  courseHref,
  sessions,
  currentSessionUuid,
  progressByUuid,
  accountNeeded,
  backHref,
  backLabel,
  onSessionSelect,
}: SessionPlaylistProps) {
  const t = useTranslations('Courses');

  return (
    <Box qa-id="session-playlist">
      <BackLink href={backHref} label={backLabel} />
      <Divider sx={{ my: 2, borderColor: 'cardBorder' }} />

      <Typography variant="body2" sx={{ color: 'grey.700' }}>
        {t('sessionDetail.currentCourse')}
      </Typography>
      <Link
        component={i18nLink}
        href={courseHref}
        sx={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Typography variant="h3" component="h2" sx={{ mb: 0, fontWeight: 600 }}>
          {courseName}
        </Typography>
      </Link>
      <Divider sx={{ my: 2, borderColor: 'cardBorder' }} />

      <Box component="ol" sx={{ ...listStyle, listStyle: 'none' }}>
        {sessions.map((session) => {
          const isCurrent = session.uuid === currentSessionUuid;
          const isCompleted = progressByUuid[session.uuid] === 'completed';

          return (
            <Box component="li" key={session.uuid}>
              <Link
                component={i18nLink}
                href={session.href}
                aria-current={isCurrent ? 'true' : undefined}
                aria-label={`${t('navigateToSession')} ${session.name}`}
                onClick={() => onSessionSelect(session)}
                sx={itemLinkStyle(isCurrent)}
              >
                <Box aria-hidden sx={discStyle(isCurrent, isCompleted)}>
                  {isCompleted && !isCurrent ? (
                    <CheckRounded sx={{ fontSize: 16 }} />
                  ) : (
                    session.position
                  )}
                </Box>
                <Typography sx={titleStyle(isCurrent)}>{session.name}</Typography>
                {isCurrent && (
                  <Typography component="span" sx={currentBadgeStyle}>
                    {t('sessionDetail.current')}
                  </Typography>
                )}
                {!isCurrent && accountNeeded && (
                  <LockOutlined sx={{ flexShrink: 0, fontSize: 16, color: 'grey.700', mt: 0.5 }} />
                )}
              </Link>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
