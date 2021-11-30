import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../store/user';

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
