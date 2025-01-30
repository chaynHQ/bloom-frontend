import { PROGRESS_STATUS } from '@/constants/enums';
import { Courses, Session } from '@/lib/store/coursesSlice';
import { ISbStoryData } from '@storyblok/react/rsc';
import { Dispatch, SetStateAction } from 'react';

export const getSessionCompletion = (
  course: ISbStoryData,
  courses: Courses,
  storyId: number,
  setSessionProgress: Dispatch<SetStateAction<PROGRESS_STATUS>>,
  setSessionId: Dispatch<SetStateAction<string | undefined>>,
) => {
  const userCourse = courses.find((c: any) => Number(c.storyblokId) === course.id);

  if (userCourse) {
    const userSession = userCourse.sessions.find(
      (session: Session) => Number(session.storyblokId) === storyId,
    );

    if (userSession) {
      setSessionId(userSession.id);
      userSession.completed
        ? setSessionProgress(PROGRESS_STATUS.COMPLETED)
        : setSessionProgress(PROGRESS_STATUS.STARTED);
    }
  }
};
