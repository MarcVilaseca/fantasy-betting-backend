import express from 'express';
import { fantasyQueries } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Middleware per verificar admin
function requireAdmin(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Accés denegat. Només administradors.' });
  }
  next();
}

// GET /api/fantasy/classification - Obtenir classificació general
router.get('/classification', authenticateToken, async (req, res) => {
  try {
    const classification = await fantasyQueries.getClassification();
    res.json(classification);
  } catch (error) {
    console.error('Error en obtenir classificació:', error);
    res.status(500).json({ error: 'Error en obtenir classificació' });
  }
});

// GET /api/fantasy/matchdays/:matchday - Obtenir puntuacions d'una jornada
router.get('/matchdays/:matchday', authenticateToken, async (req, res) => {
  try {
    const matchday = parseInt(req.params.matchday);
    if (isNaN(matchday)) {
      return res.status(400).json({ error: 'Jornada invàlida' });
    }

    const scores = await fantasyQueries.getByMatchday(matchday);
    res.json(scores);
  } catch (error) {
    console.error('Error en obtenir puntuacions de jornada:', error);
    res.status(500).json({ error: 'Error en obtenir puntuacions de jornada' });
  }
});

// GET /api/fantasy/all - Obtenir totes les puntuacions
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const allScores = await fantasyQueries.getAllScores();
    res.json(allScores);
  } catch (error) {
    console.error('Error en obtenir puntuacions:', error);
    res.status(500).json({ error: 'Error en obtenir puntuacions' });
  }
});

// GET /api/fantasy/team/:team - Obtenir historial d'un equip
router.get('/team/:team', authenticateToken, async (req, res) => {
  try {
    const teamHistory = await fantasyQueries.getTeamHistory(req.params.team);
    res.json(teamHistory);
  } catch (error) {
    console.error('Error en obtenir historial d\'equip:', error);
    res.status(500).json({ error: 'Error en obtenir historial d\'equip' });
  }
});

// POST /api/fantasy/scores - Afegir puntuacions (només admin)
router.post('/scores', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { scores } = req.body;

    // Validar que és un array
    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ error: 'El cos de la petició ha de contenir un array de puntuacions' });
    }

    // Validar cada puntuació
    for (const score of scores) {
      const { team, matchday, points } = score;

      if (!team || !matchday || points === undefined) {
        return res.status(400).json({ error: 'Cada puntuació ha de tenir team, matchday i points' });
      }

      if (typeof matchday !== 'number' || matchday < 1) {
        return res.status(400).json({ error: 'La jornada ha de ser un número positiu' });
      }

      if (typeof points !== 'number') {
        return res.status(400).json({ error: 'Els punts han de ser un número' });
      }
    }

    // Afegir puntuacions
    const results = [];
    for (const score of scores) {
      const result = await fantasyQueries.addScore(score.team, score.matchday, score.points);
      results.push(result);
    }

    res.status(201).json({
      message: `${scores.length} puntuacions afegides correctament`,
      count: scores.length
    });
  } catch (error) {
    console.error('Error en afegir puntuacions:', error);
    res.status(500).json({ error: 'Error en afegir puntuacions' });
  }
});

export default router;
