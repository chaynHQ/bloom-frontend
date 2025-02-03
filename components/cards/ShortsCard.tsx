import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, Card, CardActionArea, CardContent, IconButton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { RELATED_CONTENT_CATEGORIES } from '../../constants/enums';
import Link from '../common/Link';

const cardStyle = {
  mt: 0,
  width: '250px',
  mb: { xs: '1rem', sm: '1.5rem' },
  backgroundColor: 'paleSecondaryLight',
  flex: 0,
} as const;

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
      <CardActionArea component={Link} href={`/${href}`} sx={{ height: '100%' }}>
        <CardContent
          sx={{
            minHeight: 335,
            padding: '0 !important',
            transition: 'background-color 0.3s ease',
            '&:hover .play-button': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1)',
            },
            '&:hover .image-box': {
              filter: 'brightness(0.8752)',
            },
          }}
        >
          <Box
            className="image-box"
            height="130px"
            position="relative"
            width="100%"
            overflow="hidden"
            bgcolor="palePrimaryLight"
            sx={{
              transition: 'filter 0.3s ease',
            }}
          >
            <Image
              src={image?.filename ?? '/bloom_shorts.png'}
              objectFit="cover"
              fill
              alt={image?.alt ?? 'Bloom shorts default image'}
            />
            <Box
              className="play-button"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(0.8)',
                opacity: 0,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                zIndex: 2,
              }}
            >
              <IconButton
                sx={{
                  color: 'white',
                  backgroundColor: 'rgb(255, 250, 250)',
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
