export default function generateReturnUrlQuery(pathname: string) {
  return `?${generateReturnUrlParam(pathname)}`;
}

export const generateReturnUrlParam = (path: string) => `return_url=${encodeURIComponent(path)}`;
