import pkg from 'pg';
const { Pool } = pkg;

// CONFIGURACIÓ INTEL·LIGENT:
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting';
const isProduction = !!process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helpers
async function run(sql, params = []) { const r = await query(sql, params); return { lastInsertRowid: r.rows[0]?.id, changes: r.rowCount }; }
async function get(sql, params = []) { const r = await query(sql, params); return r.rows[0]; }
async function all(sql, params = []) { const r = await query(sql, params); return r.rows; }

// --- INICIALITZACIÓ DE TAULES ---
export async function initDatabase() {
  try {
    // Nota: Utilitzem cometes dobles normals per evitar problemes
    await query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password TEXT NOT NULL, coins NUMERIC(10,2) DEFAULT 1000, is_admin BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    await query("CREATE TABLE IF NOT EXISTS matches (id SERIAL PRIMARY KEY, team1 VARCHAR(255) NOT NULL, team2 VARCHAR(255) NOT NULL, round VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT 'open', score_team1 INTEGER, score_team2 INTEGER, betting_closes_at TIMESTAMP NOT NULL, result_date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(team1, team2, round))");
    
    await query("CREATE TABLE IF NOT EXISTS bets (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE, bet_type VARCHAR(50) NOT NULL, selection TEXT NOT NULL, amount NUMERIC(10,2) NOT NULL, odds NUMERIC(10,2) NOT NULL, potential_return NUMERIC(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'pending', result VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    await query("CREATE TABLE IF NOT EXISTS parlay_bets (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, amount NUMERIC(10,2) NOT NULL, total_odds NUMERIC(10,2) NOT NULL, potential_return NUMERIC(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'pending', result VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    await query("CREATE TABLE IF NOT EXISTS parlay_bet_items (id SERIAL PRIMARY KEY, parlay_bet_id INTEGER NOT NULL REFERENCES parlay_bets(id) ON DELETE CASCADE, bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE)");
    
    await query("CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, amount NUMERIC(10,2) NOT NULL, type VARCHAR(100) NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    await query("CREATE TABLE IF NOT EXISTS fantasy_scores (id SERIAL PRIMARY KEY, team VARCHAR(255) NOT NULL, matchday INTEGER NOT NULL, points NUMERIC(10,2) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(team, matchday))");

    console.log('✅ Base de dades PostgreSQL inicialitzada correctament');
  } catch (error) {
    console.error('❌ Error en inicialitzar base de dades:', error);
    throw error;
  }
}

// --- QUERIES ---

export const userQueries = {
  create: async (u, p, a) => { const r = await query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id', [u, p, a]); return { lastInsertRowid: r.rows[0].id }; },
  findByUsername: async (u) => get('SELECT * FROM users WHERE username = $1', [u]),
  findById: async (id) => get('SELECT * FROM users WHERE id = $1', [id]),
  updateCoins: async (c, id) => { const r = await query('UPDATE users SET coins = $1 WHERE id = $2', [c, id]); return { changes: r.rowCount }; },
  getAll: async () => all('SELECT id, username, coins, is_admin, created_at FROM users ORDER BY coins DESC')
};

export const matchQueries = {
  create: async (t1, t2, r, b) => { const res = await query('INSERT INTO matches (team1, team2, round, betting_closes_at) VALUES ($1, $2, $3, $4) RETURNING id', [t1, t2, r, b]); return { lastInsertRowid: res.rows[0].id }; },
  findById: async (id) => get('SELECT * FROM matches WHERE id = $1', [id]),
  getOpen: async () => all("SELECT * FROM matches WHERE status = 'open' AND betting_closes_at > NOW() ORDER BY betting_closes_at ASC"),
  getAll: async () => all('SELECT * FROM matches ORDER BY created_at DESC'),
  updateStatus: async (s, id) => { const r = await query('UPDATE matches SET status = $1 WHERE id = $2', [s, id]); return { changes: r.rowCount }; },
  setResult: async (s1, s2, id) => { const r = await query("UPDATE matches SET score_team1 = $1, score_team2 = $2, status = 'finished', result_date = CURRENT_TIMESTAMP WHERE id = $3", [s1, s2, id]); return { changes: r.rowCount }; },
  delete: async (id) => { const r = await query('DELETE FROM matches WHERE id = $1', [id]); return { changes: r.rowCount }; }
};

export const betQueries = {
  create: async (uid, mid, bt, s, a, o, pr) => { const r = await query('INSERT INTO bets (user_id, match_id, bet_type, selection, amount, odds, potential_return) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id', [uid, mid, bt, s, a, o, pr]); return { lastInsertRowid: r.rows[0].id }; },
  findById: async (id) => get('SELECT * FROM bets WHERE id = $1', [id]),
  getByUser: async (uid) => all('SELECT b.*, m.team1, m.team2, m.round, m.status as match_status, m.score_team1, m.score_team2 FROM bets b JOIN matches m ON b.match_id = m.id WHERE b.user_id = $1 ORDER BY b.created_at DESC', [uid]),
  getByMatch: async (mid) => all('SELECT b.*, u.username FROM bets b JOIN users u ON b.user_id = u.id WHERE b.match_id = $1', [mid]),
  updateStatus: async (s, r, id) => { const res = await query('UPDATE bets SET status = $1, result = $2 WHERE id = $3', [s, r, id]); return { changes: res.rowCount }; },
  getPending: async () => all("SELECT * FROM bets WHERE status = 'pending'"),
  getAllPublic: async () => all("SELECT b.*, u.username, m.team1, m.team2, m.round, m.status as match_status FROM bets b JOIN users u ON b.user_id = u.id JOIN matches m ON b.match_id = m.id WHERE b.status = 'pending' AND b.amount > 0 ORDER BY b.created_at DESC"),
  delete: async (id) => { const r = await query('DELETE FROM bets WHERE id = $1', [id]); return { changes: r.rowCount }; }
};

export const parlayQueries = {
  create: async (uid, a, to, pr) => { const r = await query('INSERT INTO parlay_bets (user_id, amount, total_odds, potential_return) VALUES ($1, $2, $3, $4) RETURNING id', [uid, a, to, pr]); return { lastInsertRowid: r.rows[0].id }; },
  addItem: async (pid, bid) => { const r = await query('INSERT INTO parlay_bet_items (parlay_bet_id, bet_id) VALUES ($1, $2) RETURNING id', [pid, bid]); return { lastInsertRowid: r.rows[0].id }; },
  getByUser: async (uid) => all('SELECT * FROM parlay_bets WHERE user_id = $1 ORDER BY created_at DESC', [uid]),
  getItems: async (pid) => all('SELECT b.*, m.team1, m.team2 FROM parlay_bet_items pbi JOIN bets b ON pbi.bet_id = b.id JOIN matches m ON b.match_id = m.id WHERE pbi.parlay_bet_id = $1', [pid]),
  findById: async (id) => get('SELECT * FROM parlay_bets WHERE id = $1', [id]),
  updateStatus: async (s, r, id) => { const res = await query('UPDATE parlay_bets SET status = $1, result = $2 WHERE id = $3', [s, r, id]); return { changes: res.rowCount }; },
  delete: async (id) => { const r = await query('DELETE FROM parlay_bets WHERE id = $1', [id]); return { changes: r.rowCount }; }
};

export const transactionQueries = {
  create: async (uid, a, t, d) => { const r = await query('INSERT INTO transactions (user_id, amount, type, description) VALUES ($1, $2, $3, $4) RETURNING id', [uid, a, t, d]); return { lastInsertRowid: r.rows[0].id }; },
  getByUser: async (uid) => all('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [uid])
};

export const fantasyQueries = {
  addScore: async (t, m, p) => { const r = await query('INSERT INTO fantasy_scores (team, matchday, points) VALUES ($1, $2, $3) ON CONFLICT (team, matchday) DO UPDATE SET points = $3 RETURNING id', [t, m, p]); return { lastInsertRowid: r.rows[0].id }; },
  getByMatchday: async (m) => all('SELECT * FROM fantasy_scores WHERE matchday = $1 ORDER BY points DESC', [m]),
  getAllScores: async () => all('SELECT * FROM fantasy_scores ORDER BY matchday ASC, points DESC'),
  getClassification: async () => all('SELECT team, SUM(points) as total_points FROM fantasy_scores GROUP BY team ORDER BY total_points DESC'),
  getTeamHistory: async (t) => all('SELECT * FROM fantasy_scores WHERE team = $1 ORDER BY matchday ASC', [t])
};

export { pool };
export default pool;
