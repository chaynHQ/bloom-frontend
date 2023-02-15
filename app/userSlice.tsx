import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LANGUAGES } from '../constants/enums';
import { api, GetUserResponse } from './api';
import type { RootState } from './store';

export interface User {
  loading: boolean;
  token: string | null;
  id: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  firebaseUid: string | null;
  name: string | null;
  email: string | null;
  partnerAccessCode: string | null;
  contactPermission: boolean;
  crispTokenId: string | null;
  signUpLanguage: LANGUAGES | null;
  isSuperAdmin: boolean;
  activeSubscriptions: Subscription[] | null;
}

export interface Subscription {
  subscriptionId: string | null;
  subscriptionName: string | null;
  subscriptionInfo: string | null;
  createdAt: Date | null;
  cancelledAt: Date | null;
  id: string | null;
}

export interface Subscriptions extends Array<Subscription> {}

const initialState: User = {
  loading: true,
  token: null,
  id: null,
  createdAt: null,
  updatedAt: null,
  firebaseUid: null,
  name: null,
  email: null,
  partnerAccessCode: null,
  contactPermission: false,
  crispTokenId: null,
  signUpLanguage: null,
  isSuperAdmin: false,
  activeSubscriptions: null,
};

const slice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    clearUserSlice: (state) => {
      return initialState;
    },
    setUserToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setUserLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      const activeSubscriptions = getActiveSubscriptions(payload);

      return Object.assign({}, state, payload.user, { activeSubscriptions });
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      const activeSubscriptions = getActiveSubscriptions(payload);

      return Object.assign({}, state, payload.user, { activeSubscriptions });
    });
    builder.addMatcher(api.endpoints.subscribeToWhatsapp.matchFulfilled, (state, { payload }) => {
      /**
       * Note that currently there is only one type of subscription available i.e. whatsapp.
       * On top of that, only one whatsapp subscription is allowed per user.
       * Taken together, this means a user can only have one active subscription at any time so the previous state
       * does not need to be taken into account.
       *
       * The following code will need to change if other types of subscriptions are added. */
      return Object.assign({}, state, { activeSubscriptions: [payload] });
    });
    builder.addMatcher(
      api.endpoints.unsubscribeFromWhatsapp.matchFulfilled,
      (state, { payload }) => {
        /**
         * Note that currently there is only one type of subscription available i.e. whatsapp.
         * On top of that, only one whatsapp subscription is allowed per user.
         * Taken together, this means once a user has unsubscribed from whatsapp, a user will have no other active subscriptions.
         *
         * The following code will need to change if other types of subscriptions are added. */
        return Object.assign({}, state, { activeSubscriptions: [] });
      },
    );
  },
});

const getActiveSubscriptions = (payload: GetUserResponse) => {
  if (payload.subscriptions && payload.subscriptions.length > 0) {
    return payload.subscriptions.filter((subs) => subs.cancelledAt === null);
  }
  return null;
};

const { actions, reducer } = slice;
export const { clearUserSlice, setUserToken, setUserLoading } = actions;
export const selectCurrentUser = (state: RootState) => state.user;
export default reducer;
