import { Partner } from '../app/partnersSlice';
import { FEATURES } from '../constants/enums';

export default function hasAutomaticAccessFeature(partner: Partner): boolean {
  return partner.partnerFeature.reduce(
    (hasFeature, pf) =>
      hasFeature || (pf.feature.name === FEATURES.AUTOMATIC_ACCESS_CODE && pf.active),
    false,
  );
}
