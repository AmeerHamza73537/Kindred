function parseCookies(header = '') {
  const out = {};
  header.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('='));
  });
  return out;
}

export const getTokenFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie || '');
  if (cookies.accessToken) return cookies.accessToken;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
};

export const getRefreshFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies.refreshToken || null;
};

export const cookieAccessOptions = () => ({
  httpOnly: true,
  maxAge: 15 * 60 * 1000,
  sameSite: isProd ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

export const cookieRefreshOptions = () => ({
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};
