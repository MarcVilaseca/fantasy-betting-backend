import express from 'express';
import { betQueries, matchQueries, userQueries, parlayQueries, transactionQueries } from '../config/db.js';
import { authenticateToken } from './auth.js';
import { calculateParlayOdds } from '../utils/oddsCalculator.js';

const router = express.Router();

// NOTA: La verificació del termini es fa per partit individual més endavant

// GET /api/bets/public - Obtenir totes les apostes públiques (simples i combinades)
router.get('/public', authenticateToken, async (req, res) => {
  try {
    const bets = await betQueries.getAllPublic();
    const parlays = await parlayQueries.getAllPublic();

    // Per cada combinada, obtenir els items
    const parlaysWithItems = await Promise.all(
      parlays.map(async parlay => ({
        ...parlay,
        bets: await parlayQueries.getItems(parlay.id)
      }))
    );

    res.json({
      bets: bets,
      parlays: parlaysWithItems
    });
  } catch (error) {
    console.error('Error en obtenir apostes públiques:', error);
    res.status(500).json({ error: 'Error en obtenir apostes públiques' });
  }
});

// GET /api/bets/public/history - Obtenir apostes públiques resoltes (històric)
router.get('/public/history', authenticateToken, async (req, res) => {
  try {
    const bets = await betQueries.getResolvedPublic();
    const parlays = await parlayQueries.getResolvedPublic();

    // Per cada combinada, obtenir els items
    const parlaysWithItems = await Promise.all(
      parlays.map(async parlay => ({
        ...parlay,
        bets: await parlayQueries.getItems(parlay.id)
      }))
    );

    res.json({
      bets: bets,
      parlays: parlaysWithItems
    });
  } catch (error) {
    console.error('Error en obtenir històric d\'apostes:', error);
    res.status(500).json({ error: 'Error en obtenir històric d\'apostes' });
  }
});

// GET /api/bets/my - Obtenir apostes de l'usuari actual
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const bets = await betQueries.getByUser(req.user.id);
    res.json(bets);
  } catch (error) {
    console.error('Error en obtenir apostes:', error);
    res.status(500).json({ error: 'Error en obtenir apostes' });
  }
});

// GET /api/bets/my/parlays - Obtenir apostes combinades de l'usuari
router.get('/my-parlays', authenticateToken, async (req, res) => {
  try {
    const parlays = await parlayQueries.getByUser(req.user.id);

    // Per cada combinada, obtenir els items
    const parlaysWithItems = await Promise.all(
      parlays.map(async parlay => ({
        ...parlay,
        bets: await parlayQueries.getItems(parlay.id)
      }))
    );

    res.json(parlaysWithItems);
  } catch (error) {
    console.error('Error en obtenir combinades:', error);
    res.status(500).json({ error: 'Error en obtenir combinades' });
  }
});

// POST /api/bets - Crear nova aposta simple
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { match_id, bet_type, selection, amount, odds } = req.body;

    // Validacions
    if (!match_id || !bet_type || !selection || !amount || !odds) {
      return res.status(400).json({ error: 'Falten camps obligatoris' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'La quantitat ha de ser positiva' });
    }

    // Verificar que el partit existeix i està obert
    const match = await matchQueries.findById(match_id);
    if (!match) {
      return res.status(404).json({ error: 'Partit no trobat' });
    }

    if (match.status !== 'open') {
      return res.status(400).json({ error: 'Aquest partit ja no accepta apostes' });
    }

    // Verificar que l'horari encara permet apostes
    const closingTime = new Date(match.betting_closes_at);
    if (closingTime <= new Date()) {
      return res.status(400).json({ error: 'El termini per apostar ha finalitzat' });
    }

    // Verificar que l'usuari té prou monedes
    const user = await userQueries.findById(req.user.id);
    if (user.coins < amount) {
      return res.status(400).json({ error: 'No tens prou monedes' });
    }

    // Verificar que l'usuari no és cap dels jugadors del duel
    if (user.username === match.team1 || user.username === match.team2) {
      return res.status(403).json({ error: 'No pots apostar en els teus propis partits' });
    }

    // Calcular retorn potencial
    const potentialReturn = parseFloat((amount * odds).toFixed(2));

    // Crear aposta
    const result = await betQueries.create(
      req.user.id,
      match_id,
      bet_type,
      selection,
      amount,
      odds,
      potentialReturn
    );

    // Restar monedes de l'usuari
    const newCoins = user.coins - amount;
    await userQueries.updateCoins(newCoins, req.user.id);

    // Registrar transacció
    await transactionQueries.create(
      req.user.id,
      -amount,
      'bet_placed',
      `Aposta realitzada: ${selection} @ ${odds}`
    );

    const betId = result.lastInsertRowid;
    const newBet = await betQueries.findById(betId);

    res.status(201).json({
      bet: newBet,
      newBalance: newCoins
    });
  } catch (error) {
    console.error('Error en crear aposta:', error);
    res.status(500).json({ error: 'Error en crear aposta' });
  }
});

// POST /api/bets/parlay - Crear aposta combinada
router.post('/parlay', authenticateToken, async (req, res) => {
  try {
    const { bets: betSelections, amount } = req.body;

    // Validacions
    if (!betSelections || !Array.isArray(betSelections) || betSelections.length < 2 || betSelections.length > 4) {
      return res.status(400).json({ error: 'Una combinada ha de tenir entre 2 i 4 apostes' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'La quantitat ha de ser positiva' });
    }

    // Verificar usuari
    const user = await userQueries.findById(req.user.id);
    if (user.coins < amount) {
      return res.status(400).json({ error: 'No tens prou monedes' });
    }

    // Verificar cada aposta
    const validBets = [];
    for (const betSel of betSelections) {
      const { match_id, bet_type, selection, odds } = betSel;

      if (!match_id || !bet_type || !selection || !odds) {
        return res.status(400).json({ error: 'Informació incompleta en una de les apostes' });
      }

      // Verificar partit
      const match = await matchQueries.findById(match_id);
      if (!match || match.status !== 'open') {
        return res.status(400).json({ error: `El partit ${match_id} no està disponible` });
      }

      // Verificar termini
      const closingTime = new Date(match.betting_closes_at);
      if (closingTime <= new Date()) {
        return res.status(400).json({ error: `El termini per apostar al partit ${match_id} ha finalitzat` });
      }

      // Verificar que no aposta en els seus propis partits
      if (user.username === match.team1 || user.username === match.team2) {
        return res.status(403).json({ error: 'No pots apostar en els teus propis partits' });
      }

      validBets.push({ ...betSel, match });
    }

    // Calcular cuota total
    const totalOdds = calculateParlayOdds(validBets);
    const potentialReturn = parseFloat((amount * totalOdds).toFixed(2));

    // Crear aposta combinada
    const parlayResult = await parlayQueries.create(
      req.user.id,
      amount,
      totalOdds,
      potentialReturn
    );
    const parlayId = parlayResult.lastInsertRowid;

    // Crear cada aposta individual
    for (const bet of validBets) {
      const betResult = await betQueries.create(
        req.user.id,
        bet.match_id,
        bet.bet_type,
        bet.selection,
        0, // Amount 0 perquè només paguem una vegada
        bet.odds,
        0  // No té retorn individual
      );

      // Vincular amb la combinada
      await parlayQueries.addItem(parlayId, betResult.lastInsertRowid);
    }

    // Restar monedes
    const newCoins = user.coins - amount;
    await userQueries.updateCoins(newCoins, req.user.id);

    // Registrar transacció
    await transactionQueries.create(
      req.user.id,
      -amount,
      'parlay_placed',
      `Aposta combinada (${validBets.length} apostes) @ ${totalOdds}`
    );

    res.status(201).json({
      parlay_id: parlayId,
      total_odds: totalOdds,
      potential_return: potentialReturn,
      newBalance: newCoins
    });
  } catch (error) {
    console.error('Error en crear combinada:', error);
    res.status(500).json({ error: 'Error en crear combinada' });
  }
});

// POST /api/bets/:id/cancel - Cancel·lar aposta simple (compatible amb frontend)
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const bet = await betQueries.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({ error: 'Aposta no trobada' });
    }

    // Verificar que l'usuari és el propietari
    if (bet.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tens permís per cancel·lar aquesta aposta' });
    }

    // Verificar que l'aposta està pendent
    if (bet.status !== 'pending') {
      return res.status(400).json({ error: 'Només es poden cancel·lar apostes pendents' });
    }

    // Verificar que el partit encara està obert
    const match = await matchQueries.findById(bet.match_id);
    if (!match) {
      return res.status(404).json({ error: 'Partit no trobat' });
    }
    if (match.status !== 'open') {
      return res.status(400).json({ error: 'No es poden cancel·lar apostes de partits tancats o finalitzats' });
    }

    // Verificar que té una quantitat a retornar (no és part d'una combinada)
    if (bet.amount === 0) {
      return res.status(400).json({ error: 'No es poden cancel·lar apostes que formen part d\'una combinada' });
    }

    // Retornar monedes a l'usuari
    const user = await userQueries.findById(req.user.id);
    const newCoins = Number(user.coins) + Number(bet.amount);
    await userQueries.updateCoins(newCoins, req.user.id);

    // Marcar aposta com a cancel·lada
    await betQueries.updateStatus('cancelled', null, req.params.id);

    // Registrar transacció
    await transactionQueries.create(
      req.user.id,
      bet.amount,
      'refund',
      `Cancel·lació aposta #${req.params.id}`
    );

    res.json({
      message: 'Aposta cancel·lada i monedes retornades',
      amount: bet.amount,
      newBalance: newCoins
    });
  } catch (error) {
    console.error('Error en cancel·lar aposta:', error);
    res.status(500).json({ error: 'Error en cancel·lar aposta' });
  }
});

// GET /api/bets/:id - Obtenir detalls d'una aposta
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bet = await betQueries.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({ error: 'Aposta no trobada' });
    }

    // Només l'usuari propietari o admin pot veure-la
    if (bet.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'No tens permís per veure aquesta aposta' });
    }

    res.json(bet);
  } catch (error) {
    console.error('Error en obtenir aposta:', error);
    res.status(500).json({ error: 'Error en obtenir aposta' });
  }
});

// DELETE /api/bets/:id - Cancel·lar aposta i retornar punts
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const bet = await betQueries.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({ error: 'Aposta no trobada' });
    }

    // Verificar que l'usuari és el propietari
    if (bet.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tens permís per cancel·lar aquesta aposta' });
    }

    // Verificar que l'aposta està pendent
    if (bet.status !== 'pending') {
      return res.status(400).json({ error: 'Només es poden cancel·lar apostes pendents' });
    }

    // Verificar que té una quantitat a retornar (no és part d'una combinada)
    if (bet.amount === 0) {
      return res.status(400).json({ error: 'No es poden cancel·lar apostes que formen part d\'una combinada' });
    }

    // Retornar monedes a l'usuari
    const user = await userQueries.findById(req.user.id);
    const newCoins = user.coins + bet.amount;
    await userQueries.updateCoins(newCoins, req.user.id);

    // Registrar transacció
    await transactionQueries.create(
      req.user.id,
      bet.amount,
      'bet_cancelled',
      `Aposta cancel·lada: ${bet.selection} @ ${bet.odds}`
    );

    // Eliminar aposta
    await betQueries.delete(req.params.id);

    res.json({
      message: 'Aposta cancel·lada correctament',
      refundAmount: bet.amount,
      newBalance: newCoins
    });
  } catch (error) {
    console.error('Error en cancel·lar aposta:', error);
    res.status(500).json({ error: 'Error en cancel·lar aposta' });
  }
});

// POST /api/bets/parlay/:id/cancel - Cancel·lar aposta combinada (compatible amb frontend)
router.post('/parlay/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const parlay = await parlayQueries.findById(req.params.id);

    if (!parlay) {
      return res.status(404).json({ error: 'Aposta combinada no trobada' });
    }

    // Verificar que l'usuari és el propietari
    if (parlay.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tens permís per cancel·lar aquesta aposta' });
    }

    // Verificar que l'aposta està pendent
    if (parlay.status !== 'pending') {
      return res.status(400).json({ error: 'Només es poden cancel·lar apostes pendents' });
    }

    // Verificar que tots els partits encara estan oberts
    const items = await parlayQueries.getItems(req.params.id);
    for (const item of items) {
      const match = await matchQueries.findById(item.match_id);
      if (!match) {
        return res.status(404).json({ error: 'Un dels partits no s\'ha trobat' });
      }
      if (match.status !== 'open') {
        return res.status(400).json({ error: 'No es poden cancel·lar apostes amb partits tancats o finalitzats' });
      }
    }

    // Retornar monedes a l'usuari
    const user = await userQueries.findById(req.user.id);
    const newCoins = Number(user.coins) + Number(parlay.amount);
    await userQueries.updateCoins(newCoins, req.user.id);

    // Registrar transacció
    await transactionQueries.create(
      req.user.id,
      parlay.amount,
      'parlay_cancelled',
      `Aposta combinada cancel·lada @ ${parlay.total_odds}`
    );

    // Marcar combinada com a cancel·lada
    await parlayQueries.updateStatus('cancelled', null, req.params.id);

    // També cancel·lar totes les apostes individuals
    await Promise.all(items.map(item => betQueries.updateStatus('cancelled', null, item.bet_id)));

    res.json({
      message: 'Aposta combinada cancel·lada i monedes retornades',
      amount: parlay.amount,
      newBalance: newCoins
    });
  } catch (error) {
    console.error('Error en cancel·lar combinada:', error);
    res.status(500).json({ error: 'Error en cancel·lar combinada' });
  }
});

// DELETE /api/bets/parlay/:id - Cancel·lar aposta combinada i retornar punts
router.delete('/parlay/:id', authenticateToken, async (req, res) => {
  try {
    const parlay = await parlayQueries.findById(req.params.id);

    if (!parlay) {
      return res.status(404).json({ error: 'Aposta combinada no trobada' });
    }

    // Verificar que l'usuari és el propietari
    if (parlay.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tens permís per cancel·lar aquesta aposta' });
    }

    // Verificar que l'aposta està pendent
    if (parlay.status !== 'pending') {
      return res.status(400).json({ error: 'Només es poden cancel·lar apostes pendents' });
    }

    // Retornar monedes a l'usuari
    const user = await userQueries.findById(req.user.id);
    const newCoins = user.coins + parlay.amount;
    await userQueries.updateCoins(newCoins, req.user.id);

    // Registrar transacció
    await transactionQueries.create(
      req.user.id,
      parlay.amount,
      'parlay_cancelled',
      `Aposta combinada cancel·lada @ ${parlay.total_odds}`
    );

    // Eliminar aposta combinada (això eliminarà també els items per CASCADE)
    await parlayQueries.delete(req.params.id);

    res.json({
      message: 'Aposta combinada cancel·lada correctament',
      refundAmount: parlay.amount,
      newBalance: newCoins
    });
  } catch (error) {
    console.error('Error en cancel·lar aposta combinada:', error);
    res.status(500).json({ error: 'Error en cancel·lar aposta combinada' });
  }
});

export default router;
