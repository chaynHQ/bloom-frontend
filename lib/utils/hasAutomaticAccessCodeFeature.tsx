import { Partner } from '@/lib/store/partnersSlice';

export default function hasAutomaticAccessFeature(partner: Partner): boolean {
  return partner.partnerFeature.reduce<boolean>(
    (hasFeature, pf) => hasFeature || (pf.feature.name === 'AUTOMATIC_ACCESS_CODE' && pf.active),
    false,
  );
}
