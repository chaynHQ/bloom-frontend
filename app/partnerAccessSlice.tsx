import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import type { RootState } from './store';

export interface PartnerAccess {
  id: string | null;
  activatedAt: Date | null;
  featureLiveChat: boolean | null;
  featureTherapy: boolean | null;
  accessCode: string | null;
  therapySessionsRemaining: number | null;
  therapySessionsRedeemed: number | null;
}

const initialState: PartnerAccess = {
  id: null,
  activatedAt: null,
  featureLiveChat: null,
  featureTherapy: null,
  accessCode: null,
  therapySessionsRemaining: null,
  therapySessionsRedeemed: null,
};

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

const { actions, reducer } = slice;
export const { clearPartnerAccessSlice } = actions;
export const selectPartnerAccess = (state: RootState) => state.partnerAccess;
export default reducer;
