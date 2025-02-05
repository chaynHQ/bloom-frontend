// removes locale from slug to prevent links repeating locale path
// e.g. fr/courses/course_name -> /courses/course_name
export const getDefaultFullSlug = (fullSlug: string, locale: string) => {
  let slug = fullSlug.charAt(0) === '/' ? fullSlug.slice(1) : fullSlug; // remove / from start
  if (locale !== 'en') {
    slug = slug.slice(3); // remove locale path
  }
  return `/${slug}`;
};
