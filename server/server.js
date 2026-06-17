import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { assertAuthConfig } from './utils/generateToken.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { registerSocketHandlers } from './socket/socketHandler.js';

import Review from './models/Review.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import handoffRoutes from './routes/handoffRoutes.js';
import gratitudeRoutes from './routes/gratitudeRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();
const server = http.createServer(app);

const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    credentials: true,
  },
});

app.set('io', io);
registerSocketHandlers(io);

app.use(
  cors({
    origin: clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Kindred API', data: { ok: true } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/handoff', handoffRoutes);
app.use('/api/gratitude', gratitudeRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    assertAuthConfig();
    await connectDB();
    // Reviews are no longer tied to a request: drop the old unique index and apply the new one.
    try {
      await Review.collection.dropIndex('request_1_fromUser_1');
    } catch {
      /* index already gone */
    }
    try {
      await Review.syncIndexes();
    } catch (e) {
      console.warn('[reviews] index sync skipped:', e.message);
    }
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (e) {
    console.error('Failed to start', e);
    process.exit(1);
  }
};

start();
