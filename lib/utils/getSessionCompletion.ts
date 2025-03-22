import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { Courses, Session } from '@/lib/store/coursesSlice';
import { ISbStoryData } from '@storyblok/react/rsc';
import { Dispatch, SetStateAction } from 'react';

export const getSessionCompletion = (
  course: ISbStoryData,
  courses: Courses,
  storyblokUuid: string,
  setSessionProgress: Dispatch<SetStateAction<PROGRESS_STATUS>>,
  setSessionId: Dispatch<SetStateAction<string | undefined>>,
) => {
  const userCourse = courses.find((c: any) => c.storyblokUuid === course.uuid);

  if (userCourse) {
    const userSession = userCourse.sessions.find(
      (session: Session) => session.storyblokUuid === storyblokUuid,
    );

    if (userSession) {
      setSessionId(userSession.id);
      userSession.completed
        ? setSessionProgress(PROGRESS_STATUS.COMPLETED)
        : setSessionProgress(PROGRESS_STATUS.STARTED);
    }
  }
};
