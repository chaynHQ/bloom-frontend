import { ActiveSubscription } from '@/lib/store/userSlice';

export const findWhatsappSubscription = (
  subs: ActiveSubscription[] | null,
): ActiveSubscription | undefined => {
  if (subs && subs.length > 0) {
    return subs.find((sub) => sub.subscriptionName === 'whatsapp');
  }

  return undefined;
};

export const hasWhatsappSubscription = (subs: ActiveSubscription[] | null): boolean => {
  return !!findWhatsappSubscription(subs);
};
