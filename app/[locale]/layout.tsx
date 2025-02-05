import BaseLayout from '@/components/layout/BaseLayout';
import { routing } from '@/i18n/routing';
import { generateMetadataBase } from '@/lib/utils/generateMetadataBase';
import type { Viewport } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

type Params = Promise<{ locale: string }>;

export const viewport: Viewport = {
  themeColor: '#F3D6D8',
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return await generateMetadataBase(locale);
}

export interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout(props: RootLayoutProps) {
  const { locale } = await props.params;
  const { children } = props;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return <BaseLayout locale={locale}>{children}</BaseLayout>;
}
