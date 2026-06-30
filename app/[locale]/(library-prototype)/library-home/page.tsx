import LibraryHomePage from '@/components/pages/LibraryHomePage';

// NOTE: Static illustrative prototype of an alternative homepage that shares the unified
// library's building blocks (see components/pages/library/libraryContent.tsx). Lives at a
// throwaway route so it doesn't clobber the real homepage. Dummy data, no Storyblok/Redux.

export const metadata = {
  title: 'Home (library prototype) | Bloom',
  description: 'A free, safe space to heal from gender-based violence.',
};

export default function Page() {
  return <LibraryHomePage />;
}
