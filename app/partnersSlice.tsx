import { createSlice } from '@reduxjs/toolkit';
import { Partner } from '../constants/partners';
import { api } from './api';
import type { RootState } from './store';

const initialState: { partners: Partner[] } = { partners: [] };
// This state slice is for the SuperAdmin UI. This is so the super admins can get
// all partners and create partner admins
const slice = createSlice({
  name: 'partners',
  initialState: initialState,
  reducers: {
    clearPartnersSlice: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getPartners.matchFulfilled, (state, { payload }) => {
      return Object.assign({}, state, { partners: payload, loading: false });
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnersSlice } = actions;
export const selectPartners = (state: RootState) => state.partners;
export default reducer;
