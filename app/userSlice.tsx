import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EMAIL_REMINDERS_FREQUENCY, LANGUAGES } from '../constants/enums';
import { api, GetUserResponse } from './api';
import { PartnerAccesses } from './partnerAccessSlice';

export interface User {
  loading: boolean;
  loadError: string | null;
  token: string | null;
  id: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  firebaseUid: string | null;
  name: string | null;
  email: string | null;
  partnerAccessCode: string | null;
  contactPermission: boolean;
  serviceEmailsPermission: boolean;
  emailRemindersFrequency: EMAIL_REMINDERS_FREQUENCY;
  crispTokenId: string | null;
  signUpLanguage: LANGUAGES | null;
  isSuperAdmin: boolean;
  activeSubscriptions: ActiveSubscription[];
  authStateLoading: boolean;
}

// GetUserDto is the response format of the Get User endpoint
export interface GetUserDto {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    firebaseUid?: string | null;
    contactPermission?: boolean;
    serviceEmailsPermission?: boolean;
    emailRemindersFrequency: EMAIL_REMINDERS_FREQUENCY;
    crispTokenId?: string | null;
    signUpLanguage?: LANGUAGES | null;
    isSuperAdmin?: boolean;
    activeSubscriptions?: ActiveSubscription[];
  };
  partnerAccesses: PartnerAccesses;
}

export interface Subscription {
  subscriptionId: string | null;
  subscriptionName: string | null;
  subscriptionInfo: string | null;
  createdAt: Date | null;
  cancelledAt: Date | null;
  id: string | null;
}

export interface ActiveSubscription extends Subscription {
  cancelledAt: null;
}

export interface Subscriptions extends Array<Subscription> {}

const initialState: User = {
  loading: false,
  loadError: null,
  token: null,
  id: null,
  createdAt: null,
  updatedAt: null,
  firebaseUid: null,
  name: null,
  email: null,
  partnerAccessCode: null,
  contactPermission: false,
  serviceEmailsPermission: true,
  emailRemindersFrequency: EMAIL_REMINDERS_FREQUENCY.NEVER,
  crispTokenId: null,
  signUpLanguage: null,
  isSuperAdmin: false,
  activeSubscriptions: [],
  authStateLoading: true,
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
    setAuthStateLoading(state, action: PayloadAction<boolean>) {
      state.authStateLoading = action.payload;
    },
    setLoadError(state, action: PayloadAction<string>) {
      state.loadError = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      const activeSubscriptions = getActiveSubscriptions(payload);

      return Object.assign({}, state, payload.user, { activeSubscriptions });
    });
    builder.addMatcher(api.endpoints.updateUser.matchFulfilled, (state, { payload }) => {
      return Object.assign({}, state, payload);
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      const activeSubscriptions = getActiveSubscriptions(payload);

      return Object.assign({}, state, payload.user, { activeSubscriptions });
    });
    builder.addMatcher(api.endpoints.subscribeToWhatsapp.matchFulfilled, (state, { payload }) => {
      if (isSubscriptionActive(payload)) {
        state.activeSubscriptions.push(payload);
      }

      return state;
    });
    builder.addMatcher(
      api.endpoints.unsubscribeFromWhatsapp.matchFulfilled,
      (state, { payload }) => {
        state.activeSubscriptions = state.activeSubscriptions.filter(
          (subscription) => subscription.id != payload.id,
        );
        return state;
      },
    );
  },
});

const getActiveSubscriptions = (payload: GetUserResponse): ActiveSubscription[] => {
  if (payload.subscriptions && payload.subscriptions.length > 0) {
    return payload.subscriptions.filter(isSubscriptionActive);
  }
  return [];
};

const isSubscriptionActive = (subscription: Subscription): subscription is ActiveSubscription => {
  return subscription.cancelledAt === null;
};

const { actions, reducer } = slice;
export const { clearUserSlice, setUserToken, setUserLoading, setAuthStateLoading, setLoadError } =
  actions;
export default reducer;
