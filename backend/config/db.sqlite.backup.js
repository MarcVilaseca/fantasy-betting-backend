import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear/obrir base de dades
const dbPath = join(__dirname, '../fantasy-betting.db');
const db = new sqlite3.Database(dbPath);

// Helper per promisificar queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Crear taules
export async function initDatabase() {
  try {
    // Habilitar foreign keys
    await run('PRAGMA foreign_keys = ON');

    // Taula d'usuaris
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        coins REAL DEFAULT 1000,
        is_admin BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Taula de duels/partits
    await run(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team1 TEXT NOT NULL,
        team2 TEXT NOT NULL,
        round TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        score_team1 INTEGER,
        score_team2 INTEGER,
        betting_closes_at DATETIME NOT NULL,
        result_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team1, team2, round)
      )
    `);

    // Taula d'apostes
    await run(`
      CREATE TABLE IF NOT EXISTS bets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        match_id INTEGER NOT NULL,
        bet_type TEXT NOT NULL,
        selection TEXT NOT NULL,
        amount REAL NOT NULL,
        odds REAL NOT NULL,
        potential_return REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
      )
    `);

    // Taula per apostes combinades
    await run(`
      CREATE TABLE IF NOT EXISTS parlay_bets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        total_odds REAL NOT NULL,
        potential_return REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Relació apostes combinades - apostes individuals
    await run(`
      CREATE TABLE IF NOT EXISTS parlay_bet_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parlay_bet_id INTEGER NOT NULL,
        bet_id INTEGER NOT NULL,
        FOREIGN KEY (parlay_bet_id) REFERENCES parlay_bets(id) ON DELETE CASCADE,
        FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE
      )
    `);

    // Taula d'historial de transaccions
    await run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Taula de classificació fantasy
    await run(`
      CREATE TABLE IF NOT EXISTS fantasy_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team TEXT NOT NULL,
        matchday INTEGER NOT NULL,
        points REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team, matchday)
      )
    `);

    console.log('✅ Base de dades inicialitzada correctament');
  } catch (error) {
    console.error('❌ Error en inicialitzar base de dades:', error);
    throw error;
  }
}

// Funcions auxiliars per gestionar usuaris
export const userQueries = {
  create: async (username, password, isAdmin) =>
    run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', [username, password, isAdmin]),

  findByUsername: async (username) =>
    get('SELECT * FROM users WHERE username = ?', [username]),

  findById: async (id) =>
    get('SELECT * FROM users WHERE id = ?', [id]),

  updateCoins: async (coins, id) =>
    run('UPDATE users SET coins = ? WHERE id = ?', [coins, id]),

  getAll: async () =>
    all('SELECT id, username, coins, is_admin, created_at FROM users ORDER BY coins DESC')
};

// Funcions per gestionar partits
export const matchQueries = {
  create: async (team1, team2, round, bettingClosesAt) =>
    run('INSERT INTO matches (team1, team2, round, betting_closes_at) VALUES (?, ?, ?, ?)',
      [team1, team2, round, bettingClosesAt]),

  findById: async (id) =>
    get('SELECT * FROM matches WHERE id = ?', [id]),

  getOpen: async () =>
    all(`SELECT * FROM matches
         WHERE status = 'open' AND datetime(betting_closes_at) > datetime('now')
         ORDER BY betting_closes_at ASC`),

  getAll: async () =>
    all('SELECT * FROM matches ORDER BY created_at DESC'),

  updateStatus: async (status, id) =>
    run('UPDATE matches SET status = ? WHERE id = ?', [status, id]),

  setResult: async (scoreTeam1, scoreTeam2, id) =>
    run(`UPDATE matches
         SET score_team1 = ?, score_team2 = ?, status = 'finished', result_date = CURRENT_TIMESTAMP
         WHERE id = ?`, [scoreTeam1, scoreTeam2, id]),

  delete: async (id) =>
    run('DELETE FROM matches WHERE id = ?', [id]),

  delete: async (id) =>
    run('DELETE FROM matches WHERE id = ?', [id])
};

// Funcions per gestionar apostes
export const betQueries = {
  create: async (userId, matchId, betType, selection, amount, odds, potentialReturn) =>
    run(`INSERT INTO bets (user_id, match_id, bet_type, selection, amount, odds, potential_return)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, matchId, betType, selection, amount, odds, potentialReturn]),

  findById: async (id) =>
    get('SELECT * FROM bets WHERE id = ?', [id]),

  getByUser: async (userId) =>
    all(`SELECT b.*, m.team1, m.team2, m.round, m.status as match_status, m.score_team1, m.score_team2
         FROM bets b
         JOIN matches m ON b.match_id = m.id
         WHERE b.user_id = ?
         ORDER BY b.created_at DESC`, [userId]),

  getByMatch: async (matchId) =>
    all(`SELECT b.*, u.username
         FROM bets b
         JOIN users u ON b.user_id = u.id
         WHERE b.match_id = ?`, [matchId]),

  updateStatus: async (status, result, id) =>
    run('UPDATE bets SET status = ?, result = ? WHERE id = ?', [status, result, id]),

  getPending: async () =>
    all('SELECT * FROM bets WHERE status = \'pending\''),

  getAllPublic: async () =>
    all(`SELECT b.*, u.username, m.team1, m.team2, m.round, m.status as match_status
         FROM bets b
         JOIN users u ON b.user_id = u.id
         JOIN matches m ON b.match_id = m.id
         WHERE b.status = 'pending' AND b.amount > 0
         ORDER BY b.created_at DESC`),

  delete: async (id) =>
    run('DELETE FROM bets WHERE id = ?', [id])
};

// Funcions per apostes combinades
export const parlayQueries = {
  create: async (userId, amount, totalOdds, potentialReturn) =>
    run(`INSERT INTO parlay_bets (user_id, amount, total_odds, potential_return)
         VALUES (?, ?, ?, ?)`, [userId, amount, totalOdds, potentialReturn]),

  addItem: async (parlayBetId, betId) =>
    run('INSERT INTO parlay_bet_items (parlay_bet_id, bet_id) VALUES (?, ?)', [parlayBetId, betId]),

  getByUser: async (userId) =>
    all('SELECT * FROM parlay_bets WHERE user_id = ? ORDER BY created_at DESC', [userId]),

  getItems: async (parlayBetId) =>
    all(`SELECT b.*, m.team1, m.team2
         FROM parlay_bet_items pbi
         JOIN bets b ON pbi.bet_id = b.id
         JOIN matches m ON b.match_id = m.id
         WHERE pbi.parlay_bet_id = ?`, [parlayBetId]),

  findById: async (id) =>
    get('SELECT * FROM parlay_bets WHERE id = ?', [id]),

  updateStatus: async (status, result, id) =>
    run('UPDATE parlay_bets SET status = ?, result = ? WHERE id = ?', [status, result, id]),

  delete: async (id) =>
    run('DELETE FROM parlay_bets WHERE id = ?', [id])
};

// Funcions per transaccions
export const transactionQueries = {
  create: async (userId, amount, type, description) =>
    run(`INSERT INTO transactions (user_id, amount, type, description)
         VALUES (?, ?, ?, ?)`, [userId, amount, type, description]),

  getByUser: async (userId) =>
    all('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId])
};

// Funcions per classificació fantasy
export const fantasyQueries = {
  addScore: async (team, matchday, points) =>
    run(`INSERT OR REPLACE INTO fantasy_scores (team, matchday, points)
         VALUES (?, ?, ?)`, [team, matchday, points]),

  getByMatchday: async (matchday) =>
    all('SELECT * FROM fantasy_scores WHERE matchday = ? ORDER BY points DESC', [matchday]),

  getAllScores: async () =>
    all('SELECT * FROM fantasy_scores ORDER BY matchday ASC, points DESC'),

  getClassification: async () =>
    all(`SELECT team,
               SUM(points) as total_points,
               COUNT(*) as matchdays_played
         FROM fantasy_scores
         GROUP BY team
         ORDER BY total_points DESC`),

  getTeamHistory: async (team) =>
    all('SELECT * FROM fantasy_scores WHERE team = ? ORDER BY matchday ASC', [team])
};

export default db;
