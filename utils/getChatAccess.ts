import { Dispatch, SetStateAction } from 'react';
import { PartnerAccesses } from '../lib/store/partnerAccessSlice';

export const getChatAccess = (
  partnerAccesses: PartnerAccesses,
  setLiveChatAccess: Dispatch<SetStateAction<boolean>>,
) => {
  const liveAccess = partnerAccesses.find((partnerAccess) => partnerAccess.featureLiveChat);
  if (liveAccess) setLiveChatAccess(true);
};
