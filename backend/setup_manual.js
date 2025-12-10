import pkg from 'pg';
const { Client } = pkg;

console.log('⏳ Intentant connectar al servidor PostgreSQL...');

const client = new Client({
    connectionString: 'postgresql://postgres:Disbauxa2001@localhost:5432/postgres'
});

async function createDb() {
    try {
        await client.connect();
        console.log('✅ Connectat al servidor PostgreSQL!');
        
        // CORRECCIÓ: Utilitzem cometes dobles per evitar errors de sintaxi
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'fantasy_betting'");
        
        if (res.rowCount === 0) {
            console.log('🔨 La base de dades no existeix. Creant-la ara...');
            await client.query("CREATE DATABASE fantasy_betting");
            console.log('🎉 BASE DE DADES CREADA CORRECTAMENT!');
        } else {
            console.log('ℹ️ La base de dades ja existia.');
        }
    } catch (e) {
        console.error('❌ ERROR:', e.message);
    } finally {
        await client.end();
    }
}

createDb();
