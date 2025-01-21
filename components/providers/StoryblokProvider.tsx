'use client';

import { ReactNode } from 'react';
import { getStoryblokApi } from '../../lib/storyblok';

export default function StoryblokProvider({ children }: { children: ReactNode }) {
  getStoryblokApi();
  return children;
}
