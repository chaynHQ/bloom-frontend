import { Metadata } from 'next';

// Nextjs automatically includes for each route two default meta tags, charset and viewport
// https://nextjs.org/docs/app/building-your-application/optimizing/metadata#default-fields
export const metadata: Metadata = {
  title: 'Bloom',
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
