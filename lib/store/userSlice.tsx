import { api, GetUserResponse } from '@/lib/api';
import { EMAIL_REMINDERS_FREQUENCY, LANGUAGES } from '@/lib/constants/enums';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PartnerAccesses } from './partnerAccessSlice';
import { PartnerAdmin } from './partnerAdminSlice';

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
  emailRemindersFrequency: EMAIL_REMINDERS_FREQUENCY | null;
  crispTokenId: string | null;
  signUpLanguage: LANGUAGES | null;
  isSuperAdmin: boolean;
  verifiedEmail: boolean;
  MFAisSetup: boolean;
  authStateLoading: boolean;
  entryPartnerAccessCode: string | null;
  entryPartnerReferral: string | null;
  cookiesAccepted: boolean;
  pwaDismissed: boolean;
}

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
    emailRemindersFrequency: EMAIL_REMINDERS_FREQUENCY | null;
    crispTokenId?: string | null;
    signUpLanguage?: LANGUAGES | null;
    isSuperAdmin?: boolean;
  };
  partnerAccesses: PartnerAccesses;
  partnerAdmin?: PartnerAdmin;
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
  emailRemindersFrequency: null,
  crispTokenId: null,
  signUpLanguage: null,
  isSuperAdmin: false,
  verifiedEmail: false,
  MFAisSetup: false,
  authStateLoading: true,
  entryPartnerAccessCode: null,
  entryPartnerReferral: null,
  cookiesAccepted: false,
  pwaDismissed: false,
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
    setCookiesAccepted(state, action: PayloadAction<boolean>) {
      state.cookiesAccepted = action.payload;
    },
    setEntryPartnerReferral(state, action: PayloadAction<string>) {
      state.entryPartnerReferral = action.payload;
    },
    setEntryPartnerAccessCode(state, action: PayloadAction<string>) {
      state.entryPartnerAccessCode = action.payload;
    },
    setUserLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setUserVerifiedEmail(state, action: PayloadAction<boolean>) {
      state.verifiedEmail = action.payload;
    },
    setUserMFAisSetup(state, action: PayloadAction<boolean>) {
      state.MFAisSetup = action.payload;
    },
    setAuthStateLoading(state, action: PayloadAction<boolean>) {
      state.authStateLoading = action.payload;
    },
    setLoadError(state, action: PayloadAction<string>) {
      state.loadError = action.payload;
    },
    setPwaDismissed(state, action: PayloadAction<boolean>) {
      state.pwaDismissed = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.addUser.matchFulfilled, (state, { payload }) => {
      return Object.assign({}, state, payload.user);
    });
    builder.addMatcher(api.endpoints.updateUser.matchFulfilled, (state, { payload }) => {
      return Object.assign({}, state, payload);
    });
    builder.addMatcher(api.endpoints.getUser.matchFulfilled, (state, { payload }) => {
      return Object.assign({}, state, payload.user);
    });
    builder.addMatcher(api.endpoints.subscribeToWhatsapp.matchFulfilled, (state, { payload }) => {
      // Remove logic for managing subscriptions here
    });
    builder.addMatcher(
      api.endpoints.unsubscribeFromWhatsapp.matchFulfilled,
      (state, { payload }) => {
        return state;
      },
    );
  },
});

const { actions, reducer } = slice;
export const {
  clearUserSlice,
  setUserToken,
  setUserLoading,
  setAuthStateLoading,
  setCookiesAccepted,
  setLoadError,
  setEntryPartnerAccessCode,
  setEntryPartnerReferral,
  setUserVerifiedEmail,
  setUserMFAisSetup,
  setPwaDismissed,
} = actions;
export default reducer;
