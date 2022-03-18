export default function generateReturnUrlQuery(pathname: string) {
  return pathname.indexOf('/courses/') > -1
    ? `?return_url=${encodeURIComponent('/courses')}`
    : `?return_url=${encodeURIComponent(pathname)}`;
}
