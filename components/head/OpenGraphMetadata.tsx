import Head from 'next/head';
import { BASE_URL } from '../../constants/common';
import theme from '../../styles/theme';

const descriptionContent =
  "Learn and heal from trauma in a private, supportive space. Our courses are written and checked by survivors, allies, mental health support workers and therapists from around the world. Healing from trauma can be isolating. We're here for you.";
const twitterDescriptionContent =
  'A global tech nonprofit empowering women & marginalised genders facing abuse. Feminist, Survivor-led, Intersectional.';
const imageContent = `${BASE_URL}/bloom_socials_preview.png`;
const imageAltContent =
  'An cartoon drawing of a person with almost shoulder length hair against a pink background. They have flowers and leaves coming out of their head. The word "Bloom" hovers above the person.';

const OpenGraphMetadata = () => {
  return (
    <Head>
      <meta property="og:title" content="Welcome to Bloom" key="og-title" />
      <meta property="og:description" content={descriptionContent} key="og-description" />
      <meta property="og:image" content={imageContent} key="og-image"></meta>
      <meta property="og:image:alt" content={imageAltContent} key="og-image-alt"></meta>
      <meta name="twitter:card" content="summary_large_image" key="twitter-card"></meta>
      <meta
        name="twitter:description"
        content={twitterDescriptionContent}
        key="twitter-desc"
      ></meta>
      {/** PWA specific tags **/}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/apple/icon-120x120.png"></link>
      <meta name="theme-color" content={theme.palette.primary.main} />
    </Head>
  );
};

export default OpenGraphMetadata;
