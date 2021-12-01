import { configureStore, ThunkAction } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { Action } from 'redux';
import { partnerAccessApi } from './partnerAccess';
import { userApi } from './user';

const initStore = () =>
  configureStore({
    reducer: {
      [userApi.reducerPath]: userApi.reducer,
      [partnerAccessApi.reducerPath]: partnerAccessApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(userApi.middleware, partnerAccessApi.middleware),
    devTools: true,
  });

export type AppStore = ReturnType<typeof initStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;
export type AppDispatch = ReturnType<AppStore['dispatch']>;

export const wrapper = createWrapper<AppStore>(initStore);
