import { JSXElementConstructor, ReactElement, ReactNode } from 'react';

// Always use BASE_URL const instead of NEXT_PUBLIC_BASE_URL
// Dynamic vercel preview branches have random wildcard subdomains
// so NEXT_PUBLIC_ENV doesn't work in staging/preview
export const VERCEL_PREVIEW_URL = `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
export const BASE_URL =
  process.env.NEXT_PUBLIC_ENV === 'staging' ? VERCEL_PREVIEW_URL : process.env.NEXT_PUBLIC_BASE_URL;
export const FEEDBACK_FORM_URL = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || '#';

export type ErrorDisplay =
  | string
  | ReactElement<any, string | JSXElementConstructor<any>>
  | ReactNode[]
  | ReactNode
  | null;
