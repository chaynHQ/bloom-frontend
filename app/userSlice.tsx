import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGES } from '../common/constants';
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
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.user;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload;
    });
  },
});

export default slice.reducer;

export const selectCurrentUser = (state: RootState) => state.user;
