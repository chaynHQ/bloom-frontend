'use client';

import { getStoryblokApi } from '@/lib/storyblok';
import { ReactNode } from 'react';

export default function StoryblokProvider({ children }: { children: ReactNode }) {
  getStoryblokApi();
  return children;
}
