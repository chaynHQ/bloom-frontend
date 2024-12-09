import { Draft, createSlice } from '@reduxjs/toolkit';
import { FEEDBACK_TAGS, RESOURCE_CATEGORIES, STORYBLOK_STORY_STATUS } from '../constants/enums';
import { api } from './api';
import { User } from './userSlice';

export interface Resource {
  id: string;
  name: string;
  slug: string;
  status: STORYBLOK_STORY_STATUS;
  storyblokId: number;
  storyblokUuid: string;
  category: RESOURCE_CATEGORIES;
  completedAt: string;
}

export interface ResourceUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: string;
  userId: string;
  user: User;
  resourceId: string;
  resource: Resource;
}

export interface ResourceFeedback {
  resourceId: string;
  feedbackTags: FEEDBACK_TAGS;
  feedbackDescription: string;
}

export interface Resources extends Array<Resource> {}

const initialState: Resources = [];

const mergeUpdatedResource = (state: Draft<Resources>, payload: Resource) => {
  const resource = state.filter((resource) => resource.id === payload.id);

  if (resource) {
    state = state.filter((resource) => resource.id !== payload.id);
    state.push(Object.assign({}, resource, payload));
  } else {
    state.concat(payload);
  }

  return state;
};

const slice = createSlice({
  name: 'resources',
  initialState: initialState,
  reducers: {
    clearResourcesSlice: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.resources;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.resources;
    });
    builder.addMatcher(api.endpoints.completeResource.matchFulfilled, (state, { payload }) => {
      return mergeUpdatedResource(state, payload);
    });
    builder.addMatcher(api.endpoints.startResource.matchFulfilled, (state, { payload }) => {
      return mergeUpdatedResource(state, payload);
    });
  },
});

const { actions, reducer } = slice;
export const { clearResourcesSlice } = actions;
export default reducer;
