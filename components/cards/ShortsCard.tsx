'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { RELATED_CONTENT_CATEGORIES } from '@/lib/constants/enums';
import { Box, Card, CardActionArea, CardContent, IconButton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const cardStyle = {
  mt: 0,
  width: '250px',
  mb: { xs: '1rem', sm: '1.5rem' },
  backgroundColor: 'paleSecondaryLight',
  '&:hover .overlay': {
    opacity: 1,
  },
  '&:hover .play-button': {
    transform: 'scale(1)',
  },
  flex: 0,
} as const;

const overlay = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  opacity: 0,
  transition: 'opacity .3s ease',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

interface ShortsCardProps {
  title: string;
  href: string;
  duration?: string;
  image?: { filename: string; alt: string };
  category: RELATED_CONTENT_CATEGORIES;
}

const categoryStyle = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.875rem !important',
  fontWeight: 600,
  textTransform: 'uppercase',
  mb: '0.5rem !important',
  '& .before-dot:before': {
    content: '"• "',
    marginLeft: 1,
    marginRight: 1,
  },
} as const;

export const ShortsCard = (props: ShortsCardProps) => {
  const { title, href, duration, category, image } = props;

  const t = useTranslations('Shared');

  return (
    <Card sx={cardStyle}>
      <CardActionArea href={href} sx={{ height: '100%' }} component={i18nLink}>
        <CardContent
          sx={{
            minHeight: 335,
            padding: '0 !important',
          }}
        >
          <Box height="130px" position="relative" width="100%" overflow="hidden">
            <Image
              src={image?.filename || '/bloom_shorts.png'}
              objectFit="cover"
              fill
              alt={image?.alt || 'Bloom shorts default image'} // TODO create a message for this image
            />
            <Box
              className="overlay"
              sx={overlay}>
              <IconButton
                className="play-button"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgb(255, 250, 250)',
                  transform: 'scale(0.75)',
                  transition: 'transform .3s ease',
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </IconButton>
            </Box>
          </Box>
          <Box minHeight="100px" p={3}>
            <Typography sx={categoryStyle}>
              {t(`relatedContent.${category}`)}
              {duration && (
                <span className="before-dot">
                  {` ${duration} ${t('relatedContent.minuteLabel')}`}
                </span>
              )}
            </Typography>
            <Box>
              <Typography variant="h3">{title}</Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
