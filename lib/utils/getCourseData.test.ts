import { Course, Courses, Session } from '@/lib/store/coursesSlice';
import { getCourseData } from './getCourseData';

const coursesBase: Courses = [
  {
    storyblokId: 98127815,
    sessions: [{} as Session],
  } as Course,
];
describe('getCourseData', () => {
  it('if empty course is supplied, it returns empty record ', () => {
    expect(getCourseData([])).to.equal({});
  });
  it('if course is supplied, it returns record ', () => {
    expect(getCourseData(coursesBase)).to.equal({ number_dbr_sessions: 1 });
  });
  it('if two courses are supplied, it returns record with two entries', () => {
    expect(
      getCourseData(coursesBase.concat({ storyblokId: 100421614, sessions: [{}, {}] } as Course)),
    ).to.equal({
      number_dbr_sessions: 1,
      number_spst_sessions: 2,
    });
  });
});
