import type { Metadata } from 'next';
import { ReactNode } from 'react';

// The page is a client component, so its route config and metadata live here.
export const metadata: Metadata = { robots: { index: false, follow: true } };

// Rendered entirely from the one-time Firebase codes in its URL, so there's nothing to cache.
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
