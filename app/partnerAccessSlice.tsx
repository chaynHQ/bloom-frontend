import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import { Partner } from './partnerSlice';
import type { RootState } from './store';

export interface PartnerAccess {
  id: string;
  activatedAt: Date;
  featureLiveChat: boolean;
  featureTherapy: boolean;
  accessCode: string;
  therapySessionsRemaining: number;
  therapySessionsRedeemed: number;
  partner: Partner;
}

export interface PartnerAccesses extends Array<PartnerAccess> {}

const initialState: PartnerAccesses = [];

const slice = createSlice({
  name: 'partnerAccesses',
  initialState: initialState,
  reducers: {
    clearPartnerAccessesSlice: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addPartnerAccess.matchFulfilled, (state, { payload }) => {
      state.push(payload);
    });
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.partnerAccesses;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.partnerAccesses;
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnerAccessesSlice } = actions;
export const selectPartnerAccesses = (state: RootState) => state.partnerAccesses;
export default reducer;
