'use client';

import { STORYBLOK_REFERENCE_CATEGORIES } from '@/lib/constants/enums';
import { Article, MenuBook, OndemandVideo } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

const styles = {
  color: 'secondary.dark',
} as const;

interface ReferenceIconProps {
  category: STORYBLOK_REFERENCE_CATEGORIES;
}

export const ReferenceIcon = ({ category }: ReferenceIconProps) => {
  const t = useTranslations('Shared');

  if (category === STORYBLOK_REFERENCE_CATEGORIES.BOOK) {
    return <MenuBook aria-label={t('alt.bookIcon')} aria-hidden="false" sx={styles} />;
  } else if (category === STORYBLOK_REFERENCE_CATEGORIES.VIDEO_PRACTICES) {
    return <OndemandVideo aria-label={t('alt.videoIcon')} aria-hidden="false" sx={styles} />;
  } else {
    return <Article aria-label={t('alt.articleIcon')} aria-hidden="false" sx={styles} />;
  }
};
