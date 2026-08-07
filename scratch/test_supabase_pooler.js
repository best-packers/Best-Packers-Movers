const { Client } = require('pg');

async function testConnectionPooler() {
  console.log('Testing IPv4 Connection Pooler (Pgbouncer) on port 6543...');
  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.glbqvigqoggwlvpthsoe',
    password: 'BestPackerMovers9835',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connection Pooler connection was successful!');
    await client.end();
  } catch (err) {
    console.error('❌ Connection Pooler connection failed:', err.message);
  }
}

testConnectionPooler();
