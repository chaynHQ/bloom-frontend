import { configureStore, ThunkAction } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { Action } from 'redux';
import { api } from './api';
import currentReducer from './currentSlice';
import partnerAccessReducer from './partnerAccessSlice';
import partnerAdminReducer from './partnerAdminSlice';
import partnerReducer from './partnerSlice';
import userReducer from './userSlice';

const initStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      user: userReducer,
      partnerAccess: partnerAccessReducer,
      partnerAdmin: partnerAdminReducer,
      partner: partnerReducer,
      current: currentReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

export type AppStore = ReturnType<typeof initStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
export type AppDispatch = ReturnType<AppStore['dispatch']>;

export const wrapper = createWrapper<AppStore>(initStore);
