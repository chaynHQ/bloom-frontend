import { api } from '@/lib/api';
import { createSlice } from '@reduxjs/toolkit';
import { Partner } from './partnersSlice';

export interface PartnerAccess {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Date;
  featureLiveChat: boolean;
  featureTherapy: boolean;
  accessCode: string;
  therapySessionsRemaining: number;
  therapySessionsRedeemed: number;
  partner: Partner;
  active: boolean;
}

export interface PartnerAccesses extends Array<PartnerAccess> {}

const initialState: PartnerAccesses = [];

const slice = createSlice({
  name: 'partnerAccesses',
  initialState: initialState,
  reducers: {
    clearPartnerAccessesSlice: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAccesses) return payload.partnerAccesses;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAccesses) return payload.partnerAccesses;
    });
    builder.addMatcher(api.endpoints.assignPartnerAccess.matchFulfilled, (state, { payload }) => {
      if (payload.id) return state.concat(payload);
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnerAccessesSlice } = actions;
export default reducer;
