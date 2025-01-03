import React from 'react';
import { getStaticPaths as getConversationsStaticPaths } from './conversations/[slug]';
import { getStaticPaths as getCoursesStaticPaths } from './courses/[slug]';
import { getStaticPaths as getSessionsStaticPaths } from './courses/[slug]/[sessionSlug]';
import { getStaticPaths as getShortsStaticPaths } from './shorts/[slug]';

async function generateSiteMap({ locales }: any) {
  /* get url paths for dynamically generated courses using getStaticPaths */
  const courses = (await getCoursesStaticPaths({ locales })).paths;
  const sessions = (await getSessionsStaticPaths({ locales })).paths;
  const conversations = (await getConversationsStaticPaths({ locales })).paths;
  const shorts = (await getShortsStaticPaths({ locales })).paths;

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://bloom.chayn.co</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/meet-the-team</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/messaging</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/activities</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/grounding</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/subscription/whatsapp</loc>
        </url>
        <url>
            <loc>https://bloom.chayn.co/courses</loc>
        </url>
        ${courses
          .map((course: { locale: string; params: { slug: string } }) => {
            const locale = course.locale !== 'en' ? `/${course.locale}` : '';
            return `
                    <url>
                        <loc>${`https://bloom.chayn.co${locale}/courses/${course.params.slug}`}</loc>
                    </url>
                `;
          })
          .join('')}
        ${sessions
          .map((course: { locale: string; params: { slug: string; sessionSlug: string } }) => {
            const locale = course.locale !== 'en' ? `/${course.locale}` : '';
            return `
                    <url>
                        <loc>${`https://bloom.chayn.co${locale}/courses/${course.params.slug}/${course.params.sessionSlug}`}</loc>
                    </url>
                `;
          })
          .join('')}
        ${conversations
          .map((conversation: { locale: string; params: { slug: string } }) => {
            const locale = conversation.locale !== 'en' ? `/${conversation.locale}` : '';
            return `
                    <url>
                        <loc>${`https://bloom.chayn.co${locale}/conversations/${conversation.params.slug}`}</loc>
                    </url>
                `;
          })
          .join('')}
        ${shorts
          .map((short: { locale: string; params: { slug: string } }) => {
            const locale = short.locale !== 'en' ? `/${short.locale}` : '';
            return `
                    <url>
                        <loc>${`https://bloom.chayn.co${locale}/shorts/${short.params.slug}`}</loc>
                    </url>
                `;
          })
          .join('')}
    </urlset>
    `;
}

const SiteMap: React.FC = () => {
  // getServerSideProps will do the heavy lifting
  return null;
};

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
