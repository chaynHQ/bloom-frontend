export default function generateReturnUrlQuery(pathname: string) {
  return pathname.indexOf('/courses/') > -1
    ? `?${generateReturnUrlParam('/courses')}`
    : `?${generateReturnUrlParam(pathname)}`;
}

export const generateReturnUrlParam = (path: string) => `return_url=${encodeURIComponent(path)}`;
