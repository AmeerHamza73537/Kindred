import { verifyAccessToken } from '../utils/generateToken.js';

function parseCookies(header = '') {
  const out = {};
  header.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('='));
  });
  return out;
}

export const registerSocketHandlers = (io) => {
  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || '');
      const token = cookies.accessToken || socket.handshake.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = verifyAccessToken(token);
      socket.userId = String(decoded.id);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user_${socket.userId}`);

    socket.on('join_room', (userId) => {
      if (String(userId) === socket.userId) socket.join(`user_${userId}`);
    });
  });
};
