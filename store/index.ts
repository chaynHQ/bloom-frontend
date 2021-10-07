import { configureStore, ThunkAction } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { Action } from 'redux';
import exampleReducer from './example';

const initStore = () =>
  configureStore({
    reducer: {
      example: exampleReducer,
    },
    devTools: true,
  });

export type AppStore = ReturnType<typeof initStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(initStore);
