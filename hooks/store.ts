import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { clearPartnerAccessesSlice } from '../app/partnerAccessSlice';
import { clearPartnerAdminSlice } from '../app/partnerAdminSlice';
import { clearPartnerSlice } from '../app/partnerSlice';
import type { AppDispatch, RootState } from '../app/store';
import { clearUserSlice } from '../app/userSlice';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const clearStore = async () => {
  clearPartnerAccessesSlice();
  clearPartnerAdminSlice();
  clearPartnerSlice();
  clearUserSlice();
};
