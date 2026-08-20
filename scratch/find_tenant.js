const { Client } = require('pg');

const poolerRegions = [
  'ap-southeast-1',   // Singapore
  'ap-northeast-1',   // Tokyo
  'ap-northeast-2',   // Seoul
  'us-east-1',        // N. Virginia
  'us-east-2',        // Ohio
  'us-west-1',        // N. California
  'us-west-2',        // Oregon
  'eu-central-1',     // Frankfurt
  'eu-west-1',        // Ireland
  'eu-west-2',        // London
  'eu-west-3',        // Paris
  'eu-north-1',       // Stockholm
  'ap-south-1',       // Mumbai
  'ap-southeast-2',   // Sydney
  'ca-central-1',     // Central Canada
  'sa-east-1'         // São Paulo
];

async function scanRegions() {
  console.log('Scanning Supabase regions to locate tenant postgres.gtbqvigqoggwlvpthsoe...');
  for (const reg of poolerRegions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    const client = new Client({
      host: host,
      port: 5432,
      user: 'postgres.gtbqvigqoggwlvpthsoe',
      password: 'BestPackerMovers9835',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });
    try {
      await client.connect();
      console.log(`\n🎉 FOUND MATCH! Region: ${reg}`);
      console.log(`Host: ${host}`);
      const res = await client.query('SELECT count(*) as count FROM states');
      console.log('States count in DB:', res.rows[0].count);
      await client.end();
      return { region: reg, host: host };
    } catch (e) {
      if (e.message.includes('password authentication failed')) {
        console.log(`\n🎉 FOUND MATCH (auth check): Region ${reg} at ${host}!`);
        await client.end().catch(()=>{});
        return { region: reg, host: host };
      } else {
        console.log(`Region ${reg}: ${e.message.slice(0, 50)}...`);
      }
    }
  }
  console.log('Scan completed.');
}

scanRegions().then(match => {
  if (match) {
    console.log('\n======================================================');
    console.log('CORRECT SUPABASE DATABASE_URL (IPv4 & IPv6 Supported):');
    console.log(`postgresql://postgres.gtbqvigqoggwlvpthsoe:BestPackerMovers9835@${match.host}:5432/postgres`);
    console.log('======================================================\n');
  }
});
