import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import type { RootState } from './store';

export interface Current {
  loading: boolean;
  loginRedirect: URL | null;
}

const initialState: Current = {
  loading: false,
  loginRedirect: null,
};

const slice = createSlice({
  name: 'current',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchPending, (state, { payload }) => {
      state.loading = true;
    });
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      state.loading = false;
    });
  },
});

export default slice.reducer;

export const selectCurrent = (state: RootState) => state.current;
