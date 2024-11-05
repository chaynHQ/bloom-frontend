import { ISbStoryData } from '@storyblok/react';
import { Dispatch, SetStateAction } from 'react';
import { ISbComponentType } from 'storyblok-js-client';
import { PROGRESS_STATUS } from '../constants/enums';
import { Courses, Session } from '../store/coursesSlice';

export const getSessionCompletion = (
  course: ISbStoryData<ISbComponentType<string> & { [p: string]: any }>,
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
