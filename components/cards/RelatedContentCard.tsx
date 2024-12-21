import { Button, Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { RELATED_CONTENT_CATEGORIES } from '../../constants/enums';
import Link from '../common/Link';

const cardStyle = {
  mt: 0,
  width: '100%',
  maxWidth: '400px',
  mb: { xs: '1rem', sm: '1.5rem' },
} as const;

const categoryStyle = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.875rem !important',
  fontWeight: 500,
} as const;

interface RelatedContentProps {
  title: string;
  href: string;
  category: RELATED_CONTENT_CATEGORIES;
}

export const RelatedContentCard = (props: RelatedContentProps) => {
  const { title, href, category } = props;

  const t = useTranslations('Shared.relatedContent');

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography sx={categoryStyle}>{t(category)}</Typography>
        <Typography variant="h3">{title}</Typography>
        <Button component={Link} href={href} variant="contained">
          Open
        </Button>
      </CardContent>
    </Card>
  );
};
