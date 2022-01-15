import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import { Partner } from './partnerSlice';
import type { RootState } from './store';

export interface PartnerAccess {
  id: string | null;
  activatedAt: Date | null;
  featureLiveChat: boolean | null;
  featureTherapy: boolean | null;
  accessCode: string | null;
  therapySessionsRemaining: number | null;
  therapySessionsRedeemed: number | null;
  partner: Partner;
}

export interface PartnerAccesses extends Array<PartnerAccess> {}

const initialState: PartnerAccesses = [];

const slice = createSlice({
  name: 'partnerAccess',
  initialState: initialState,
  reducers: {
    clearPartnerAccessSlice: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addPartnerAccess.matchFulfilled, (state, { payload }) => {
      state.push(payload);
    });
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.partnerAccess;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.partnerAccess;
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnerAccessSlice } = actions;
export const selectPartnerAccess = (state: RootState) => state.partnerAccess;
export default reducer;
