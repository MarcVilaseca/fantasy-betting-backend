import pkg from 'pg';
const { Pool } = pkg;

// CONFIGURACIÓ INTEL·LIGENT:
// 1. Si existeix DATABASE_URL (Render), utilitza la del núvol.
// 2. Si no (Local), utilitza la teva local amb la contrasenya 'Disbauxa2001'.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting';

// Detectar si estem a producció (Render)
const isProduction = !!process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Helper per executar queries
async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helpers per compatibilitat amb el codi existent
async function run(sql, params = []) {
  const result = await query(sql, params);
  return {
    lastInsertRowid: result.rows[0]?.id,
    changes: result.rowCount
  };
}

async function get(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0];
}

async function all(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

// Inicialització de taules
export async function initDatabase() {
  try {
    await query(\
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        coins NUMERIC(10,2) DEFAULT 1000,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \);

    await query(\
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        team1 VARCHAR(255) NOT NULL,
        team2 VARCHAR(255) NOT NULL,
        round VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        score_team1 INTEGER,
        score_team2 INTEGER,
        betting_closes_at TIMESTAMP NOT NULL,
        result_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team1, team2, round)
      )
    \);

    await query(\
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        bet_type VARCHAR(50) NOT NULL,
        selection TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        odds NUMERIC(10,2) NOT NULL,
        potential_return NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        result VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \);

    await query(\
      CREATE TABLE IF NOT EXISTS parlay_bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        total_odds NUMERIC(10,2) NOT NULL,
        potential_return NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        result VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \);

    await query(\
      CREATE TABLE IF NOT EXISTS parlay_bet_items (
        id SERIAL PRIMARY KEY,
        parlay_bet_id INTEGER NOT NULL REFERENCES parlay_bets(id) ON DELETE CASCADE,
        bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE
      )
    \);

    await query(\
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \);

    await query(\
      CREATE TABLE IF NOT EXISTS fantasy_scores (
        id SERIAL PRIMARY KEY,
        team VARCHAR(255) NOT NULL,
        matchday INTEGER NOT NULL,
        points NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team, matchday)
      )
    \);

    console.log('✅ Base de dades PostgreSQL inicialitzada correctament');
  } catch (error) {
    console.error('❌ Error en inicialitzar base de dades:', error);
    throw error;
  }
}

export const userQueries = {
  create: async (username, password, isAdmin) => {
    const result = await query(
      'INSERT INTO users (username, password, is_admin) VALUES (, , ) RETURNING id',
      [username, password, isAdmin]
    );
    return { lastInsertRowid: result.rows[0].id };
  },
  findByUsername: async (username) => get('SELECT * FROM users WHERE username = ', [username]),
  findById: async (id) => get('SELECT * FROM users WHERE id = ', [id]),
  updateCoins: async (coins, id) => {
    const result = await query('UPDATE users SET coins =  WHERE id = ', [coins, id]);
    return { changes: result.rowCount };
  },
  getAll: async () => all('SELECT id, username, coins, is_admin, created_at FROM users ORDER BY coins DESC')
};

export const matchQueries = {
  create: async (team1, team2, round, bettingClosesAt) => {
    const result = await query(
      'INSERT INTO matches (team1, team2, round, betting_closes_at) VALUES (, , , ) RETURNING id',
      [team1, team2, round, bettingClosesAt]
    );
    return { lastInsertRowid: result.rows[0].id };
  },
  findById: async (id) => get('SELECT * FROM matches WHERE id = ', [id]),
  getOpen: async () => all(\SELECT * FROM matches WHERE status = 'open' AND betting_closes_at > NOW() ORDER BY betting_closes_at ASC\),
  getAll: async () => all('SELECT * FROM matches ORDER BY created_at DESC'),
  updateStatus: async (status, id) => {
    const result = await query('UPDATE matches SET status =  WHERE id = ', [status, id]);
    return { changes: result.rowCount };
  },
  setResult: async (scoreTeam1, scoreTeam2, id) => {
    const result = await query(
      \UPDATE matches SET score_team1 = , score_team2 = , status = 'finished', result_date = CURRENT_TIMESTAMP WHERE id = \,
      [scoreTeam1, scoreTeam2, id]
    );
    return { changes: result.rowCount };
  },
  delete: async (id) => {
    const result = await query('DELETE FROM matches WHERE id = ', [id]);
    return { changes: result.rowCount };
  }
};

export const betQueries = {
  create: async (userId, matchId, betType, selection, amount, odds, potentialReturn) => {
    const result = await query(
      \INSERT INTO bets (user_id, match_id, bet_type, selection, amount, odds, potential_return) VALUES (, , , , , , ) RETURNING id\,
      [userId, matchId, betType, selection, amount, odds, potentialReturn]
    );
    return { lastInsertRowid: result.rows[0].id };
  },
  findById: async (id) => get('SELECT * FROM bets WHERE id = ', [id]),
  getByUser: async (userId) => all(\SELECT b.*, m.team1, m.team2, m.round, m.status as match_status, m.score_team1, m.score_team2 FROM bets b JOIN matches m ON b.match_id = m.id WHERE b.user_id =  ORDER BY b.created_at DESC\, [userId]),
  getByMatch: async (matchId) => all(\SELECT b.*, u.username FROM bets b JOIN users u ON b.user_id = u.id WHERE b.match_id = \, [matchId]),
  updateStatus: async (status, result, id) => {
    const res = await query('UPDATE bets SET status = , result =  WHERE id = ', [status, result, id]);
    return { changes: res.rowCount };
  },
  getPending: async () => all('SELECT * FROM bets WHERE status = ', ['pending']),
  getAllPublic: async () => all(\SELECT b.*, u.username, m.team1, m.team2, m.round, m.status as match_status FROM bets b JOIN users u ON b.user_id = u.id JOIN matches m ON b.match_id = m.id WHERE b.status = 'pending' AND b.amount > 0 ORDER BY b.created_at DESC\),
  delete: async (id) => {
    const result = await query('DELETE FROM bets WHERE id = ', [id]);
    return { changes: result.rowCount };
  }
};

export const parlayQueries = {
  create: async (userId, amount, totalOdds, potentialReturn) => {
    const result = await query(
      \INSERT INTO parlay_bets (user_id, amount, total_odds, potential_return) VALUES (, , , ) RETURNING id\,
      [userId, amount, totalOdds, potentialReturn]
    );
    return { lastInsertRowid: result.rows[0].id };
  },
  addItem: async (parlayBetId, betId) => {
    const result = await query(
      'INSERT INTO parlay_bet_items (parlay_bet_id, bet_id) VALUES (, ) RETURNING id',
      [parlayBetId, betId]
    );
    return { lastInsertRowid: result.rows[0].id };
  },
  getByUser: async (userId) => all('SELECT * FROM parlay_bets WHERE user_id =  ORDER BY created_at DESC', [userId]),
  getItems: async (parlayBetId) => all(\SELECT b.*, m.team1, m.team2 FROM parlay_bet_items pbi JOIN bets b ON pbi.bet_id = b.id JOIN matches m ON b.match_id = m.id WHERE pbi.parlay_bet_id = \, [parlayBetId]),
  findById: async (id) => get('SELECT * FROM parlay_bets WHERE id = ', [id]),
  updateStatus: async (status, result, id) => {
    const res = await query('UPDATE parlay_bets SET status = , result =  WHERE id = ', [status, result, id]);
    return { changes: res.rowCount };
  },
  delete: async (id) => {
    const result = await query('DELETE FROM parlay_bets WHERE id = ', [id]);
    return { changes: result.rowCount };
  }
};

export const transactionQueries = {
  create: async (userId, amount, type, description) => {
    const result = await query(
      \INSERT INTO transactions (user_id, amount, type, description) VALUES (, , , ) RETURNING id\,
      [userId, amount, type, description]
    );
    return { lastInsertRowid: result.rows[0].id };
  },
  getByUser: async (userId) => all('SELECT * FROM transactions WHERE user_id =  ORDER BY created_at DESC LIMIT 50', [userId])
};

export const fantasyQueries = {
  addScore: async (team, matchday, points) => {
    const result = await query(
      \INSERT INTO fantasy_scores (team, matchday, points) VALUES (, , ) ON CONFLICT (team, matchday) DO UPDATE SET points =  RETURNING id\,
      [team, matchday, points]
    );
    return { lastInsertRowid: result.rows[0].id };
  },
  getByMatchday: async (matchday) => all('SELECT * FROM fantasy_scores WHERE matchday =  ORDER BY points DESC', [matchday]),
  getAllScores: async () => all('SELECT * FROM fantasy_scores ORDER BY matchday ASC, points DESC'),
  getClassification: async () => all(\SELECT team, SUM(points) as total_points FROM fantasy_scores GROUP BY team ORDER BY total_points DESC\),
  getTeamHistory: async (team) => all('SELECT * FROM fantasy_scores WHERE team =  ORDER BY matchday ASC', [team])
};

export { pool };
export default pool;
