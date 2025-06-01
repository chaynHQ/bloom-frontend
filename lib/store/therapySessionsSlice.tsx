import { api } from '@/lib/api';
import { SIMPLYBOOK_ACTION_ENUM } from '@/lib/constants/enums';
import { createSlice } from '@reduxjs/toolkit';

export interface TherapySession {
  id?: string;
  action?: SIMPLYBOOK_ACTION_ENUM;
  clientTimezone?: string;
  serviceName?: string;
  serviceProviderName?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  cancelledAt?: Date;
  rescheduledFrom?: Date;
  completedAt?: Date;
  partnerAccessId?: string;
}

export interface TherapySessions extends Array<TherapySession> {}

const initialState: TherapySessions = [];

const mergeUpdatedTherapySessions = (state: TherapySessions, payload: TherapySession) => {
  const therapySession = state.filter((session) => session.id === payload.id);

  if (therapySession) {
    return state.map((session) =>
      session.id === payload.id ? { ...session, ...payload } : session,
    );
  }

  return [...state, payload];
};

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
    builder.addMatcher(api.endpoints.cancelTherapySession.matchFulfilled, (state, { payload }) => {
      return mergeUpdatedTherapySessions(state, payload);
    });
  },
});

const { actions, reducer } = slice;

export const { clearTherapySessionsSlice } = actions;

export default reducer;
