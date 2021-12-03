import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PARTNER_ACCESS_CODE_STATUS } from '../common/constants';
import { PartnerAccess } from './partnerAccessSlice';
import { Partner } from './partnerSlice';
import { RootState } from './store';
import { User } from './userSlice';

interface GetUserResponse {
  user: User;
  partnerAccess: PartnerAccess;
  partner: Partner;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token || localStorage.getItem('accessToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUser: builder.mutation<GetUserResponse, string>({
      query(body) {
        return {
          url: 'user/me',
          method: 'POST',
          body,
        };
      },
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
      | { status: PARTNER_ACCESS_CODE_STATUS }
      | { error: { data: { statusCode: number; message: string } } },
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

export const {
  useGetUserMutation,
  useAddUserMutation,
  useGetPartnerAccessQuery,
  useValidateCodeMutation,
} = api;
