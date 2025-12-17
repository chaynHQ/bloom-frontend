'use client';

import { useCreateEventLogMutation, useGetUserQuery } from '@/lib/api';
import { logout } from '@/lib/auth';
import { EVENT_LOG_NAME } from '@/lib/constants/enums';
import {
  GET_AUTH_USER_REQUEST,
  GET_AUTH_USER_SUCCESS,
  GET_USER_ERROR,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  LOGOUT_FORCED,
  LOGOUT_SUCCESS,
} from '@/lib/constants/events';
import { auth } from '@/lib/firebase';
import {
  setAuthStateLoading,
  setLoadError,
  setUserLoading,
  setUserMFAisSetup,
  setUserToken,
  setUserVerifiedEmail,
} from '@/lib/store/userSlice';
import { getErrorMessage } from '@/lib/utils/errorMessage';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { getIsMaintenanceMode } from '@/lib/utils/maintenanceMode';
import { sendGAEvent } from '@next/third-parties/google';
import { useRollbar } from '@rollbar/react';
import { onIdTokenChanged } from 'firebase/auth';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useStateUtils, useTypedSelector } from './store';

export default function useLoadUser() {
  const dispatch: any = useAppDispatch();
  const isMaintenanceMode = getIsMaintenanceMode();
  const userToken = useTypedSelector((state) => state.user.token);
  const userAuthLoading = useTypedSelector((state) => state.user.authStateLoading);

  const [createEventLog] = useCreateEventLogMutation();

  const rollbar = useRollbar();
  const { clearState } = useStateUtils();

  const invalidUserResourceError = 'Invalid user resource success response';
  // 1. Listen for firebase auth state or auth token updated, triggered by firebase auth loaded
  // When a user token is available, set the token in state to be used in request headers
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      logEvent(GET_AUTH_USER_REQUEST);

      const token = await firebaseUser?.getIdTokenResult();
      if (token) {
        // User logged in or started a new authenticated session
        await dispatch(setUserToken(token.token));
        await dispatch(setUserVerifiedEmail(firebaseUser?.emailVerified ?? false));
        await dispatch(setUserMFAisSetup(!!token.signInSecondFactor));
        // Trigger call to get user record by changing userLoading state, skip if in maintenance mode
        !isMaintenanceMode && (await dispatch(setUserLoading(true)));
        logEvent(GET_AUTH_USER_SUCCESS);
        logEvent(GET_USER_REQUEST);
      } else if (!firebaseUser && userToken) {
        // User logged out or token was removed, clear state
        createEventLog({ event: EVENT_LOG_NAME.LOGGED_OUT });
        logEvent(LOGOUT_SUCCESS);
        await clearState();
      }
      await dispatch(setAuthStateLoading(false)); // triggers step 2
    });
    return () => unsubscribe();
  }, [userToken, dispatch, isMaintenanceMode, clearState, createEventLog]);

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

  // Derive if the user resource response is invalid (success but missing user ID)
  const isInvalidUserResourceResponse = useMemo(
    () => userResourceIsSuccess && !userResource?.user?.id,
    [userResourceIsSuccess, userResource?.user?.id],
  );

  // 3a. Handle get user success
  useEffect(() => {
    if (userResourceIsSuccess && userResource?.user?.id) {
      dispatch(setUserLoading(false));

      // Sets GA user data on global scope https://developers.google.com/tag-platform/gtagjs/reference
      sendGAEvent(
        'set',
        getEventUserData(
          userResource.user.createdAt,
          userResource.partnerAccesses,
          userResource.partnerAdmin,
        ),
      );

      logEvent(GET_USER_SUCCESS);
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

      rollbar.error('useLoadUser error: failed to get user resource -', userResourceError);
      logEvent(GET_USER_ERROR, { message: errorMessage });
      logEvent(LOGOUT_FORCED);
    }
  }, [userResourceError, isInvalidUserResourceResponse, dispatch, rollbar]);

  return {
    userResourceIsLoading,
    userResourceError: userResourceError
      ? getErrorMessage(userResourceError)
      : isInvalidUserResourceResponse
        ? invalidUserResourceError
        : undefined,
  };
}
