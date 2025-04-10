import { api } from '@/lib/api';
import { FEEDBACK_TAGS, STORYBLOK_STORY_STATUS } from '@/lib/constants/enums';
import { Draft, createSlice } from '@reduxjs/toolkit';
import { User } from './userSlice';

export interface Session {
  id: string;
  name: string;
  slug: string;
  storyblokUuid: string;
  status: STORYBLOK_STORY_STATUS;
  completed: boolean;
}

export interface Course {
  id: string;
  name: string;
  slug: string;
  status: STORYBLOK_STORY_STATUS;
  storyblokUuid: string;
  completed: boolean;
  sessions: Session[];
}
export interface SessionUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  sessionId: string;
  session: Partial<Session>;
  courseUserId: string;
  courseUser: CourseUser;
}

export interface CourseUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  userId: string;
  user: User;
  courseId: string;
  course: Course;
  sessionUser: SessionUser[];
}

export interface SessionFeedback {
  sessionId: string;
  feedbackTags: FEEDBACK_TAGS;
  feedbackDescription: string;
}

export interface Courses extends Array<Course> {}

const initialState: Courses = [];

const mergeUpdatedCourse = (state: Draft<Courses>, payload: Course) => {
  const course = state.filter((course) => course.id === payload.id);

  if (course) {
    state = state.filter((course) => course.id !== payload.id);
    state.push(Object.assign({}, course, payload));
  } else {
    state.concat(payload);
  }

  return state;
};

const slice = createSlice({
  name: 'courses',
  initialState: initialState,
  reducers: {
    clearCoursesSlice: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.courses;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.courses;
    });
    builder.addMatcher(api.endpoints.completeSession.matchFulfilled, (state, { payload }) => {
      return mergeUpdatedCourse(state, payload);
    });
    builder.addMatcher(api.endpoints.startSession.matchFulfilled, (state, { payload }) => {
      return mergeUpdatedCourse(state, payload);
    });
    builder.addMatcher(api.endpoints.getUserCourses.matchFulfilled, (state, { payload }) => {
      return payload;
    });
  },
});

const { actions, reducer } = slice;
export const { clearCoursesSlice } = actions;
export default reducer;
