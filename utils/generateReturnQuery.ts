export default function generateReturnUrlQuery(pathname: string) {
  return `?return_url=${encodeURIComponent(pathname)}`;
}
