import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { api } from './api';
import coursesReducer from './coursesSlice';
import partnerAccessesReducer from './partnerAccessSlice';
import partnerAdminReducer from './partnerAdminSlice';
import partnersReducer from './partnersSlice';
import userReducer from './userSlice';

const makeStore = () =>
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


export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);
