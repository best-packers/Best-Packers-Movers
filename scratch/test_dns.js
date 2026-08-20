const dns = require('dns').promises;

async function checkDns() {
  try {
    const result = await dns.lookup('db.gtbqvigqoggwlvpthsoe.supabase.co', { all: true });
    console.log('DNS lookup result for db.gtbqvigqoggwlvpthsoe.supabase.co:', result);
  } catch (e) {
    console.log('DNS lookup error:', e.message);
  }
}

checkDns();
