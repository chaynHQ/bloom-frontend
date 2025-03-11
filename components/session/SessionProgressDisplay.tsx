'use client';

import { useGetUserCoursesQuery } from '@/lib/api';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { useTypedSelector } from '@/lib/hooks/store';
import { Course } from '@/lib/store/coursesSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

interface SessionProgressDisplayProps {
  sessionId: number;
  storyblokCourseId: number;
}

export const SessionProgressDisplay = (props: SessionProgressDisplayProps) => {
  const { sessionId, storyblokCourseId } = props;

  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const courses = useTypedSelector((state) => state.courses);

  useGetUserCoursesQuery(undefined);

  useEffect(() => {
    const userCourse = courses?.find((course: Course) => course.storyblokId === storyblokCourseId);

    if (userCourse) {
      const matchingSession = userCourse.sessions?.find(
        (userSession) => userSession.storyblokId === sessionId,
      );

      if (matchingSession) {
        matchingSession.completed
          ? setSessionProgress(PROGRESS_STATUS.COMPLETED)
          : setSessionProgress(PROGRESS_STATUS.STARTED);
      } else {
        setSessionProgress(PROGRESS_STATUS.NOT_STARTED);
      }
    }
  }, [courses, sessionId, storyblokCourseId]);

  return (
    <>
      {sessionProgress !== PROGRESS_STATUS.NOT_STARTED && (
        <Box mt={0.5}>
          {sessionProgress === PROGRESS_STATUS.STARTED && <DonutLargeIcon color="error" />}
          {sessionProgress === PROGRESS_STATUS.COMPLETED && <CheckCircleIcon color="error" />}
        </Box>
      )}
    </>
  );
};
