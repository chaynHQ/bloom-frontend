import { createSlice } from '@reduxjs/toolkit';
import { api } from './api';
import type { RootState } from './store';

export interface PartnerAdmin {
  id: string | null;
  userId: string | null;
  partnerId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const initialState: PartnerAdmin = {
  id: null,
  userId: null,
  partnerId: null,
  createdAt: null,
  updatedAt: null,
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
      return payload.partnerAdmin;
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return payload.partnerAdmin;
    });
  },
});

const { actions, reducer } = slice;
export const { clearPartnerAdminSlice } = actions;
export const selectPartnerAdmin = (state: RootState) => state.partnerAdmin;
export default reducer;
