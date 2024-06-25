import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SignUpBanner } from '../../components/banner/SignUpBanner';
import Header from '../../components/layout/Header';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '../../hooks/store';
import { StoryblokPageSectionProps } from './StoryblokPageSection';

export interface StoryblokPageProps {
  _uid: string;
  _editable: string;
  title: string;
  description: ISbRichtext;
  header_image: { filename: string; alt: string };
  page_sections: StoryblokPageSectionProps[];
}

const StoryblokPage = (props: StoryblokPageProps) => {
  const { _uid, _editable, title, description, header_image, page_sections } = props;

  const userId = useTypedSelector((state) => state.user.id);
  const router = useRouter();

  const headerProps = {
    title: title,
    introduction: description,
    imageSrc: header_image?.filename,
    translatedImageAlt: header_image?.alt,
  };
  const partiallyPublicPages = ['/activities', '/grounding'];
  const isPartiallyPublicPage = partiallyPublicPages.includes(router.asPath);

  return (
    <>
      <Head>{title}</Head>
      <main
        {...storyblokEditable({ _uid, _editable, title, description, header_image, page_sections })}
      >
        <Header
          title={headerProps.title}
          introduction={headerProps.introduction}
          imageSrc={headerProps.imageSrc}
          translatedImageAlt={headerProps.translatedImageAlt}
        />
        {!userId && isPartiallyPublicPage && <SignUpBanner />}
        {userId &&
          page_sections?.length > 0 &&
          page_sections.map((section: StoryblokPageSectionProps, index: number) => (
            <StoryblokPageSection key={`page_section_${index}`} {...section} />
          ))}
      </main>
    </>
  );
};

export default StoryblokPage;
