import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { clearCoursesSlice } from '../app/coursesSlice';
import { clearPartnerAccessesSlice } from '../app/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../app/partnerAdminSlice';
import type { AppDispatch, RootState } from '../app/store';
import { clearUserSlice } from '../app/userSlice';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const clearStore = async () => {
  await clearPartnerAccessesSlice();
  await clearPartnerAdminSlice();
  await clearCoursesSlice();
  await clearUserSlice();
};
