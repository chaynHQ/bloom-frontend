import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import coursesReducer from './store/coursesSlice';
import partnerAccessesReducer from './store/partnerAccessSlice';
import partnerAdminReducer from './store/partnerAdminSlice';
import partnersReducer from './store/partnersSlice';
import resourceReducer from './store/resourcesSlice';
import therapySessionsReducer from './store/therapySessionsSlice';
import userReducer from './store/userSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      user: userReducer,
      courses: coursesReducer,
      partnerAccesses: partnerAccessesReducer,
      partnerAdmin: partnerAdminReducer,
      partners: partnersReducer,
      resources: resourceReducer,
      therapySessions: therapySessionsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
