'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import Header from '@/components/layout/Header';
import { usePathname } from '@/i18n/routing';
import { useTypedSelector } from '@/lib/hooks/store';
import { SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import DynamicComponent from './DynamicComponent';

export interface StoryblokPageProps {
  _uid: string;
  _editable: string;
  title: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  page_sections: SbBlokData[];
}

const StoryblokPage = (props: StoryblokPageProps) => {
  const { _uid, _editable, title, description, header_image, page_sections } = props;

  const userId = useTypedSelector((state) => state.user.id);
  const pathname = usePathname();

  const headerProps = {
    title: title,
    introduction: description,
    imageSrc: header_image?.filename,
    translatedImageAlt: header_image?.alt,
  };
  const partiallyPublicPages = ['/activities', '/grounding'];
  const isPartiallyPublicPage = partiallyPublicPages.includes(pathname);

  return (
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
        page_sections.map((section: SbBlokData, index: number) => (
          <DynamicComponent key={`page_section_${index}`} blok={section} />
        ))}
    </main>
  );
};

export default StoryblokPage;
