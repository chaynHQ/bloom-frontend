import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGES } from '../constants/enums';
import { api } from './api';
import type { RootState } from './store';

export interface User {
  id: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  firebaseUid: string | null;
  token: string | null;
  name: string | null;
  email: string | null;
  partnerAccessCode: string | null;
  languageDefault: LANGUAGES;
  contactPermission: boolean;
}

const initialState: User = {
  id: null,
  createdAt: null,
  updatedAt: null,
  firebaseUid: null,
  token: null,
  name: null,
  email: null,
  partnerAccessCode: null,
  languageDefault: LANGUAGES.en,
  contactPermission: false,
};

const slice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    clearUserSlice: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.user;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.user;
    });
  },
});

const { actions, reducer } = slice;
export const { clearUserSlice } = actions;
export const selectCurrentUser = (state: RootState) => state.user;
export default reducer;
