export const getURL = () => {
  const url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000/';
  return url.includes('http') ? url : `https://${url}`;
};