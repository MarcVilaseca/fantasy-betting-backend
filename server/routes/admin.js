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
        'Nottingham_Pressa',
        'Jornada 18',
        new Date('2025-01-17T20:59:00')
      );
      results.matches.push('Jaume Creixell U.E. vs Nottingham_Pressa');
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
        'Nottingham_Pressa',
        'AstoNitu F.C',
        'Ruizinho F. C.',
        'Laminyamal T\'FC',
        'SANCOTS 304',
        'pepe rubianes',
        'ArnauBabau F.C',
        'jaaavichu05',
        'Ao Tat Kha FC',
        'Catllaneta',
        'Babycots F.C'
      ];

      const scores = {
        'Jaume Creixell U.E.': [85, 100, 60, 75, 64, 88, 73, 62, 68, 52, 80, 82, 67, 67],
        "L'ESQUADRA VILAS...": [69, 90, 65, 70, 71, 71, 85, 47, 64, 61, 85, 64, 65, 41],
        'CE FerranitoPito': [86, 51, 91, 35, 72, 61, 80, 38, 73, 49, 83, 80, 61, 86],
        'Nottingham_Pressa': [73, 64, 57, 72, 69, 48, 54, 34, 71, 53, 71, 82, 63, 82],
        'AstoNitu F.C': [63, 58, 44, 77, 57, 51, 53, 61, 70, 61, 60, 89, 41, 87],
        'Ruizinho F. C.': [47, 59, 51, 80, 52, 54, 70, 40, 86, 76, 44, 27, 65, 79],
        'Laminyamal T\'FC': [52, 84, 73, 58, 74, 52, 60, 27, 60, 32, 80, 57, 46, 45],
        'SANCOTS 304': [53, 51, 69, 25, 56, 37, 47, 21, 67, 68, 77, 73, 81, 58],
        'pepe rubianes': [71, 43, 50, 59, 0, 83, 61, 53, 60, 83, 77, 55, 67, 65],
        'ArnauBabau F.C': [65, 31, 54, 49, 70, 43, 40, 42, 74, 59, 67, 60, 77, 48],
        'jaaavichu05': [60, 51, 80, 52, 45, 64, 55, 59, 74, 49, 34, 60, 33, 47],
        'Ao Tat Kha FC': [34, 47, 37, 43, 23, 39, 60, 56, 44, 70, 72, 40, 50, 62],
        'Catllaneta': [50, 68, 42, 20, 47, 63, 31, 46, 42, 40, 63, 53, 45, 65],
        'Babycots F.C': [47, 39, 35, 54, 52, 44, 21, 66, 70, 53, 64, 43, 57, 55]
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
