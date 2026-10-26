import type { Metadata } from 'next';
import { ReactNode } from 'react';

// The page is a client component, so it can't export metadata itself.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
