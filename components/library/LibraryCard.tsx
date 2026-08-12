import { Link as i18nLink } from '@/i18n/routing';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { type ContentType, type LibraryItem } from '@/lib/utils/libraryData';
import { cardShadow } from '@/styles/common';
import type { SvgIconComponent } from '@mui/icons-material';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import DonutLargeRounded from '@mui/icons-material/DonutLargeRounded';
import ExtensionRounded from '@mui/icons-material/ExtensionRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PlaylistPlayRounded from '@mui/icons-material/PlaylistPlayRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SmartDisplayRounded from '@mui/icons-material/SmartDisplayRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Box, Card, CardActionArea, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { ReactNode } from 'react';

// `illustrated` heads the card with the course illustration and drops the theme line and type
// badge; `compact` is the text-only card.
export type LibraryCardLayout = 'compact' | 'illustrated';

const CONTENT_TYPE_ICON: Record<ContentType, SvgIconComponent> = {
  course: RouteRounded,
  audio: VolumeUpRounded,
  written: ArticleRounded,
  video: SmartDisplayRounded,
  activity: ExtensionRounded,
};

const cardStyle = {
  m: 0,
  height: '100%',
  position: 'relative',
  borderRadius: '16px',
  boxShadow: cardShadow,
  backgroundColor: 'cardSurface',
  border: '1px solid transparent',
  transition: 'border-color 150ms ease',
  '&:hover, &:focus-within': { borderColor: 'secondary.dark' },
} as const;

const actionAreaStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  backgroundColor: 'cardSurface',
  '&:hover': { backgroundColor: 'common.white' },
} as const;

const cornerBadgeStyle = {
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
  backgroundColor: 'panelSurface',
  borderInlineStart: '1px solid',
  borderBottom: '1px solid',
  borderColor: 'cardBorder',
  borderEndStartRadius: '8px',
} as const;

const cornerBadgeLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'grey.800',
} as const;

const imagePanelStyle = {
  position: 'relative',
  height: { xs: 140, md: 160 },
  flexShrink: 0,
  backgroundColor: 'secondary.light',
} as const;

// Only a badged compact card insets its content to clear the corner badge; under `illustrated`
// the badge sits over the image instead.
const contentStyle = (layout: LibraryCardLayout, hasCornerBadge: boolean) =>
  ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    p: 2,
    pt: layout === 'compact' && hasCornerBadge ? 7 : 2,
  }) as const;

const themeStyle = {
  color: 'grey.800',
  mb: 0.5,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

const descriptionStyle = {
  color: 'grey.800',
  mt: 1.5,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
} as const;

const typeBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  alignSelf: 'flex-start',
  height: 32,
  pl: 1,
  pr: 1.5,
  borderRadius: '8px',
  border: '1px solid',
} as const;

const typeBadgeLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
  color: 'grey.700',
} as const;

const metaRowStyle = { display: 'flex', alignItems: 'center', gap: 2 } as const;

const metaStyle = { display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.800' } as const;

const metaLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
} as const;

const spacerStyle = { flexGrow: 1 } as const;

function Meta({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box sx={metaStyle}>
      {icon}
      <Typography sx={metaLabelStyle}>{text}</Typography>
    </Box>
  );
}

export function LibraryCard({
  item,
  layout = 'compact',
  showAccountNeeded = false,
  onSelect,
}: {
  item: LibraryItem;
  layout?: LibraryCardLayout;
  showAccountNeeded?: boolean;
  onSelect?: () => void;
}) {
  const t = useTranslations('Library');
  const tS = useTranslations('Shared');
  const isCourse = item.kind === 'course';
  const badgeType: ContentType = isCourse ? 'course' : (item.format ?? 'video');
  const BadgeIcon = CONTENT_TYPE_ICON[badgeType];
  const showAccountBadge = showAccountNeeded && !item.progress && item.requiresAccount;
  const isIllustrated = layout === 'illustrated' && Boolean(item.imageSrc);

  return (
    <Card qa-id="library-card" data-kind={item.kind} data-format={item.format ?? ''} sx={cardStyle}>
      <CardActionArea
        component={i18nLink}
        href={item.href}
        aria-label={item.title}
        onClick={onSelect}
        sx={actionAreaStyle}
      >
        {item.progress && (
          <Box qa-id="library-card-progress" data-progress={item.progress} sx={cornerBadgeStyle}>
            {item.progress === 'completed' ? (
              <CheckCircleRounded sx={{ fontSize: 16, color: 'secondary.dark' }} />
            ) : (
              <DonutLargeRounded sx={{ fontSize: 14, color: 'grey.700' }} />
            )}
            <Typography sx={cornerBadgeLabelStyle}>
              {tS(`progressStatus.${item.progress}`)}
            </Typography>
          </Box>
        )}
        {showAccountBadge && (
          <Box qa-id="library-card-account-needed" sx={cornerBadgeStyle}>
            <LockOutlined sx={{ fontSize: 14, color: 'grey.700' }} />
            <Typography sx={cornerBadgeLabelStyle}>{t('accountNeeded')}</Typography>
          </Box>
        )}

        {isIllustrated && (
          <Box sx={imagePanelStyle}>
            <Image
              alt=""
              src={item.imageSrc!}
              fill
              sizes={getImageSizes({ xs: '100vw', md: '340px' })}
              style={{ objectFit: 'contain', padding: '1rem' }}
            />
          </Box>
        )}

        <Box
          sx={contentStyle(
            isIllustrated ? 'illustrated' : 'compact',
            Boolean(item.progress) || showAccountBadge,
          )}
        >
          {!isIllustrated && (
            <Typography variant="body2" sx={themeStyle}>
              {item.themes.map((theme) => t(`themes.${theme}.label`)).join(' · ')}
            </Typography>
          )}
          <Typography variant="h4" sx={{ mb: 1.5 }}>
            {item.title}
          </Typography>
          {!isIllustrated && (
            <Box
              sx={{
                ...typeBadgeStyle,
                backgroundColor: isCourse ? 'secondary.light' : 'badgeBlue',
                borderColor: isCourse ? 'secondary.main' : 'badgeBlueBorder',
              }}
            >
              <BadgeIcon sx={{ fontSize: 16, color: 'grey.700' }} />
              <Typography sx={typeBadgeLabelStyle}>{t(`contentTypes.${badgeType}`)}</Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ ...descriptionStyle, ...(isIllustrated && { mt: 0 }) }}>
            {item.description}
          </Typography>

          <Box sx={spacerStyle} />
          <Divider sx={{ my: 2, borderColor: 'cardBorder' }} />
          <Box sx={metaRowStyle}>
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
            <Box sx={spacerStyle} />
            <ArrowForwardRounded sx={{ fontSize: 18, color: 'secondary.dark' }} />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
