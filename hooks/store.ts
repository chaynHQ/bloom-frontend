import { useCallback } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { api } from '../store/api';
import { clearCoursesSlice } from '../store/coursesSlice';
import { clearPartnerAccessesSlice } from '../store/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../store/partnerAdminSlice';
import type { AppDispatch, AppState } from '../store/store';
import { clearUserSlice } from '../store/userSlice';

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
