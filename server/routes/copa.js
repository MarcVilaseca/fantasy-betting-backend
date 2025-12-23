import express from 'express';
import { matchQueries } from '../config/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/copa/:edition - Obtenir bracket d'una edició
router.get('/:edition', authenticateToken, async (req, res) => {
  try {
    const { edition } = req.params;

    if (!['edition1', 'edition2'].includes(edition)) {
      return res.status(400).json({ error: 'Edició invàlida' });
    }

    const matches = await matchQueries.getCopaMatches(edition);

    // Construir el bracket a partir dels partits de la BD
    const bracket = buildBracket(matches);

    res.json(bracket);
  } catch (error) {
    console.error('Error en obtenir bracket:', error);
    res.status(500).json({ error: 'Error en obtenir bracket' });
  }
});

// Funció per construir el bracket a partir dels partits
function buildBracket(matches) {
  const bracket = {
    round16: {
      left: [],
      right: [],
      exempt: [null, null]
    },
    quarters: {
      left: [],
      right: []
    },
    semis: {
      left: null,
      right: null
    },
    final: null
  };

  matches.forEach(match => {
    const matchData = {
      id: match.id,
      team1: match.team1,
      team2: match.team2,
      score1: match.score_team1,
      score2: match.score_team2,
      winner: determineWinner(match),
      status: match.status
    };

    // Vuitens de final
    if (match.copa_round === 'round16') {
      if (match.copa_position.startsWith('left-')) {
        const index = parseInt(match.copa_position.split('-')[1]) - 1;
        bracket.round16.left[index] = matchData;
      } else if (match.copa_position.startsWith('right-')) {
        const index = parseInt(match.copa_position.split('-')[1]) - 1;
        bracket.round16.right[index] = matchData;
      } else if (match.copa_position === 'exempt-left') {
        bracket.round16.exempt[0] = match.team1;
      } else if (match.copa_position === 'exempt-right') {
        bracket.round16.exempt[1] = match.team1;
      }
    }
    // Quarts de final
    else if (match.copa_round === 'quarters') {
      if (match.copa_position.startsWith('left-')) {
        const index = parseInt(match.copa_position.split('-')[1]) - 1;
        bracket.quarters.left[index] = matchData;
      } else if (match.copa_position.startsWith('right-')) {
        const index = parseInt(match.copa_position.split('-')[1]) - 1;
        bracket.quarters.right[index] = matchData;
      }
    }
    // Semifinals
    else if (match.copa_round === 'semis') {
      if (match.copa_position === 'left') {
        bracket.semis.left = matchData;
      } else if (match.copa_position === 'right') {
        bracket.semis.right = matchData;
      }
    }
    // Final
    else if (match.copa_round === 'final') {
      bracket.final = matchData;
    }
  });

  // Omplir buits amb TBD
  fillEmptySlots(bracket);

  return bracket;
}

function determineWinner(match) {
  if (match.status !== 'finished' || match.score_team1 === null || match.score_team2 === null) {
    return null;
  }
  return match.score_team1 > match.score_team2 ? match.team1 : match.team2;
}

function fillEmptySlots(bracket) {
  // Vuitens
  for (let i = 0; i < 3; i++) {
    if (!bracket.round16.left[i]) {
      bracket.round16.left[i] = { id: null, team1: 'TBD', team2: 'TBD', score1: null, score2: null, winner: null };
    }
    if (!bracket.round16.right[i]) {
      bracket.round16.right[i] = { id: null, team1: 'TBD', team2: 'TBD', score1: null, score2: null, winner: null };
    }
  }

  // Quarts
  for (let i = 0; i < 2; i++) {
    if (!bracket.quarters.left[i]) {
      bracket.quarters.left[i] = { id: null, team1: 'TBD', team2: 'TBD', score1: null, score2: null, winner: null };
    }
    if (!bracket.quarters.right[i]) {
      bracket.quarters.right[i] = { id: null, team1: 'TBD', team2: 'TBD', score1: null, score2: null, winner: null };
    }
  }

  // Semifinals
  if (!bracket.semis.left) {
    bracket.semis.left = { id: null, team1: 'TBD', team2: 'TBD', score1: null, score2: null, winner: null };
  }
  if (!bracket.semis.right) {
    bracket.semis.right = { id: null, team1: 'TBD', team2: 'TBD', score1: null, score2: null, winner: null };
  }

  // Final
  if (!bracket.final) {
    bracket.final = { id: null, team1: 'TBD', team2: 'TBD', score1: null, score2: null, winner: null };
  }

  // Exempts
  if (!bracket.round16.exempt[0]) bracket.round16.exempt[0] = 'TBD';
  if (!bracket.round16.exempt[1]) bracket.round16.exempt[1] = 'TBD';
}

export default router;
