'use client';

import { onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
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
import { useCreateEventLogMutation, useGetUserQuery } from '../lib/api';
import { logout } from '../lib/auth';
import { auth } from '../lib/firebase';
import {
  setAuthStateLoading,
  setLoadError,
  setUserLoading,
  setUserToken,
} from '../lib/store/userSlice';
import { getErrorMessage } from '../utils/errorMessage';
import logEvent, { getEventUserData } from '../utils/logEvent';
import { getIsMaintenanceMode } from '../utils/maintenanceMode';
import { useAppDispatch, useStateUtils, useTypedSelector } from './store';

export default function useLoadUser() {
  const dispatch: any = useAppDispatch();
  const isMaintenanceMode = getIsMaintenanceMode();
  const userToken = useTypedSelector((state) => state.user.token);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);
  const { clearState } = useStateUtils();
  const [createEventLog] = useCreateEventLogMutation();
  const [isInvalidUserResourceResponse, setIsInvalidUserResourceResponse] =
    useState<boolean>(false);

  const invalidUserResourceError = 'Invalid user resource success response';
  // 1. Listen for firebase auth state or auth token updated, triggered by firebase auth loaded
  // When a user token is available, set the token in state to be used in request headers
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const token = await firebaseUser?.getIdToken();
      if (token) {
        // User logged in or started a new authenticated session
        await dispatch(setUserToken(token));
        // Trigger call to get user record by changing userLoading state, skip if in maintenance mode
        !isMaintenanceMode && (await dispatch(setUserLoading(true)));
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
  }, [userToken, auth, dispatch, isMaintenanceMode, clearState, createEventLog]);

  // 2. Once firebase auth is complete, get the user database resource
  // skip property prevents the API query being called unless there is a user token and the user is not already set
  const {
    data: userResource,
    isLoading: userResourceIsLoading,
    isSuccess: userResourceIsSuccess,
    error: userResourceError,
  } = useGetUserQuery('', {
    skip: !userToken || !!userAuthLoading || isMaintenanceMode,
  });

  // 3a. Handle get user success
  useEffect(() => {
    if (userResourceIsSuccess) {
      if (!userResource.user?.id) {
        setIsInvalidUserResourceResponse(true);
        return;
      }
      dispatch(setUserLoading(false));

      const eventUserData = getEventUserData(
        userResource.user.createdAt,
        userResource.partnerAccesses,
        userResource.partnerAdmin,
      );
      logEvent(GET_AUTH_USER_SUCCESS, eventUserData);
      logEvent(GET_USER_SUCCESS, eventUserData); // deprecated event
    }
  }, [userResourceIsSuccess, userResource, dispatch]);

  // 3b. Handle get user error
  useEffect(() => {
    const handleLogout = async () => {
      await logout();
    };

    if (userResourceError || isInvalidUserResourceResponse) {
      const errorMessage = userResourceError
        ? getErrorMessage(userResourceError) || 'error'
        : invalidUserResourceError;

      handleLogout();
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
  }, [userResourceError, isInvalidUserResourceResponse, dispatch, auth]);

  return {
    userResourceIsLoading,
    userResourceError: userResourceError
      ? getErrorMessage(userResourceError)
      : isInvalidUserResourceResponse
        ? invalidUserResourceError
        : undefined,
  };
}
