import { Session } from '../store/coursesSlice';
import { Dispatch, SetStateAction } from 'react';
import { PROGRESS_STATUS } from '../constants/enums';

export const getSessionCompletion = (
  course: any,
  courses: any[],
  storyUuid: string,
  storyId: number,
  setWeekString: (weekName: string) => void,
  setSessionProgress: Dispatch<SetStateAction<PROGRESS_STATUS>>,
) => {
  course.content.weeks.map((week: any) => {
    week.sessions.map((session: any) => {
      if (session === storyUuid) {
        setWeekString(week.name);
      }
    });
  });

  const userCourse = courses.find((c: any) => Number(c.storyblokId) === course.id);

  if (userCourse) {
    const userSession = userCourse.sessions.find(
      (session: Session) => Number(session.storyblokId) === storyId,
    );

    if (userSession) {
      userSession.completed
        ? setSessionProgress(PROGRESS_STATUS.COMPLETED)
        : setSessionProgress(PROGRESS_STATUS.STARTED);
    }
  }
};
