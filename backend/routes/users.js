import express from 'express';
import { userQueries, transactionQueries } from '../config/db.js';
import { authenticateToken, requireAdmin } from './auth.js';

const router = express.Router();

// GET /api/users - Obtenir tots els usuaris (només admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await userQueries.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error en obtenir usuaris:', error);
    res.status(500).json({ error: 'Error en obtenir usuaris' });
  }
});

// GET /api/users/leaderboard - Obtenir ranking d'usuaris (públic)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await userQueries.getAll();
    const leaderboard = users.map(user => ({
      username: user.username,
      coins: user.coins,
      canCashOut: user.coins >= 10000
    }));
    res.json(leaderboard);
  } catch (error) {
    console.error('Error en obtenir leaderboard:', error);
    res.status(500).json({ error: 'Error en obtenir ranking' });
  }
});

// GET /api/users/me/transactions - Obtenir historial de transaccions
router.get('/me/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await transactionQueries.getByUser(req.user.id);
    res.json(transactions);
  } catch (error) {
    console.error('Error en obtenir transaccions:', error);
    res.status(500).json({ error: 'Error en obtenir historial' });
  }
});

// GET /api/users/:id - Obtenir info d'un usuari específic
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await userQueries.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuari no trobat' });
    }

    // Només retornar info pública si no és l'usuari actual ni admin
    if (req.user.id !== user.id && !req.user.is_admin) {
      return res.json({
        username: user.username,
        coins: user.coins
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      coins: user.coins,
      is_admin: user.is_admin,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error en obtenir usuari:', error);
    res.status(500).json({ error: 'Error en obtenir usuari' });
  }
});

// POST /api/users/:id/cash-out - Convertir 10.000 monedes en pressupost fantasy
router.post('/:id/cash-out', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Només l'usuari pot fer cash-out de les seves pròpies monedes
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'No pots fer cash-out per un altre usuari' });
    }

    const user = await userQueries.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuari no trobat' });
    }

    if (user.coins < 10000) {
      return res.status(400).json({ error: 'Necessites mínim 10.000 monedes per fer cash-out' });
    }

    // Restar 10.000 monedes
    const newCoins = user.coins - 10000;
    await userQueries.updateCoins(newCoins, userId);

    // Registrar transacció
    await transactionQueries.create(
      userId,
      -10000,
      'cash_out',
      'Cash-out: 10.000 monedes convertides en 10.000.000€ de pressupost fantasy'
    );

    res.json({
      message: 'Felicitats! Has convertit 10.000 monedes en 10.000.000€ de pressupost fantasy',
      newBalance: newCoins,
      fantasyBudget: 10000000
    });
  } catch (error) {
    console.error('Error en fer cash-out:', error);
    res.status(500).json({ error: 'Error en processar cash-out' });
  }
});

// PUT /api/users/:id/coins - Modificar monedes d'un usuari (només admin)
router.put('/:id/coins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { coins, reason } = req.body;

    if (coins === undefined || coins < 0) {
      return res.status(400).json({ error: 'Quantitat de monedes invàlida' });
    }

    const user = await userQueries.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuari no trobat' });
    }

    const oldCoins = user.coins;
    await userQueries.updateCoins(coins, req.params.id);

    // Registrar transacció
    const difference = coins - oldCoins;
    await transactionQueries.create(
      req.params.id,
      difference,
      'admin_adjustment',
      reason || 'Ajust manual per administrador'
    );

    res.json({
      message: 'Monedes actualitzades correctament',
      oldBalance: oldCoins,
      newBalance: coins
    });
  } catch (error) {
    console.error('Error en modificar monedes:', error);
    res.status(500).json({ error: 'Error en modificar monedes' });
  }
});

export default router;
