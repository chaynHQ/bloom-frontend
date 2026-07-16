import { Link as i18nLink } from '@/i18n/routing';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import DonutLargeRounded from '@mui/icons-material/DonutLargeRounded';
import PlaylistPlayRounded from '@mui/icons-material/PlaylistPlayRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import { Box, Card, CardActionArea, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { type ContentType, type LibraryItem } from '@/lib/utils/libraryData';
import {
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  HEADING_FONT,
  PANEL_SURFACE,
} from './libraryTokens';
import { Meta } from './Meta';
import { TypeBadge } from './TypeBadge';

export function LibraryCard({ item, onSelect }: { item: LibraryItem; onSelect?: () => void }) {
  const t = useTranslations('Library');
  // Reuse the shared progress vocabulary so the card badge matches how progress reads elsewhere.
  const tS = useTranslations('Shared');
  const isCourse = item.kind === 'course';
  const badgeType: ContentType = isCourse ? 'course' : (item.format ?? 'video');

  return (
    <Card
      data-testid="library-card"
      data-kind={item.kind}
      data-format={item.format ?? ''}
      sx={{
        m: 0,
        height: '100%',
        position: 'relative',
        borderRadius: '16px',
        boxShadow: CARD_SHADOW,
        backgroundColor: CARD_SURFACE,
        // Transparent at rest so the hover/focus peach doesn't resize the card.
        border: '1px solid transparent',
        transition: 'border-color 150ms ease',
        '&:hover, &:focus-within': { borderColor: 'secondary.dark' },
      }}
    >
      <CardActionArea
        component={i18nLink}
        href={item.href}
        aria-label={item.title}
        onClick={onSelect}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          backgroundColor: CARD_SURFACE,
          '&:hover': { backgroundColor: 'common.white' },
        }}
      >
        {/* Progress badge, pinned to the top-inline-end corner. */}
        {item.progress && (
          <Box
            data-testid="library-card-progress"
            data-progress={item.progress}
            sx={{
              position: 'absolute',
              top: 0,
              insetInlineEnd: 0,
              zIndex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              py: 1,
              pl: 1,
              pr: 1.5,
              backgroundColor: PANEL_SURFACE,
              borderInlineStart: '1px solid',
              borderBottom: '1px solid',
              borderColor: CARD_BORDER,
              borderEndStartRadius: '8px',
            }}
          >
            {item.progress === 'completed' ? (
              <CheckCircleRounded sx={{ fontSize: 16, color: 'secondary.dark' }} />
            ) : (
              <DonutLargeRounded sx={{ fontSize: 14, color: 'grey.700' }} />
            )}
            <Typography
              sx={{
                fontFamily: HEADING_FONT,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'grey.800',
              }}
            >
              {tS(`progressStatus.${item.progress}`)}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            p: 2,
            // Fixed top inset (56px) so cards stay aligned whether or not a corner badge is present.
            pt: 7,
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.800', mb: 0.5 }}>
            {item.themes.map((theme) => t(`themes.${theme}.label`)).join(' · ')}
          </Typography>
          <Typography
            sx={{
              fontFamily: HEADING_FONT,
              fontSize: '1.125rem',
              fontWeight: 500,
              lineHeight: 1.33,
              letterSpacing: '0.15px',
              mb: 1.5,
            }}
          >
            {item.title}
          </Typography>
          <TypeBadge type={badgeType} />
          <Typography
            variant="body2"
            sx={{
              color: 'grey.800',
              mt: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          <Divider sx={{ my: 2, borderColor: CARD_BORDER }} />
          {/* A course reports its session count; a standalone session its duration; a course
              lesson (neither in the CMS) names the course it belongs to. */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isCourse ? (
              <Meta
                icon={<PlaylistPlayRounded sx={{ fontSize: 16 }} />}
                text={t('sessionCount', { count: item.sessionCount ?? 0 })}
              />
            ) : item.minutes != null ? (
              <Meta
                icon={<AccessTimeRounded sx={{ fontSize: 16 }} />}
                text={t('duration', { minutes: item.minutes })}
              />
            ) : (
              item.courseTitle && (
                <Meta
                  icon={<RouteRounded sx={{ fontSize: 16 }} />}
                  text={t('partOfCourse', { course: item.courseTitle })}
                />
              )
            )}
            <Box sx={{ flexGrow: 1 }} />
            <ArrowForwardRounded sx={{ fontSize: 18, color: 'secondary.dark' }} />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
