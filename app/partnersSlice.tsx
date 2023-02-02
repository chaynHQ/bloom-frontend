import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import { PartnerAccess } from './partnerAccessSlice';
import type { RootState } from './store';

export interface Feature {
  name: string;
  id: string;
}
export interface PartnerFeature {
  name: string;
  id: string;
  active: boolean;
  feature: Feature;
}
export interface Partner {
  id: string;
  name: string; // rename to display name to show value is intended for display and can be upper case
  partnerFeature: PartnerFeature[];
}
const initialState: Partner[] = [];

const mergeUserPartnerState = (partnerAccesses: PartnerAccess[]) => {
  return partnerAccesses.map((partnerAccess) => {
    const partner = partnerAccess.partner;
    return { id: partner.id, name: partner.name, partnerFeature: partner.partnerFeature };
  });
};

// This state slice stores all the Partner data the user has access to. Super admins can see all
// partner users can only see the users that they have partner access codes for

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
      return payload;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAccesses) {
        const partners = state.concat(mergeUserPartnerState(payload.partnerAccesses));
        // ensure list of partners is unique
        return partners.filter((item, index, array) => array.indexOf(item) === index);
      }
    });
    builder.addMatcher(api.endpoints.getPartnerByName.matchFulfilled, (state, { payload }) => {
      if (payload) {
        const partners = state.filter((p) => p.id !== payload.id);
        // ensure list of partners is unique
        return partners.concat(payload);
      }
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnersSlice } = actions;
export const selectPartners = (state: RootState) => state.partners;
export default reducer;
