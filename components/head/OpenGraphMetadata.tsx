import theme from '../../styles/theme';

const descriptionContent =
  'Join us on your healing journey. Bloom is here for you to learn, heal and grow towards a confident future. It is bought to you by Chayn, a global non-profit, run by survivors and allies from around the world.';
const twitterDescriptionContent =
  'Join us on your healing journey. Bloom is here for you to learn, heal and grow towards a confident future. It is bought to you by Chayn, a global non-profit, run by survivors and allies from around the world.';
const imageAltContent =
  'An cartoon drawing of a person with almost shoulder length hair against a pink background. They have flowers and leaves coming out of their head. The word "Bloom" hovers above the person.';

const OpenGraphMetadata = () => {
  return (
    <>
      <meta property="og:title" content="Welcome to Bloom" key="og-title" />
      <meta property="og:description" content={descriptionContent} key="og-description" />
      <meta property="og:image" content="/preview.png" key="og-image" />
      <meta property="og:image:alt" content={imageAltContent} key="og-image-alt" />
      <meta name="twitter:card" content="summary_large_image" key="twitter-card" />
      <meta name="twitter:description" content={twitterDescriptionContent} key="twitter-desc" />
      {/** PWA specific tags **/}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/apple/icon-120x120.png"></link>
      <meta name="theme-color" content={theme.palette.primary.main} />
    </>
  );
};

export default OpenGraphMetadata;
