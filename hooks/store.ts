import { useCallback } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { api } from '../app/api';
import { clearCoursesSlice } from '../app/coursesSlice';
import { clearPartnerAccessesSlice } from '../app/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../app/partnerAdminSlice';
import type { AppDispatch, AppState } from '../app/store';
import { clearUserSlice } from '../app/userSlice';

export const useTypedSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useStateUtils = () => {
  const dispatch: any = useAppDispatch();

  const clearState = useCallback(async () => {
    await dispatch(clearPartnerAccessesSlice());
    await dispatch(clearPartnerAdminSlice());
    await dispatch(clearCoursesSlice());
    await dispatch(clearUserSlice());
    await dispatch(api.util.resetApiState());
  }, [dispatch]);

  return { clearState };
};
