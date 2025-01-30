import { api } from '@/lib/api';
import { getPartnerContent, PartnerContent } from '@/lib/constants/partners';
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
  partner: PartnerContent & Partner; // Note static import of partner as well as db
}

export interface PartnerAccesses extends Array<PartnerAccess> {}

const initialState: PartnerAccesses = [];

const mergeUserPartnerState = (partnerAccesses: PartnerAccess[]) => {
  return partnerAccesses.map((partnerAccess) => {
    if (partnerAccess.partner) {
      let newPartnerAccess: PartnerAccess = {
        ...partnerAccess,
      };
      newPartnerAccess.partner = Object.assign(
        {},
        newPartnerAccess.partner,
        getPartnerContent(partnerAccess.partner.name), // populate state with static values
      );
      return newPartnerAccess;
    }
    return partnerAccess;
  });
};

const slice = createSlice({
  name: 'partnerAccesses',
  initialState: initialState,
  reducers: {
    clearPartnerAccessesSlice: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAccesses) return mergeUserPartnerState(payload.partnerAccesses);
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAccesses) return mergeUserPartnerState(payload.partnerAccesses);
    });
    builder.addMatcher(api.endpoints.assignPartnerAccess.matchFulfilled, (state, { payload }) => {
      if (payload.id) return state.concat(mergeUserPartnerState([payload]));
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnerAccessesSlice } = actions;
export default reducer;
