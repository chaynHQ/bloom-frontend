'use server';

import { API_URL, PARTNERS_CACHE_TAG } from '@/lib/constants/common';
import { revalidateTag } from 'next/cache';

// Refreshes the cached partner sets after a super admin changes a partner. Server actions are
// public endpoints, so the caller's token is checked with the backend first.
export async function revalidatePartners(token: string) {
  if (!token) throw new Error('Missing token');

  const response = await fetch(`${API_URL}/user/me`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`GET user/me failed with ${response.status}`);

  const { user } = await response.json();
  if (!user?.isSuperAdmin) throw new Error('Not a super admin');

  revalidateTag(PARTNERS_CACHE_TAG, { expire: 0 });
}
