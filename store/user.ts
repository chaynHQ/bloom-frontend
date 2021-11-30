import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { LANGUAGES } from '../common/constants';

// declaring the types for our state
export type User = {
  id: string | null;
  firebaseUid: string | null;
  name: string | null;
  email: string | null;
  partnerAccessCode: string | null;
  languageDefault: LANGUAGES;
  contactPermission: boolean;
};

const initialState: User = {
  id: null,
  firebaseUid: null,
  name: null,
  email: null,
  partnerAccessCode: null,
  languageDefault: LANGUAGES.en,
  contactPermission: false,
};

export const userSlice = createSlice({
  name: 'user',

  initialState,

  reducers: {},

  extraReducers: {
    [HYDRATE]: (state, action) => {
      console.log('HYDRATE', state, action.payload);
      return {
        ...state,
        ...action.payload.user,
      };
    },
  },
});

export default userSlice.reducer;
