import { useTranslations } from 'next-intl';
import Head from 'next/head';
import theme from '../../styles/theme';

const DefaultHeadMetadata = () => {
  const t = useTranslations('Shared.metadata');

  return (
    <Head>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <meta property="og:title" content={t('title')} key="og-title" />
      <meta property="og:description" content={t('description')} key="og-description" />
      <meta property="og:image" content="/preview.png" key="og-image" />
      <meta property="og:image:alt" content={t('imageAlt')} key="og-image-alt" />
      <meta name="twitter:card" content="summary_large_image" key="twitter-card" />
      <meta name="twitter:site" content="@ChaynHQ" />
      <meta name="twitter:creator" content="@ChaynHQ" />
      {/** PWA specific tags **/}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/apple/icon-120x120.png"></link>
      <meta name="theme-color" content={theme.palette.primary.main} />
    </Head>
  );
};

export default DefaultHeadMetadata;
