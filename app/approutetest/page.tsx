'use client';

import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('Shared');
  const message = t('navigateBack');

  return <div>{message}</div>;
}
