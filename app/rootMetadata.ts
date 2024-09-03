import { Metadata } from 'next';
import { PRIMARY_MAIN_COLOR } from '../constants/common';

const descriptionContent =
  'Join us on your healing journey. Bloom is here for you to learn, heal and grow towards a confident future. It is bought to you by Chayn, a global non-profit, run by survivors and allies from around the world.';
const twitterDescriptionContent =
  'Join us on your healing journey. Bloom is here for you to learn, heal and grow towards a confident future. It is bought to you by Chayn, a global non-profit, run by survivors and allies from around the world.';
const imageAltContent =
  'An cartoon drawing of a person with almost shoulder length hair against a pink background. They have flowers and leaves coming out of their head. The word "Bloom" hovers above the person.';

// Nextjs automatically includes for each route two default meta tags, charset and viewport
// https://nextjs.org/docs/app/building-your-application/optimizing/metadata#default-fields
const rootMetadata: Metadata = {
  title: 'Bloom',
  openGraph: {
    title: 'Welcome to Bloom',
    description: descriptionContent,
    images: [{ url: '/preview.png', alt: imageAltContent }],
  },
  twitter: {
    description: twitterDescriptionContent,
    card: 'summary_large_image',
    images: [],
  },
  manifest: '/manifest.json',
  icons: [{ rel: 'apple-touch-icon', url: '/icons/apple/icon-120x120.png' }],
  other: {
    'theme-color': PRIMARY_MAIN_COLOR,
  },
};

export default rootMetadata;
