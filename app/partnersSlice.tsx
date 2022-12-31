import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Partner } from '../constants/partners';
import { api } from './api';
import type { RootState } from './store';

const initialState: { partners: Partner[]; loading: boolean } = { partners: [], loading: true };

const slice = createSlice({
  name: 'partners',
  initialState: initialState,
  reducers: {
    clearPartnersSlice: (state) => {
      return initialState;
    },
    setPartnersLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getPartners.matchFulfilled, (state, { payload }) => {
      console.log('PAYLOAD', payload);
      return Object.assign({}, state, { partners: payload, loading: false });
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnersSlice } = actions;
export const selectPartners = (state: RootState) => state.partners;
export default reducer;
