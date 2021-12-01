import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LANGUAGES } from '../common/constants';

export type User = {
  id: string | null;
  firebaseUid: string | null;
  name: string | null;
  email: string | null;
  partnerAccessCode: string | null;
  languageDefault: LANGUAGES;
  contactPermission: boolean;
};

// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: 'user',
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
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserQuery, useAddUserMutation } = userApi;
