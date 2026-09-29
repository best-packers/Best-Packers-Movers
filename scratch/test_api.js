const http = require('http');

async function testLead() {
  const postData = JSON.stringify({
    customer_name: 'Chetan Test Lead',
    customer_phone: '9835168368',
    from_city: 'Dhanbad',
    to_city: 'Kolkata',
    move_size: '2 BHK',
    source_page: '/services'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/leads',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('LEAD RESPONSE CODE:', res.statusCode);
      console.log('LEAD RESPONSE BODY:', data);
      testCrawler();
    });
  });

  req.on('error', (e) => console.error('LEAD ERROR:', e.message));
  req.write(postData);
  req.end();
}

async function testCrawler() {
  const postData = JSON.stringify({
    city_id: '62726e11-6ad8-431c-b363-f1f19e9d6815',
    city_name: 'Lucknow',
    state_name: 'Uttar Pradesh'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/crawler',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('CRAWLER RESPONSE CODE:', res.statusCode);
      console.log('CRAWLER RESPONSE BODY:', data);
    });
  });

  req.on('error', (e) => console.error('CRAWLER ERROR:', e.message));
  req.write(postData);
  req.end();
}

testLead();
