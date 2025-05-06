import { ActiveSubscription, Subscriptions } from '@/lib/store/userSlice';

export const findWhatsappSubscription = (
  subs: Subscriptions | null,
): ActiveSubscription | undefined => {
  if (subs && subs.length > 0) {
    return subs
      .filter((sub): sub is ActiveSubscription => sub.cancelledAt === null) // Filter active subscriptions
      .find((sub) => sub.subscriptionName === 'whatsapp');
  }

  return undefined;
};

export const hasWhatsappSubscription = (subs: Subscriptions | null): boolean => {
  return !!findWhatsappSubscription(subs);
};
