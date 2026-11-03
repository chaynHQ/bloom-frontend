import { routing } from '@/i18n/routing';
import { getLibraryTranscripts } from '@/lib/utils/getLibraryStories';

export const revalidate = 14400; // matches the library page

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Static per locale and CDN-cached, so searching sends nothing about the query to the server.
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return Response.json(await getLibraryTranscripts(locale));
}
