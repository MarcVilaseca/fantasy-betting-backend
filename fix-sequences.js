import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting'
});

async function fixSequences() {
  try {
    // Reset transactions sequence
    const result = await pool.query(`
      SELECT setval('transactions_id_seq', COALESCE((SELECT MAX(id) FROM transactions), 0) + 1, false);
    `);
    console.log('✅ Seqüència de transactions resetejada:', result.rows[0]);

    // Reset bets sequence
    const result2 = await pool.query(`
      SELECT setval('bets_id_seq', COALESCE((SELECT MAX(id) FROM bets), 0) + 1, false);
    `);
    console.log('✅ Seqüència de bets resetejada:', result2.rows[0]);

    await pool.end();
    console.log('✅ Totes les seqüències resetejades correctament!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSequences();
