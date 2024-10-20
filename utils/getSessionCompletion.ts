import { Courses, Session } from '../store/coursesSlice';
import { Dispatch, SetStateAction } from 'react';
import { PROGRESS_STATUS } from '../constants/enums';
import { ISbStoryData } from '@storyblok/react';
import { ISbComponentType } from 'storyblok-js-client';

export const getSessionCompletion = (
  course: ISbStoryData<ISbComponentType<string> & { [p: string]: any }>,
  courses: Courses,
  storyUuid: string,
  storyId: number,
  setWeekString: Dispatch<SetStateAction<string>>,
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
