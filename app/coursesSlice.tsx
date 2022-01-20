import { createSlice } from '@reduxjs/toolkit';
import { STORYBLOK_STORY_STATUS_ENUM } from '../constants/enums';
import { api } from './api';
import type { RootState } from './store';

export interface Session {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  storyblokId?: string | null;
  status?: STORYBLOK_STORY_STATUS_ENUM | null;
  completed?: string | null;
}

export interface Course {
  id: string | null;
  name: string | null;
  slug: string | null;
  status: STORYBLOK_STORY_STATUS_ENUM | null;
  storyblokId: string | null;
  completed: boolean | null;
  session: Session[];
}

export interface Courses extends Array<Course> {}

const initialState: Courses = [];

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
  },
});

const { actions, reducer } = slice;
export const { clearCoursesSlice } = actions;
export const selectCourses = (state: RootState) => state.courses;
export default reducer;
