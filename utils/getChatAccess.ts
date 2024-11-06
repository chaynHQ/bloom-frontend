import { Dispatch, SetStateAction } from 'react';
import { PartnerAccesses } from '../store/partnerAccessSlice';
import { PartnerAdmin } from '../store/partnerAdminSlice';

export const getChatAccess = (
  partnerAccesses: PartnerAccesses,
  setLiveChatAccess: Dispatch<SetStateAction<boolean>>,
  partnerAdmin: PartnerAdmin,
) => {
  const liveCourseAccess = partnerAccesses.length === 0 && !partnerAdmin.id;
  const liveAccess = partnerAccesses.find((partnerAccess) => partnerAccess.featureLiveChat);
  if (liveAccess || liveCourseAccess) setLiveChatAccess(true);
};
