import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LANGUAGES, PARTNER_ACCESS_CODE_STATUS } from '../common/constants';

export type User = {
  id: string | null;
  firebaseUid: string | null;
  name: string | null;
  email: string | null;
  partnerAccessCode: string | null;
  languageDefault: LANGUAGES;
  contactPermission: boolean;
};

export type PartnerAccess = {
  id: string | null;
  activatedAt: Date | null;
  featureLiveChat: boolean | null;
  featureTherapy: boolean | null;
  partnerAccessCode: string | null;
  therapySessionsRemaining: number | null;
  therapySessionsRedeemed: number | null;
};

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: () => `user/me`,
    }),
    addUser: builder.mutation<User, Partial<User>>({
      query(body) {
        return {
          url: `user`,
          method: 'POST',
          body,
        };
      },
    }),
    getPartnerAccess: builder.query<PartnerAccess, string>({
      query: () => `partner-access/me`,
    }),
    validateCode: builder.mutation<
      { status: PARTNER_ACCESS_CODE_STATUS },
      { partnerAccessCode: string }
    >({
      query(body) {
        return {
          url: `partner-access/validate-code`,
          method: 'POST',
          body,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetPartnerAccessQuery,
  useValidateCodeMutation,
  useGetUserQuery,
  useAddUserMutation,
} = api;

export default api;
