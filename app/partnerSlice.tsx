import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import type { RootState } from './store';

export interface Partner {
  id: string | null;
  name: string | null;
  logo: string | null;
  primaryColor: string | null;
}

const initialState: Partner = {
  id: null,
  name: null,
  logo: null,
  primaryColor: null,
};

const slice = createSlice({
  name: 'partner',
  initialState: initialState,
  reducers: {
    clear: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.partner;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.partner;
    });
  },
});

export default slice.reducer;

export const selectPartner = (state: RootState) => state.partner;
