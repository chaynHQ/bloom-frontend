import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LANGUAGES } from '../constants/enums';
import { api } from './api';
import type { RootState } from './store';

export interface User {
  loading: boolean;
  token: string | null;
  id: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  firebaseUid: string | null;
  name: string | null;
  email: string | null;
  partnerAccessCode: string | null;
  contactPermission: boolean;
  crispTokenId: string | null;
  signUpLanguage: LANGUAGES | null;
}

const initialState: User = {
  loading: true,
  token: null,
  id: null,
  createdAt: null,
  updatedAt: null,
  firebaseUid: null,
  name: null,
  email: null,
  partnerAccessCode: null,
  contactPermission: false,
  crispTokenId: null,
  signUpLanguage: null,
};

const slice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    clearUserSlice: (state) => {
      return initialState;
    },
    setUserToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setUserLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return Object.assign({}, state, payload.user);
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return Object.assign({}, state, payload.user);
    });
  },
});

const { actions, reducer } = slice;
export const { clearUserSlice, setUserToken, setUserLoading } = actions;
export const selectCurrentUser = (state: RootState) => state.user;
export default reducer;
