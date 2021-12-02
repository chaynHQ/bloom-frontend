import type { NextPage } from 'next';

export type AuthNextPage = NextPage & {
  requireAuth: boolean;
};
