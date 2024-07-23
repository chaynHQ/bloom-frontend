import { createSlice } from '@reduxjs/toolkit';
import { getPartnerContent, PartnerContent } from '../constants/partners';
import { api, GetUserResponse } from './api';

export interface PartnerAdmin {
  id: string | null;
  active: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  partner: PartnerContent | null;
}

const initialState: PartnerAdmin = {
  id: null,
  active: null,
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
      // This uses hard coded date from frontend rather than from backend.
      // in future we can get live data from backend
      getPartnerContent(payload.partnerAdmin.partner.name),
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
      return initialState;
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
export default reducer;
