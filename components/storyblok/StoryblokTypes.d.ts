import { STORYBLOK_REFERENCE_CATEGORIES } from '@/lib/constants/enums';

export type StoryblokColumn = {
  width: number;
  content: any;
};

export type StoryblokBlok = {
  type: 'blok';
  attrs: {
    body: [StoryblokColumn];
  };
};

export type StoryblokReferenceProps = {
  title: string;
  attribution: string;
  url?: string;
  is_key_reference: boolean;
  category: STORYBLOK_REFERENCE_CATEGORIES;
};
