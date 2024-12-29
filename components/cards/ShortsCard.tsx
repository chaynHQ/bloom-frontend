import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { RELATED_CONTENT_CATEGORIES } from '../../constants/enums';
import Link from '../common/Link';

const cardStyle = {
  mt: 0,
  width: '250px',
  height: '100%',
  mb: { xs: '1rem', sm: '1.5rem' },
  backgroundColor: 'paleSecondaryLight',
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
      <CardActionArea component={Link} href={`/${href}`}>
        <CardContent
          sx={{ padding: '0 !important', display: 'flex', flexDirection: 'column', gap: '1' }}
        >
          <Box height="130px" position="relative" width="100%" overflow="hidden">
            <Image
              src={image?.filename || '/bloom_shorts.png'}
              objectFit="cover"
              fill
              alt={image?.alt || 'Bloom shorts default image'} // TODO create a message for this image
            />
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
