import { getStaticPaths } from './courses/[slug]/[sessionSlug]';

async function generateSiteMap({ locales }: any) {
    /* get url paths for dynamically generated courses using getStaticPaths */
    const courses = (await getStaticPaths({ locales })).paths 

    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://bloom.chayn.co</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/therapy/about-our-courses</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/therapy/meet-the-team</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/therapy/book-session</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/therapy/confirmed-session</loc>
        </url>
        ${courses
          .map((course: any) => {
            return `
                    <url>
                        <loc>${`https://bloom.chayn.co/courses/${course.params.slug}/${course.params.sessionSlug}`}</loc>
                    </url>
                `;
          })
          .join('')}
    </urlset>
    `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
  return null;
}

export async function getServerSideProps({ locales, res }: any) {
  // We generate the XML sitemap with the courses data
  const sitemap = await generateSiteMap({ locales });

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
