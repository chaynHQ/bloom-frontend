import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { Hotjar } from 'nextjs-hotjar';

export default function Analytics() {
  return (
    <>
      {!!process.env.NEXT_PUBLIC_HOTJAR_ID && process.env.NEXT_PUBLIC_ENV !== 'local' && (
        <Hotjar id={process.env.NEXT_PUBLIC_HOTJAR_ID} sv={6} strategy="lazyOnload" />
      )}
      <VercelAnalytics />
    </>
  );
}
