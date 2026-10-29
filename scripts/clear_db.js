const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');

const rawUrl = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
console.log('Connecting to DATABASE_URL...');

const pool = new Pool({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false },
});

async function clearDatabase() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = res.rows.map(r => r.table_name);
    console.log('Found tables in DB:', tables);

    const appTables = tables.filter(t => !t.startsWith('_prisma') && !t.startsWith('pg_'));
    console.log('App tables to clear:', appTables);

    if (appTables.length > 0) {
      const truncateList = appTables.map(t => `"${t}"`).join(', ');
      await pool.query(`TRUNCATE TABLE ${truncateList} CASCADE;`);
      console.log('SUCCESS: All application tables truncated! Database is completely fresh.');
    } else {
      console.log('No tables found to clear.');
    }
  } catch (err) {
    console.error('Error during database truncation:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

clearDatabase();
