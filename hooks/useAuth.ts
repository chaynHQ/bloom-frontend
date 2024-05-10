import { signOut, getAuth } from "firebase/auth";
import { useAppDispatch } from "./store";
import { clearPartnerAccessesSlice } from "../app/partnerAccessSlice";
import { clearPartnerAdminSlice } from "../app/partnerAdminSlice";
import { clearCoursesSlice } from "../app/coursesSlice";
import { clearUserSlice } from "../app/userSlice";
import { api } from "../app/api";
import { useCallback } from "react";

const useAuth = () => {
  const auth = getAuth()
  const dispatch: any = useAppDispatch()

  const onLogout = useCallback(async () => {
    signOut(auth);
    await dispatch(clearPartnerAccessesSlice());
    await dispatch(clearPartnerAdminSlice());
    await dispatch(clearCoursesSlice());
    await dispatch(clearUserSlice());
    await dispatch(api.util.resetApiState());
  }, [auth, dispatch])

  return { onLogout }
}

export default useAuth
