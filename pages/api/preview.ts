import { NextApiRequest, NextApiResponse } from 'next';

export default async function preview(req: NextApiRequest, res: NextApiResponse) {
  const { slug = '' } = req.query;
  // get the storyblok params for the bridge to work
  const params = req.url?.split('?');

  // Check the secret and next parameters
  // This secret should only be known to this API route and the CMS
  if (req.query.secret !== process.env.NEXT_PUBLIC_STORYBLOK_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({});

  // Set cookie to None, so it can be read in the Storyblok iframe
  const cookies = res.getHeader('Set-Cookie');

  if (cookies instanceof Array) {
    res.setHeader(
      'Set-Cookie',
      cookies.map((cookie) => cookie.replace('SameSite=Lax', 'SameSite=None;Secure')),
    );
  }
  // Redirect to the path from entry
  res.redirect(`/${slug}?${params && params[1]}`);
}
