import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PARTNER_ACCESS_CODE_STATUS } from '../common/constants';
import { PartnerAccess } from './partnerAccessSlice';
import { RootState } from './store';
import { User } from './userSlice';

interface GetUserResponse {
  user: User;
  partnerAccess: PartnerAccess;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: () => 'user/me',
    }),
    addUser: builder.mutation<GetUserResponse, Partial<User>>({
      query(body) {
        return {
          url: 'user',
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
    // login: builder.mutation<UserResponse, LoginRequest>({
    //   query: (credentials) => ({
    //     url: 'login',
    //     method: 'POST',
    //     body: credentials,
    //   }),
    // }),
    protected: builder.mutation<{ message: string }, void>({
      query: () => 'protected',
    }),
  }),
});

export const {
  useGetUserQuery,
  useAddUserMutation,
  useGetPartnerAccessQuery,
  useValidateCodeMutation,
} = api;
