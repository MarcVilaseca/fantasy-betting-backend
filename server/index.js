import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/db.js';

// Importar routes
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import betRoutes from './routes/bets.js';
import userRoutes from './routes/users.js';
import fantasyRoutes from './routes/fantasy.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir frontend estàtic (després del build)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Inicialitzar base de dades
await initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fantasy', fantasyRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fantasy Betting API is running' });
});

// Servir index.html per totes les altres rutes (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
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
