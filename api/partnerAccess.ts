import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PartnerAccess } from '../store/partnerAccess';

// Define a service using a base URL and expected endpoints
export const partnerAccessApi = createApi({
  reducerPath: 'partnerAccess',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getPartnerAccess: builder.query<PartnerAccess, string>({
      query: () => `partnerA-acess/me`,
    }),
    validateCode: builder.mutation<PartnerAccess, Partial<PartnerAccess>>({
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
export const { useGetPartnerAccessQuery, useValidateCodeMutation } = partnerAccessApi;
