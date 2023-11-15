import { current } from '@reduxjs/toolkit';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { ENVIRONMENT } from './constants/enums';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const environments = [ENVIRONMENT.STAGING, ENVIRONMENT.PRODUCTION];
  const currentEnv = process.env.NEXT_PUBLIC_ENV as ENVIRONMENT;
  if (environments.includes(currentEnv) && req.headers.get('x-forwarded-proto') !== 'https') {
    // Hack to overcome issues in next routing
    const hostname = process.env.NEXT_PUBLIC_BASE_URL
    const locale = req.nextUrl.locale === 'en' ? '' : `/${req.nextUrl.locale}`
    return NextResponse.redirect(`${hostname}${locale}${req.nextUrl.pathname}`, 307);
  }
  return NextResponse.next();
}
