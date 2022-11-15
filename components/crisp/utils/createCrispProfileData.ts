import { Course } from '../../../app/coursesSlice';
import { PartnerAccesses } from '../../../app/partnerAccessSlice';
import { User } from '../../../app/userSlice';
import { PROGRESS_STATUS } from '../../../constants/enums';

export const getAcronym = (text: string) => {
  return `${text
    .split(/\s/)
    .reduce((response, word) => (response += word.slice(0, 1)), '')
    .toLowerCase()}`;
};

export const formatCourseKey = (courseName: string) => {
  return `course_${getAcronym(courseName)}_status`;
};

export const formatSessionKey = (courseName: string, status: PROGRESS_STATUS) => {
  return `course_${getAcronym(courseName)}_sessions_${status.toLowerCase()}`;
};

export const createCrispProfileData = (
  user: User,
  partnerAccesses: PartnerAccesses,
  course?: Course[],
) => {
  let profileData = {
    partners: partnerAccesses.map((pa) => pa.partner.name).join('; ') || '',
    feature_live_chat: !!partnerAccesses.find((pa) => !!pa.featureLiveChat),
    feature_therapy: !!partnerAccesses.find((pa) => !!pa.featureTherapy),
    therapy_sessions_remaining: partnerAccesses
      .map((pa) => pa.therapySessionsRemaining)
      .reduce((a, b) => a + b, 0),
    therapy_sessions_redeemed: partnerAccesses
      .map((pa) => pa.therapySessionsRedeemed)
      .reduce((a, b) => a + b, 0),
  };

  if (!!course && course.length > 0) {
    const courseData: { [key: string]: string } = {};

    course.forEach((course) => {
      const sessions = course.sessions;
      const courseKey = formatCourseKey(course.name);
      courseData[`${courseKey}`] = course.completed
        ? PROGRESS_STATUS.COMPLETED
        : PROGRESS_STATUS.STARTED;

      const sessionsStartedKey = formatSessionKey(course.name, PROGRESS_STATUS.STARTED);
      const sessionsStarted = sessions
        .filter((session) => !session.completed)
        .map((s) => s.name)
        .join('; ');
      courseData[`${sessionsStartedKey}`] = sessionsStarted;
      const sessionsCompletedKey = formatSessionKey(course.name, PROGRESS_STATUS.COMPLETED);
      const sessionsCompleted = sessions
        .filter((session) => !!session.completed)
        .map((session) => session.name)
        .join('; ');
      courseData[`${sessionsCompletedKey}`] = sessionsCompleted;
    });
    profileData = Object.assign({}, profileData, courseData);
  }

  return profileData;
};
