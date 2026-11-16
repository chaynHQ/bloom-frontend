import { api } from '@/lib/api';
import { createSlice } from '@reduxjs/toolkit';
import { Partner } from './partnersSlice';

export interface PartnerAdmin {
  id: string | null;
  active: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  partner: Partner | null;
}

const initialState: PartnerAdmin = {
  id: null,
  active: null,
  createdAt: null,
  updatedAt: null,
  partner: null,
};

const slice = createSlice({
  name: 'partnerAdmin',
  initialState: initialState,
  reducers: {
    clearPartnerAdminSlice: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAdmin) return payload.partnerAdmin;
    });

    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      if (payload.partnerAdmin) return payload.partnerAdmin;
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnerAdminSlice } = actions;
export default reducer;
