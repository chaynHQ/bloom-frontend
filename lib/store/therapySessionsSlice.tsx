import { api } from '@/lib/api';
import { SIMPLYBOOK_ACTION_ENUM } from '@/lib/constants/enums';
import { createSlice } from '@reduxjs/toolkit';

export interface TherapySession {
  id?: string;
  action?: SIMPLYBOOK_ACTION_ENUM;
  clientTimezone?: string;
  serviceName?: string;
  serviceProviderName?: string;
  startDateDime?: Date;
  endDateDime?: Date;
  cancelledAt?: Date;
  rescheduledFrom?: Date;
  completedAt?: Date;
  partnerAccessId?: string;
}

export interface TherapySessions extends Array<TherapySession> {}

const initialState: TherapySessions = [];

const slice = createSlice({
  name: 'therapySessions',
  initialState: initialState,
  reducers: {
    clearTherapySessionsSlice: (state) => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getTherapySessions.matchFulfilled, (state, { payload }) => {
      return payload;
    });
  },
});

const { actions, reducer } = slice;

export const { clearTherapySessionsSlice } = actions;

export default reducer;
