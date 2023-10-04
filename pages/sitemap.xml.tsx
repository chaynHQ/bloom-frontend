function generateSiteMap(courses: any) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <!--Manually setting static URLs-->
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
        /* mapping courses dynamically.  */
        ${courses
          .map(({ slug }: any) => {
            return `
                    <url>
                        <loc>${`https://bloom.chayn.co/courses/${slug}`}</loc>
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

export async function getServerSideProps({ res }: any) {
  // We make an API call to gather the URLs for our site
  const request = await fetch('https://bloom.chayn.co/courses');
  const courses = await request.json();

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(courses);

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
