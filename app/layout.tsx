import Analytics from '../components/head/Analytics';
import GoogleTagManagerScript from '../components/head/GoogleTagManagerScript';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import rootMetadata from './rootMetadata';
import RollbarScript from '../components/head/RollbarScript';
import ThemeRegistry from './ThemeRegistry';
import rootMetadata from './rootMetadata';

export const metadata = rootMetadata;

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
        <RollbarScript />
        <ErrorBoundary>
          <ThemeRegistry>{children}</ThemeRegistry>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
