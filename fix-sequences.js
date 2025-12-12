import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting';
const isProduction = !!process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

async function fixSequences() {
  try {
    console.log('🔧 Resincronitzant totes les seqüències PostgreSQL...\n');

    const sequences = [
      { table: 'users', sequence: 'users_id_seq' },
      { table: 'matches', sequence: 'matches_id_seq' },
      { table: 'bets', sequence: 'bets_id_seq' },
      { table: 'parlay_bets', sequence: 'parlay_bets_id_seq' },
      { table: 'parlay_bet_items', sequence: 'parlay_bet_items_id_seq' },
      { table: 'transactions', sequence: 'transactions_id_seq' },
      { table: 'fantasy_scores', sequence: 'fantasy_scores_id_seq' }
    ];

    for (const { table, sequence } of sequences) {
      const result = await pool.query(`
        SELECT setval('${sequence}', COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false);
      `);
      console.log(`✅ ${table}: Seqüència ajustada a ${result.rows[0].setval}`);
    }

    await pool.end();
    console.log('\n🎉 Totes les seqüències resincronitzades correctament!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSequences();
