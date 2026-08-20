const dns = require('dns').promises;
const { Client } = require('pg');

async function testPooler() {
  const poolerHost = 'aws-0-ap-south-1.pooler.supabase.com';
  console.log('Testing DNS lookup for pooler host:', poolerHost);
  const dnsRes = await dns.lookup(poolerHost, { all: true });
  console.log('DNS lookup result:', dnsRes);

  const client = new Client({
    host: poolerHost,
    port: 5432, // Session mode pooler
    user: 'postgres.gtbqvigqoggwlvpthsoe',
    password: 'BestPackerMovers9835',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Supabase IPv4 Pooler connection SUCCESSFUL!');
    const res = await client.query('SELECT count(*) as count FROM states');
    console.log('States in Supabase DB:', res.rows[0].count);
    await client.end();
  } catch (err) {
    console.log('❌ Pooler connect error:', err.message);
  }
}

testPooler();
