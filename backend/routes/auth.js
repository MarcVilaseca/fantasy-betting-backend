import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userQueries } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware per verificar token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionat' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invàlid' });
    }
    req.user = user;
    next();
  });
}

// Middleware per verificar admin
export function requireAdmin(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Accés no autoritzat. Només administradors.' });
  }
  next();
}

// POST /api/auth/register - Registrar nou usuari
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username i password són obligatoris' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contrasenya ha de tenir mínim 6 caràcters' });
    }

    // Comprovar si l'usuari ja existeix
    const existingUser = await userQueries.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Aquest username ja existeix' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuari
    const result = await userQueries.create(username, hashedPassword, 0);
    const userId = result.lastInsertRowid;

    // Generar token
    const token = jwt.sign(
      { id: userId, username, is_admin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuari creat correctament',
      token,
      user: {
        id: userId,
        username,
        coins: 1000,
        is_admin: false
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error en crear usuari' });
  }
});

// POST /api/auth/login - Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username i password són obligatoris' });
    }

    // Trobar usuari
    const user = await userQueries.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credencials incorrectes' });
    }

    // Verificar password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credencials incorrectes' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        coins: user.coins,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en fer login' });
  }
});

// GET /api/auth/me - Obtenir info de l'usuari actual
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await userQueries.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuari no trobat' });
    }

    res.json({
      id: user.id,
      username: user.username,
      coins: user.coins,
      is_admin: user.is_admin
    });
  } catch (error) {
    console.error('Error en obtenir usuari:', error);
    res.status(500).json({ error: 'Error en obtenir dades' });
  }
});

export default router;
