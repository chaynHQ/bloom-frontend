'use client';

import { createContext, ReactNode, useContext } from 'react';
import { findPartner } from './resolve';
import type { BrandedPartner, PartnerSets } from './types';

const PartnersContext = createContext<PartnerSets | null>(null);

export function PartnersProvider({
  partners,
  children,
}: {
  partners: PartnerSets;
  children: ReactNode;
}) {
  return <PartnersContext.Provider value={partners}>{children}</PartnersContext.Provider>;
}

// No empty default: rendering without the loaded sets would silently drop partners.
function usePartnerSets(): PartnerSets {
  const partners = useContext(PartnersContext);
  if (!partners) throw new Error('Partner hooks must be used inside PartnersProvider');
  return partners;
}

export function useBrandedPartners(): BrandedPartner[] {
  return usePartnerSets().branded;
}

export function useLaunchedPartners(): BrandedPartner[] {
  return usePartnerSets().launched;
}

// For members and partner admins, whose partner comes from the backend by name.
export function usePartner(name?: string | null): BrandedPartner | undefined {
  return findPartner(useBrandedPartners(), name);
}
