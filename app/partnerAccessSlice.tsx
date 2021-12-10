import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import type { RootState } from './store';

export interface PartnerAccess {
  id: string | null;
  activatedAt: Date | null;
  featureLiveChat: boolean | null;
  featureTherapy: boolean | null;
  partnerAccessCode: string | null;
  therapySessionsRemaining: number | null;
  therapySessionsRedeemed: number | null;
}

const initialState: PartnerAccess = {
  id: null,
  activatedAt: null,
  featureLiveChat: null,
  featureTherapy: null,
  partnerAccessCode: null,
  therapySessionsRemaining: null,
  therapySessionsRedeemed: null,
};

const slice = createSlice({
  name: 'partnerAccess',
  initialState: initialState,
  reducers: {
    clear: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getPartnerAccess.matchFulfilled, (state, { payload }) => {
      state = payload;
    });
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return payload.partnerAccess;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.partnerAccess;
    });
  },
});

export default slice.reducer;

export const selectPartnerAccess = (state: RootState) => state.partnerAccess;
