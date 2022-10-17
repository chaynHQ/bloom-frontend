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
