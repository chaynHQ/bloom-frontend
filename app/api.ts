import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PARTNER_ACCESS_CODE_STATUS } from '../constants/enums';
import { Courses } from './coursesSlice';
import { PartnerAccess, PartnerAccesses } from './partnerAccessSlice';
import { PartnerAdmin } from './partnerAdminSlice';
import { Partner } from './partnerSlice';
import { RootState } from './store';
import { User } from './userSlice';

export interface GetUserResponse {
  user: User;
  partnerAccesses: PartnerAccesses;
  partnerAdmin: PartnerAdmin;
  courses: Courses;
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
    getPartner: builder.query<Partner, string>({
      query: (name) => ({ url: `partner/${name}` }),
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
    addPartnerAccess: builder.mutation<PartnerAccess, Partial<PartnerAccess>>({
      query(body) {
        return {
          url: 'partner-access',
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
  useAddPartnerAccessMutation,
  useValidateCodeMutation,
} = api;
