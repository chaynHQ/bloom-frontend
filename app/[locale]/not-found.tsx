'use client';

import Error from 'next/error';
import { Montserrat, Open_Sans } from 'next/font/google';

export const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-montserrat',
  display: 'swap',
});

export default function NotFound() {
  return (
    <html className={`${openSans.variable} ${montserrat.variable}`}>
      <body>
        <Error statusCode={404} />
      </body>
    </html>
  );
}
