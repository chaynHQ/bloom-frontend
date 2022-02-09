import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { STORYBLOK_STORY_STATUS_ENUM } from '../constants/enums';
import { api } from './api';
import type { RootState } from './store';
import { User } from './userSlice';

export interface Session {
  id: string;
  name: string;
  slug: string;
  storyblokId: number;
  status: STORYBLOK_STORY_STATUS_ENUM;
  completed: string;
}

export interface Course {
  id: string;
  name: string;
  slug: string;
  status: STORYBLOK_STORY_STATUS_ENUM;
  storyblokId: number;
  completed: boolean;
  sessions: Session[];
}
export interface SessionUser {
  id: string;
  completed: boolean;
  sessionId: string;
  session: Partial<Session>;
  courseUserId: string;
  courseUser: CourseUser;
}

export interface CourseUser {
  id: string;
  completed: boolean;
  userId: string;
  user: User;
  courseId: string;
  course: Course;
  sessionUser: SessionUser[];
}

export interface Courses extends Array<Course> {}

const initialState: Courses = [];

const mergeUpdatedCourse = (state: WritableDraft<Courses>, payload: Course) => {
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
      state = initialState;
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
  },
});

const { actions, reducer } = slice;
export const { clearCoursesSlice } = actions;
export const selectCourses = (state: RootState) => state.courses;
export default reducer;
