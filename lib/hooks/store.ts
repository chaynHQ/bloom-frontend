import { api } from '@/lib/api';
import type { AppDispatch, AppStore, RootState } from '@/lib/store';
import { clearCoursesSlice } from '@/lib/store/coursesSlice';
import { clearPartnerAccessesSlice } from '@/lib/store/partnerAccessSlice';
import { clearPartnerAdminSlice } from '@/lib/store/partnerAdminSlice';
import { clearUserSlice } from '@/lib/store/userSlice';
import Cookies from 'js-cookie';
import { useCallback } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useTypedSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export const useStateUtils = () => {
  const dispatch: any = useAppDispatch();

  const clearState = useCallback(async () => {
    await dispatch(clearPartnerAccessesSlice());
    await dispatch(clearPartnerAdminSlice());
    await dispatch(clearCoursesSlice());
    await dispatch(clearUserSlice());
    await dispatch(api.util.resetApiState());
    Cookies.remove('referralPartner');
  }, [dispatch]);

  return { clearState };
};
