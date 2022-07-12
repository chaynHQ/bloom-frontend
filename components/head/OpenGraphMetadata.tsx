import Head from 'next/head';

const descriptionContent =
  "Learn and heal from trauma in a private, supportive space. Our courses are written and checked by survivors, allies, mental health support workers and therapists from around the world. Healing from trauma can be isolating. We're here for you.";
const imageAltContent =
  "An cartoon drawing of a person with almost shoulder length hair against a pink background. They have flowers and leaves coming out of their head. The word 'Bloom' hovers above the person.";

const OpenGraphMetadata = () => {
  return (
    <Head>
      <meta property="og:title" content="Bloom" key="title" />
      <meta property="og:description" content={descriptionContent} key="description" />
      <meta property="og:image" content="/bloom_socials_preview.png"></meta>
      <meta property="og:image:alt" content={imageAltContent}></meta>
    </Head>
  );
};

export default OpenGraphMetadata;
