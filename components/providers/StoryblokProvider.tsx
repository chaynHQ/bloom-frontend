'use client';

import { getStoryblokApi } from '../../lib/storyblok';

export default function StoryblokProvider({ children }: { children: JSX.Element }) {
  getStoryblokApi();
  return children;
}
