const { Client } = require('pg');

const projectRef = 'gtbqvigqoggwlvpthsoe';
const password = 'BestPackerMovers9835';

const regions = [
  'ap-south-1',       // Mumbai, India
  'ap-southeast-1',   // Singapore
  'ap-northeast-1',   // Tokyo
  'ap-northeast-2',   // Seoul
  'us-east-1',        // N. Virginia
  'us-west-1',        // N. California
  'eu-central-1',     // Frankfurt
  'eu-west-1',        // Ireland
  'eu-west-2',        // London
  'sa-east-1',        // São Paulo
  'ap-southeast-2'    // Sydney
];

async function checkPoolers() {
  console.log(`Checking Supabase Pooler connectivity for project ${projectRef}...`);
  
  // 1. First test direct host
  console.log('\nTesting direct host: db.' + projectRef + '.supabase.co:5432');
  try {
    const directClient = new Client({
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000
    });
    await directClient.connect();
    console.log('✅ Direct connection SUCCESSFUL!');
    const res = await directClient.query('SELECT count(*) FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('Tables count:', res.rows[0].count);
    await directClient.end();
    return;
  } catch (e) {
    console.log(`Direct connection failed: ${e.message}`);
  }

  // 2. Test poolers (port 6543 and 5432)
  for (const region of regions) {
    const poolerHost = `aws-0-${region}.pooler.supabase.com`;
    process.stdout.write(`Testing region ${region} (${poolerHost})... `);
    try {
      const client = new Client({
        host: poolerHost,
        port: 6543, // Transaction mode or 5432 Session mode
        user: `postgres.${projectRef}`,
        password: password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3500
      });
      await client.connect();
      console.log(`\n🎉 SUCCESS on ${region}!`);
      const res = await client.query('SELECT current_database(), current_user;');
      console.log('Query result:', res.rows[0]);
      await client.end();
      return `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${poolerHost}:6543/postgres`;
    } catch (err) {
      console.log(`Failed (${err.message})`);
    }
  }
}

checkPoolers().then(url => {
  if (url) {
    console.log('\n=============================================');
    console.log('Working Supabase DATABASE_URL:');
    console.log(url);
    console.log('=============================================');
  } else {
    console.log('\nCould not connect to Supabase (Project may be paused on free tier or credentials changed).');
  }
});
