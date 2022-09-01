import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

enum Environment {
  PRODUCTION = 'production',
  LOCAL = 'local',
  STAGING = 'staging',
}

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const environments = [Environment.STAGING, Environment.PRODUCTION];
  const currentEnv = process.env.NEXT_PUBLIC_ENV as Environment;

  if (environments.includes(currentEnv) && req.headers.get('x-forwarded-proto') !== 'https') {
    const hostname = req.headers.get('host') || req.nextUrl.hostname;
    return NextResponse.redirect(`https://${hostname}${req.nextUrl.pathname}`, 301);
  }
  return NextResponse.next();
}
