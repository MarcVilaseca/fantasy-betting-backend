import express from 'express';
import { matchQueries, betQueries, parlayQueries, transactionQueries, userQueries } from '../config/db.js';
import { authenticateToken, requireAdmin } from './auth.js';
import { generateBetOptions } from '../utils/oddsCalculator.js';
import { getAllTeams } from '../data/teams.js';

const router = express.Router();

// Funció per actualitzar l'estat dels partits que hagin passat el deadline
async function updateMatchesStatus() {
  try {
    const allMatches = await matchQueries.getAll();
    const now = new Date();

    for (const match of allMatches) {
      // Si el partit està 'open' i el deadline ha passat, canviar-lo a 'closed'
      if (match.status === 'open' && new Date(match.betting_closes_at) <= now) {
        await matchQueries.updateStatus('closed', match.id);
        console.log(`Partit ${match.id} (${match.team1} vs ${match.team2}) canviat a 'closed'`);
      }
    }
  } catch (error) {
    console.error('Error en actualitzar estat dels partits:', error);
  }
}

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
    // Primer, actualitzar l'estat dels partits que hagin passat el deadline
    await updateMatchesStatus();

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

// GET /api/matches/closed - Obtenir partits tancats però no resolts
router.get('/closed', async (req, res) => {
  try {
    // Primer, actualitzar l'estat dels partits que hagin passat el deadline
    await updateMatchesStatus();

    const matches = await matchQueries.getClosed();

    // Afegir opcions d'aposta per cada partit (encara que no es podran usar)
    const matchesWithOdds = matches.map(match => ({
      ...match,
      betOptions: generateBetOptions(match.team1, match.team2)
    }));

    res.json(matchesWithOdds);
  } catch (error) {
    console.error('Error en obtenir partits tancats:', error);
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
    const { team1, team2, round, betting_closes_at, copa_edition, copa_round, copa_position } = req.body;

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

    const result = await matchQueries.create(team1, team2, round, betting_closes_at, copa_edition, copa_round, copa_position);
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

// PUT /api/matches/:id - Actualitzar detalls del partit (només admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { betting_closes_at } = req.body;

    if (!betting_closes_at) {
      return res.status(400).json({ error: 'Cal proporcionar la nova data de tancament' });
    }

    const match = await matchQueries.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Partit no trobat' });
    }

    if (match.status === 'finished') {
      return res.status(400).json({ error: 'No es pot editar un partit finalitzat' });
    }

    // Actualitzar data de tancament
    await matchQueries.updateBettingCloses(betting_closes_at, req.params.id);

    const updatedMatch = await matchQueries.findById(req.params.id);
    res.json(updatedMatch);
  } catch (error) {
    console.error('Error en actualitzar partit:', error);
    res.status(500).json({ error: 'Error en actualitzar partit' });
  }
});

// PUT /api/matches/:id/result - Establir resultat del partit (només admin)
router.put('/:id/result', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { score_team1, score_team2, captain_score_team1, captain_score_team2 } = req.body;

    if (score_team1 === undefined || score_team2 === undefined) {
      return res.status(400).json({ error: 'Falten les puntuacions dels equips' });
    }

    if (captain_score_team1 === undefined || captain_score_team2 === undefined) {
      return res.status(400).json({ error: 'Falten les puntuacions dels capitans' });
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
    await resolveBetsForMatch(
      req.params.id,
      score_team1,
      score_team2,
      captain_score_team1,
      captain_score_team2,
      match.team1,
      match.team2
    );

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
async function resolveBetsForMatch(matchId, scoreTeam1, scoreTeam2, captainScoreTeam1, captainScoreTeam2, team1Name, team2Name) {
  const bets = await betQueries.getByMatch(matchId);
  const winner = scoreTeam1 > scoreTeam2 ? team1Name : team2Name;
  const margin = Math.abs(scoreTeam1 - scoreTeam2);
  const totalScore = scoreTeam1 + scoreTeam2;
  const CAPTAIN_THRESHOLD = 7;

  console.log(`🏆 Resolent apostes del partit ${matchId}:`);
  console.log(`   ${team1Name}: ${scoreTeam1} pts (Capità: ${captainScoreTeam1})`);
  console.log(`   ${team2Name}: ${scoreTeam2} pts (Capità: ${captainScoreTeam2})`);
  console.log(`   Guanyador: ${winner}`);
  console.log(`   Total: ${totalScore} pts`);

  for (const bet of bets) {
    let isWin = false;

    switch (bet.bet_type) {
      case 'winner':
        isWin = bet.selection === winner;
        break;

      case 'captain':
        // Format: "Nom de l'equip"
        // Guanya si el capità de l'equip seleccionat ha fet 7+ punts
        if (bet.selection === team1Name) {
          isWin = captainScoreTeam1 >= CAPTAIN_THRESHOLD;
        } else if (bet.selection === team2Name) {
          isWin = captainScoreTeam2 >= CAPTAIN_THRESHOLD;
        }
        console.log(`   Aposta capità ${bet.selection}: ${isWin ? '✅' : '❌'}`);
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
        isWin = (type === 'over' && totalScore >= lineValue) ||
                (type === 'under' && totalScore < lineValue);
        console.log(`   Aposta ${type} ${lineValue}: Total=${totalScore} ${isWin ? '✅' : '❌'}`);
        break;
    }

    // Actualitzar estat de l'aposta
    await betQueries.updateStatus(
      isWin ? 'won' : 'lost',
      isWin ? 'win' : 'loss',
      bet.id
    );

    // Si ha guanyat i és una aposta simple (amount > 0), afegir diners a l'usuari
    if (isWin && parseFloat(bet.amount) > 0) {
      const user = await userQueries.findById(bet.user_id);
      const newCoins = parseFloat(user.coins) + parseFloat(bet.potential_return);
      await userQueries.updateCoins(newCoins, bet.user_id);

      // Registrar transacció
      await transactionQueries.create(
        bet.user_id,
        parseFloat(bet.potential_return),
        'bet_won',
        `Aposta guanyada: ${bet.selection} @ ${bet.odds}`
      );

      console.log(`   💰 ${user.username} guanya ${bet.potential_return} monedes (${user.coins} → ${newCoins})`);
    }
  }

  // Després de resoldre totes les apostes del partit, comprovar les combinades
  await resolveParlayBets();
}

// Funció per resoldre apostes combinades
async function resolveParlayBets() {
  // Obtenir totes les combinades pendents
  const parlays = await parlayQueries.getAllPending();

  console.log(`\n🔄 Comprovant ${parlays.length} apostes combinades pendents...`);

  for (const parlay of parlays) {
    // Obtenir totes les apostes individuals de la combinada
    const items = await parlayQueries.getItems(parlay.id);

    console.log(`\n   📦 Combinada #${parlay.id} (${items.length} apostes):`);

    // Comprovar l'estat de cada aposta
    let allWon = true;
    let anyPending = false;
    let anyLost = false;

    for (const item of items) {
      console.log(`      - Aposta #${item.id}: ${item.bet_type} ${item.selection} → ${item.status}`);

      // item ja conté tota la informació de la bet gràcies al JOIN
      if (item.status === 'pending') {
        anyPending = true;
      } else if (item.status === 'lost') {
        anyLost = true;
        allWon = false;
      } else if (item.status === 'won') {
        // És won, continuem
      } else {
        // Status desconegut
        allWon = false;
      }
    }

    // Si alguna aposta ha perdut, la combinada perd
    if (anyLost) {
      await parlayQueries.updateStatus('lost', 'loss', parlay.id);
      console.log(`   ❌ Combinada #${parlay.id} PERDUDA (alguna aposta va perdre)`);
    }
    // Si totes han guanyat, la combinada guanya
    else if (allWon && !anyPending) {
      await parlayQueries.updateStatus('won', 'win', parlay.id);

      // Pagar a l'usuari
      const user = await userQueries.findById(parlay.user_id);
      const newCoins = parseFloat(user.coins) + parseFloat(parlay.potential_return);
      await userQueries.updateCoins(newCoins, parlay.user_id);

      // Registrar transacció
      await transactionQueries.create(
        parlay.user_id,
        parseFloat(parlay.potential_return),
        'parlay_won',
        `Aposta combinada guanyada (${items.length} apostes) @ ${parlay.total_odds}`
      );

      console.log(`   ✅ Combinada #${parlay.id} GUANYADA! ${user.username} guanya ${parlay.potential_return} monedes`);
    }
    // Si encara hi ha apostes pendents, no fer res
    else if (anyPending) {
      console.log(`   ⏳ Combinada #${parlay.id} encara té apostes pendents`);
    }
  }
}

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
