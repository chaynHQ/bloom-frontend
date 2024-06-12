'use client';

import { skipToken } from '@reduxjs/toolkit/query/react';
import { getAuth, onIdTokenChanged, signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { useGetUserQuery } from '../app/api';
import { setAuthStateLoading, setLoadError, setUserLoading, setUserToken } from '../app/userSlice';
import {
  GET_AUTH_USER_ERROR,
  GET_AUTH_USER_SUCCESS,
  GET_USER_ERROR,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  LOGOUT_FORCED,
  LOGOUT_SUCCESS,
} from '../constants/events';
import { getErrorMessage } from '../utils/errorMessage';
import logEvent, { getEventUserResponseData } from '../utils/logEvent';
import { useAppDispatch, useStateUtils, useTypedSelector } from './store';

export default function useLoadUser() {
  const auth = getAuth();
  const dispatch: any = useAppDispatch();
  const user = useTypedSelector((state) => state.user);
  const { clearState } = useStateUtils();

  // 1. Listen for firebase auth state or auth token updated, triggered by firebase auth loaded
  // When a user token is available, set the token in state to be used in request headers
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const token = await firebaseUser?.getIdToken();
      if (token) {
        // User logged in or started a new authenticated session
        await dispatch(setUserToken(token));
        await dispatch(setUserLoading(true));
        logEvent(GET_USER_REQUEST); // deprecated event
      } else if (!firebaseUser && user.token) {
        // User logged out or token was removed, clear state
        await clearState();
        logEvent(LOGOUT_SUCCESS);
      }
      await dispatch(setAuthStateLoading(false)); // triggers step 2
    });
    return () => unsubscribe();
  }, [user.token, auth, dispatch, clearState]);

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
    if (userResourceError) {
      const errorMessage = getErrorMessage(userResourceError) || 'error';
      signOut(auth);
      dispatch(setLoadError(errorMessage));
      dispatch(setUserLoading(false));

      (window as any).Rollbar?.error(
        'useLoadUser error: failed to get user resource -',
        userResourceError,
      );
      logEvent(GET_AUTH_USER_ERROR, { errorMessage });
      logEvent(GET_USER_ERROR, { message: errorMessage }); // deprecated event
      logEvent(LOGOUT_FORCED);
    }
  }, [userResourceError, dispatch, auth]);

  return {
    user,
    userResourceIsLoading,
    userResourceError,
  };
}
