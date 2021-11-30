import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

// declaring the types for our state
export type PartnerAccess = {
  id: string | null;
  activatedAt: Date | null;
  featureLiveChat: boolean | null;
  featureTherapy: boolean | null;
  code: string | null;
  therapySessionsRemaining: number | null;
  therapySessionsRedeemed: number | null;
};

const initialState: PartnerAccess = {
  id: null,
  activatedAt: null,
  featureLiveChat: false,
  featureTherapy: false,
  code: null,
  therapySessionsRemaining: null,
  therapySessionsRedeemed: null,
};

export const PartnerAccessSlice = createSlice({
  name: 'partnerAccess',

  initialState,

  reducers: {},

  extraReducers: {
    [HYDRATE]: (state, action) => {
      console.log('HYDRATE', state, action.payload);
      return {
        ...state,
        ...action.payload.partnerAccess,
      };
    },
  },
});

export default PartnerAccessSlice.reducer;
