import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';

// Importar routes
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import betRoutes from './routes/bets.js';
import userRoutes from './routes/users.js';
import fantasyRoutes from './routes/fantasy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicialitzar base de dades
await initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fantasy', fantasyRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fantasy Betting API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
