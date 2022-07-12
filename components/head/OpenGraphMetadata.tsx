import Head from 'next/head';

const descriptionContent =
  "Learn and heal from trauma in a private, supportive space. Our courses are written and checked by survivors, allies, mental health support workers and therapists from around the world. Healing from trauma can be isolating. We're here for you.";
const twitterDescriptionContent =
  "Learn and heal from trauma in a private, supportive space. Our courses are written and checked by survivors, allies, mental health support workers and therapists. We're here for you.";
const imageContent = `${process.env.NEXT_PUBLIC_BASE_URL}bloom_socials_preview.png`;
const imageAltContent =
  "An cartoon drawing of a person with almost shoulder length hair against a pink background. They have flowers and leaves coming out of their head. The word 'Bloom' hovers above the person.";

const OpenGraphMetadata = () => {
  return (
    <Head>
      <meta property="og:title" content="Welcome to Bloom" key="og-title" />
      <meta property="og:description" content={descriptionContent} key="og-description" />
      <meta property="og:image" content={imageContent} key="og-image"></meta>
      <meta property="og:image:alt" content={imageAltContent} key="og-image-alt"></meta>
      <meta property="twitter:card" content="summary_large_image" key="twitter-card"></meta>
      <meta
        property="twitter:description"
        content={twitterDescriptionContent}
        key="twitter-desc"
      ></meta>
    </Head>
  );
};

export default OpenGraphMetadata;
