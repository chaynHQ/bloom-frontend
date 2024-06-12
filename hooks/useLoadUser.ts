'use client';

import { skipToken } from '@reduxjs/toolkit/query/react';
import { getAuth, onIdTokenChanged, signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { api, useGetUserQuery } from '../app/api';
import { clearCoursesSlice } from '../app/coursesSlice';
import { clearPartnerAccessesSlice } from '../app/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../app/partnerAdminSlice';
import {
  clearUserSlice,
  setAuthStateLoading,
  setLoadError,
  setUserLoading,
  setUserToken,
} from '../app/userSlice';
import {
  GET_AUTH_USER_ERROR,
  GET_AUTH_USER_SUCCESS,
  GET_USER_ERROR,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
} from '../constants/events';
import { getErrorMessage } from '../utils/errorMessage';
import logEvent, { getEventUserResponseData } from '../utils/logEvent';
import { useAppDispatch, useTypedSelector } from './store';

export default function useLoadUser() {
  const auth = getAuth();
  const dispatch: any = useAppDispatch();
  const user = useTypedSelector((state) => state.user);

  // 1. Listen for firebase auth state or auth token updated, triggered by firebase auth loaded
  // When a user token is available, set the token in state to be used in request headers
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      const token = await user?.getIdToken();
      if (token) {
        await dispatch(setUserToken(token));
        await dispatch(setUserLoading(true));
        logEvent(GET_USER_REQUEST); // deprecated event
      }
      await dispatch(setAuthStateLoading(false)); // triggers step 2
    });
    return () => unsubscribe();
  }, [auth, dispatch]);

  // 2. Once firebase auth is complete, get the user database resource
  // skipToken prevents the API query being called unless there is a user token and the user is not already set
  const {
    data: userResource,
    isLoading: userResourceIsLoading,
    isSuccess: userResourceIsSuccess,
    error: userResourceError,
  } = useGetUserQuery(user.id || !user.token || user.authStateLoading ? skipToken : '');

  // 3a. Handle get user success
  useEffect(() => {
    if (userResourceIsSuccess && userResource.user.id) {
      dispatch(setUserLoading(false));

      const eventUserData = getEventUserResponseData(userResource);
      logEvent(GET_AUTH_USER_SUCCESS, eventUserData);
      logEvent(GET_USER_SUCCESS, eventUserData); // deprecated event
    }
  }, [userResourceIsSuccess, userResource, dispatch]);

  // 3b. Handle get user error
  useEffect(() => {
    const logoutUser = async () => {
      signOut(auth);
      await dispatch(clearPartnerAccessesSlice());
      await dispatch(clearPartnerAdminSlice());
      await dispatch(clearCoursesSlice());
      await dispatch(clearUserSlice());
      await dispatch(api.util.resetApiState());
    };

    if (userResourceError) {
      (window as any).Rollbar?.error(
        'useLoadUser error: failed to get user resource -',
        userResourceError,
      );
      const errorMessage = getErrorMessage(userResourceError) || 'error';
      logEvent(GET_AUTH_USER_ERROR, { errorMessage });
      logEvent(GET_USER_ERROR, { message: errorMessage }); // deprecated event
      logoutUser();
      dispatch(setLoadError(errorMessage));
      dispatch(setUserLoading(false));
    }
  }, [userResourceError, dispatch, auth]);

  return {
    user,
    userResourceIsLoading,
    userResourceError,
  };
}
