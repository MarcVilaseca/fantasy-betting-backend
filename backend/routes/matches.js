import express from 'express';
import { matchQueries, betQueries } from '../config/db.js';
import { authenticateToken, requireAdmin } from './auth.js';
import { generateBetOptions } from '../utils/oddsCalculator.js';
import { getAllTeams } from '../data/teams.js';

const router = express.Router();

// GET /api/matches/teams - Obtenir llista d'equips disponibles
router.get('/teams', (req, res) => {
  try {
    const teams = getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error en obtenir equips:', error);
    res.status(500).json({ error: 'Error en obtenir equips' });
  }
});

// GET /api/matches - Obtenir tots els partits
router.get('/', async (req, res) => {
  try {
    const matches = await matchQueries.getAll();
    res.json(matches);
  } catch (error) {
    console.error('Error en obtenir partits:', error);
    res.status(500).json({ error: 'Error en obtenir partits' });
  }
});

// GET /api/matches/open - Obtenir partits oberts per apostar
router.get('/open', async (req, res) => {
  try {
    const matches = await matchQueries.getOpen();

    // Afegir opcions d'aposta per cada partit
    const matchesWithOdds = matches.map(match => ({
      ...match,
      betOptions: generateBetOptions(match.team1, match.team2)
    }));

    res.json(matchesWithOdds);
  } catch (error) {
    console.error('Error en obtenir partits oberts:', error);
    res.status(500).json({ error: 'Error en obtenir partits' });
  }
});

// GET /api/matches/:id - Obtenir un partit concret
router.get('/:id', async (req, res) => {
  try {
    const match = await matchQueries.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Partit no trobat' });
    }

    // Afegir opcions d'aposta
    match.betOptions = generateBetOptions(match.team1, match.team2);

    res.json(match);
  } catch (error) {
    console.error('Error en obtenir partit:', error);
    res.status(500).json({ error: 'Error en obtenir partit' });
  }
});

// POST /api/matches - Crear nou partit (només admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { team1, team2, round, betting_closes_at } = req.body;

    if (!team1 || !team2 || !round || !betting_closes_at) {
      return res.status(400).json({ error: 'Falten camps obligatoris' });
    }

    // Verificar que els equips existeixen
    const teams = getAllTeams();
    if (!teams.includes(team1) || !teams.includes(team2)) {
      return res.status(400).json({ error: 'Un o ambdós equips no existeixen' });
    }

    if (team1 === team2) {
      return res.status(400).json({ error: 'Els equips no poden ser iguals' });
    }

    const result = await matchQueries.create(team1, team2, round, betting_closes_at);
    const matchId = result.lastInsertRowid;

    const newMatch = await matchQueries.findById(matchId);
    newMatch.betOptions = generateBetOptions(team1, team2);

    res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error en crear partit:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Aquest duel ja existeix per aquesta ronda' });
    }
    res.status(500).json({ error: 'Error en crear partit' });
  }
});

// PUT /api/matches/:id/result - Establir resultat del partit (només admin)
router.put('/:id/result', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { score_team1, score_team2 } = req.body;

    if (score_team1 === undefined || score_team2 === undefined) {
      return res.status(400).json({ error: 'Falten les puntuacions' });
    }

    const match = await matchQueries.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Partit no trobat' });
    }

    if (match.status === 'finished') {
      return res.status(400).json({ error: 'Aquest partit ja està finalitzat' });
    }

    // Actualitzar resultat
    await matchQueries.setResult(score_team1, score_team2, req.params.id);

    // Ara cal resoldre les apostes d'aquest partit
    // Això ho farem en una funció separada
    await resolveBetsForMatch(req.params.id, score_team1, score_team2, match.team1, match.team2);

    const updatedMatch = await matchQueries.findById(req.params.id);
    res.json(updatedMatch);
  } catch (error) {
    console.error('Error en establir resultat:', error);
    res.status(500).json({ error: 'Error en establir resultat' });
  }
});

// GET /api/matches/:id/bets - Obtenir apostes d'un partit (només admin)
router.get('/:id/bets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bets = await betQueries.getByMatch(req.params.id);
    res.json(bets);
  } catch (error) {
    console.error('Error en obtenir apostes:', error);
    res.status(500).json({ error: 'Error en obtenir apostes' });
  }
});

// Funció auxiliar per resoldre apostes
async function resolveBetsForMatch(matchId, scoreTeam1, scoreTeam2, team1Name, team2Name) {
  const bets = await betQueries.getByMatch(matchId);
  const winner = scoreTeam1 > scoreTeam2 ? team1Name : team2Name;
  const margin = Math.abs(scoreTeam1 - scoreTeam2);
  const totalScore = scoreTeam1 + scoreTeam2;

  for (const bet of bets) {
    let isWin = false;

    switch (bet.bet_type) {
      case 'winner':
        isWin = bet.selection === winner;
        break;

      case 'margin':
        // Format: "team1:+5" o "team2:+10"
        const [selectedTeam, marginStr] = bet.selection.split(':');
        const requiredMargin = parseInt(marginStr.replace('+', ''));
        isWin = selectedTeam === winner && margin >= requiredMargin;
        break;

      case 'over_under':
        // Format: "over:140" o "under:140"
        const [type, line] = bet.selection.split(':');
        const lineValue = parseInt(line);
        isWin = (type === 'over' && totalScore > lineValue) ||
                (type === 'under' && totalScore < lineValue);
        break;
    }

    // Actualitzar estat de l'aposta
    await betQueries.updateStatus(
      isWin ? 'won' : 'lost',
      isWin ? 'win' : 'loss',
      bet.id
    );

    // Si ha guanyat, afegir diners a l'usuari
    if (isWin) {
      const user = await userQueries.findById(bet.user_id);
      const newCoins = user.coins + bet.potential_return;
      await userQueries.updateCoins(newCoins, bet.user_id);

      // Registrar transacció
      await transactionQueries.create(
        bet.user_id,
        bet.potential_return,
        'bet_won',
        `Aposta guanyada: ${bet.selection} @ ${bet.odds}`
      );
    }
  }
}

// Importar transactionQueries per poder-lo usar
import { transactionQueries, userQueries } from '../config/db.js';


// DELETE /api/matches/:id - Eliminar un partit (només admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const match = await matchQueries.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Partit no trobat' });
    }

    // Verificar que no hi hagi apostes associades
    const bets = await betQueries.getByMatch(req.params.id);
    if (bets.length > 0) {
      return res.status(400).json({ 
        error: 'No es pot eliminar un partit amb apostes associades' 
      });
    }

    await matchQueries.delete(req.params.id);
    res.json({ message: 'Partit eliminat correctament' });
  } catch (error) {
    console.error('Error en eliminar partit:', error);
    res.status(500).json({ error: 'Error en eliminar partit' });
  }
});

export default router;
