import { configureStore, ThunkAction } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { Action } from 'redux';
import { api } from './api';
import coursesReducer from './coursesSlice';
import partnerAccessesReducer from './partnerAccessSlice';
import partnerAdminReducer from './partnerAdminSlice';
import partnersReducer from './partnersSlice';
import userReducer from './userSlice';

const initStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      user: userReducer,
      courses: coursesReducer,
      partnerAccesses: partnerAccessesReducer,
      partnerAdmin: partnerAdminReducer,
      partners: partnersReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

export type AppStore = ReturnType<typeof initStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
export type AppDispatch = ReturnType<AppStore['dispatch']>;

export const wrapper = createWrapper<AppStore>(initStore);
