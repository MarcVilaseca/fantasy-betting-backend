import express from 'express';
import bcrypt from 'bcryptjs';
import { userQueries, matchQueries, fantasyQueries } from '../config/db.js';

const router = express.Router();

// Endpoint per inicialitzar la base de dades (NOMÉS PER PRIMERA VEGADA)
router.post('/init-db', async (req, res) => {
  try {
    const results = {
      admin: null,
      matches: [],
      fantasy: null
    };

    // 1. CREAR ADMIN
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    const existing = await userQueries.findByUsername(adminUsername);
    if (!existing) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const result = await userQueries.create(adminUsername, hashedPassword, 1);
      const userId = result.id || result.lastInsertRowid;
      await userQueries.updateCoins(0, userId);
      results.admin = { created: true, username: adminUsername };
    } else {
      results.admin = { created: false, message: 'Admin ja existeix' };
    }

    // 2. CREAR PARTITS INICIALS
    const matches = await matchQueries.getAll();
    if (matches.length === 0) {
      await matchQueries.create(
        "L'ESQUADRA VILAS...",
        'CE FerranitoPito',
        'Jornada 18',
        new Date('2025-01-17T20:59:00')
      );
      results.matches.push("L'ESQUADRA VILAS... vs CE FerranitoPito");

      await matchQueries.create(
        'Jaume Creixell U.E.',
        'LINYOLETS E.C.',
        'Jornada 18',
        new Date('2025-01-17T20:59:00')
      );
      results.matches.push('Jaume Creixell U.E. vs LINYOLETS E.C.');
    } else {
      results.matches = { created: false, message: `Ja hi ha ${matches.length} partits` };
    }

    // 3. CREAR DADES FANTASY
    const existingTeams = await fantasyQueries.getClassification();
    if (existingTeams.length === 0) {
      const teams = [
        'Jaume Creixell U.E.',
        "L'ESQUADRA VILAS...",
        'CE FerranitoPito',
        'LINYOLETS E.C.',
        'CD Napasakatelas',
        'FC Suquesme',
        'UD Elninyo',
        'ATLETIC VILLAMAÑO',
        'FC Rebollet',
        'AD Tumbalarata',
        'UD LOS COYOTES',
        'FC JERICLES',
        'CF La Mandanga',
        'CD Espinetes Fighters'
      ];

      const scores = {
        'Jaume Creixell U.E.': [60, 70, 55, 65, 80, 75, 68, 72, 64, 78, 82, 70, 66, 74],
        "L'ESQUADRA VILAS...": [65, 72, 68, 70, 75, 78, 71, 69, 76, 73, 80, 68, 72, 77],
        'CE FerranitoPito': [58, 64, 60, 66, 72, 70, 65, 68, 71, 74, 76, 66, 69, 73],
        'LINYOLETS E.C.': [62, 68, 64, 68, 74, 72, 68, 70, 73, 76, 78, 70, 71, 75],
        'CD Napasakatelas': [55, 60, 58, 62, 68, 66, 62, 64, 67, 70, 72, 64, 66, 69],
        'FC Suquesme': [57, 63, 59, 64, 70, 68, 64, 66, 69, 72, 74, 65, 68, 71],
        'UD Elninyo': [54, 58, 56, 60, 66, 64, 60, 62, 65, 68, 70, 62, 64, 67],
        'ATLETIC VILLAMAÑO': [56, 62, 58, 63, 69, 67, 63, 65, 68, 71, 73, 64, 67, 70],
        'FC Rebollet': [52, 56, 54, 58, 64, 62, 58, 60, 63, 66, 68, 60, 62, 65],
        'AD Tumbalarata': [53, 57, 55, 59, 65, 63, 59, 61, 64, 67, 69, 61, 63, 66],
        'UD LOS COYOTES': [50, 54, 52, 56, 62, 60, 56, 58, 61, 64, 66, 58, 60, 63],
        'FC JERICLES': [51, 55, 53, 57, 63, 61, 57, 59, 62, 65, 67, 59, 61, 64],
        'CF La Mandanga': [48, 52, 50, 54, 60, 58, 54, 56, 59, 62, 64, 56, 58, 61],
        'CD Espinetes Fighters': [49, 53, 51, 55, 61, 59, 55, 57, 60, 63, 65, 57, 59, 62]
      };

      for (const team of teams) {
        for (let matchday = 1; matchday <= 14; matchday++) {
          const points = scores[team][matchday - 1];
          await fantasyQueries.addScore(team, matchday, points);
        }
      }
      results.fantasy = { created: true, teams: teams.length, matchdays: 14 };
    } else {
      results.fantasy = { created: false, message: `Ja hi ha ${existingTeams.length} equips` };
    }

    res.json({
      success: true,
      message: 'Base de dades inicialitzada correctament',
      results
    });
  } catch (error) {
    console.error('Error inicialitzant BD:', error);
    res.status(500).json({
      success: false,
      error: 'Error inicialitzant base de dades',
      details: error.message
    });
  }
});

export default router;
