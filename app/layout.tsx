import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file is required to pass children
export default function RootLayout({ children }: Props) {
  return children;
}
