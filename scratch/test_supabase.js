const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing direct PostgreSQL client connection...');
  const client = new Client({
    host: 'db.gtbqvigqoggwlvpthsoe.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'BestPackerMovers9835',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Direct connection was successful!');
    await client.end();
  } catch (err) {
    console.error('❌ Direct connection failed:', err.message);
  }
}

testConnection();
