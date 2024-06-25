'use client';

import { getAuth, onIdTokenChanged, signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { useCreateEventLogMutation, useGetUserQuery } from '../app/api';
import { setAuthStateLoading, setLoadError, setUserLoading, setUserToken } from '../app/userSlice';
import { EVENT_LOG_NAME } from '../constants/enums';
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
  const userToken = useTypedSelector((state) => state.user.token);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);
  const { clearState } = useStateUtils();
  const [createEventLog] = useCreateEventLogMutation();

  // 1. Listen for firebase auth state or auth token updated, triggered by firebase auth loaded
  // When a user token is available, set the token in state to be used in request headers
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const token = await firebaseUser?.getIdToken();
      if (token) {
        // User logged in or started a new authenticated session - state changes trigger call to get user record
        await dispatch(setUserToken(token));
        await dispatch(setUserLoading(true));
        logEvent(GET_USER_REQUEST); // deprecated event
      } else if (!firebaseUser && userToken) {
        // User logged out or token was removed, clear state
        createEventLog({ event: EVENT_LOG_NAME.LOGGED_OUT });
        logEvent(LOGOUT_SUCCESS);
        await clearState();
      }
      await dispatch(setAuthStateLoading(false)); // triggers step 2
    });
    return () => unsubscribe();
  }, [userToken, auth, dispatch, clearState, createEventLog]);

  // 2. Once firebase auth is complete, get the user database resource
  // skip property prevents the API query being called unless there is a user token and the user is not already set
  const {
    data: userResource,
    isLoading: userResourceIsLoading,
    isSuccess: userResourceIsSuccess,
    error: userResourceError,
  } = useGetUserQuery('', {
    skip: !userToken || !!userAuthLoading,
  });

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
    userResourceIsLoading,
    userResourceError,
  };
}
