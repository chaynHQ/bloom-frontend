import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { Course } from '../../app/coursesSlice';
import { PROGRESS_STATUS } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import { StoryblokSessionJson } from '../../utils/helper-types/storyblok';

interface SessionProgressDisplayProps {
  session: StoryblokSessionJson;
  storyblokCourseId: number;
}

export const SessionProgressDisplay = (props: SessionProgressDisplayProps) => {
  const { session, storyblokCourseId } = props;

  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );

  const courses = useTypedSelector((state) => state.courses);

  useEffect(() => {
    const userCourse = courses.find((course: Course) => course.storyblokId === storyblokCourseId);

    if (userCourse) {
      const matchingSession = userCourse.sessions?.find(
        (userSession) => userSession.storyblokId === session.id,
      );

      if (matchingSession) {
        matchingSession.completed
          ? setSessionProgress(PROGRESS_STATUS.COMPLETED)
          : setSessionProgress(PROGRESS_STATUS.STARTED);
      } else {
        setSessionProgress(PROGRESS_STATUS.NOT_STARTED);
      }
    }
  }, [courses, session.id, storyblokCourseId]);

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
