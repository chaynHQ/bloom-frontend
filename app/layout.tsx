import { Metadata } from 'next';
import GoogleTagManagerScript from '../components/head/GoogleTagManagerScript';

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
      <body>
        {/* 
        We should be using next third party library https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-tag-manager 
        but sending an event using sendGTMEvent requires an object rather than a list of arguments so the current gtag api function would need to be adapted
        */}
        <GoogleTagManagerScript />
        {children}
      </body>
    </html>
  );
}
