import { createSlice } from '@reduxjs/toolkit';
import { getPartnerContent, Partner } from '../constants/partners';
import { api, GetUserResponse } from './api';
import type { RootState } from './store';

export interface PartnerAdmin {
  id: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  partner: Partner | null;
}

const initialState: PartnerAdmin = {
  id: null,
  createdAt: null,
  updatedAt: null,
  partner: null,
};

const mergeUserPartnerAdminState = (state: PartnerAdmin, payload: GetUserResponse) => {
  if (payload.partnerAdmin.partner) {
    let partnerAdmin: PartnerAdmin = {
      ...payload.partnerAdmin,
    };
    partnerAdmin.partner = Object.assign(
      {},
      partnerAdmin.partner,
      getPartnerContent(payload.partnerAdmin.partner.name), // populate state with static values
    );
    return partnerAdmin;
  }
  return payload.partnerAdmin;
};

const slice = createSlice({
  name: 'partnerAdmin',
  initialState: initialState,
  reducers: {
    clearPartnerAdminSlice: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAdmin) return mergeUserPartnerAdminState(state, payload);
    });

    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAdmin) return mergeUserPartnerAdminState(state, payload);
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnerAdminSlice } = actions;
export const selectPartnerAdmin = (state: RootState) => state.partnerAdmin;
export default reducer;
