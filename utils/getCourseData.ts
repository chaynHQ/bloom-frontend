import { Courses } from '../app/coursesSlice';

const storyblokIdColumnMap: Record<string, string> = {
  98127815: 'number_dbr_sessions',
  100411026: 'number_hst_sessions',
  100421614: 'number_spst_sessions',
};

export const getCourseData = (courses: Courses) =>
  courses.reduce<Record<string, number>>((acc, curr) => {
    return {
      ...acc,
      [storyblokIdColumnMap[curr.storyblokId]]: curr.sessions.length,
    };
  }, {});
