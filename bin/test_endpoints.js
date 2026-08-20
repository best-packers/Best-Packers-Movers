const { db, initDb } = require('../config/db');

async function runTests() {
  console.log('=== STARTING AUTOMATED API ENDPOINT INTEGRATION TESTS ===');
  await initDb();

  
  try {
    // Test 1: Check DB Tables
    console.log('\n[Test 1] Verifying Database Schemas...');
    const hasUsers = await db.schema.hasTable('users');
    const hasReviews = await db.schema.hasTable('reviews');
    const hasSessions = await db.schema.hasTable('user_sessions');
    const hasActions = await db.schema.hasTable('user_actions');
    
    console.log(`- users table exists: ${hasUsers}`);
    console.log(`- reviews table exists: ${hasReviews}`);
    console.log(`- user_sessions table exists: ${hasSessions}`);
    console.log(`- user_actions table exists: ${hasActions}`);
    
    if (!hasReviews || !hasSessions || !hasActions) {
      throw new Error('Database schema verification failed. Missing tables.');
    }
    console.log('✅ Test 1 Passed!');

    // Test 2: Clean up previous test entries
    console.log('\n[Test 2] Cleaning up test data...');
    await db('reviews').where({ customer_name: 'Test Ramesh Customer' }).delete();
    await db('user_sessions').where({ phone: '9999999999' }).delete();
    await db('user_actions').where({ phone: '9999999999' }).delete();
    console.log('✅ Test 2 Passed!');

    // Test 3: Insert user_session
    console.log('\n[Test 3] Simulating OTP verification database insertion...');
    const [sessionIdObj] = await db('user_sessions').insert({
      phone: '9999999999',
      ip_address: '127.0.0.1',
      device_type: 'Desktop',
      state: 'Jharkhand',
      city: 'Dhanbad',
      locality: 'Kasturba Nagar'
    }).returning('id');
    const sessionId = typeof sessionIdObj === 'object' ? sessionIdObj.id : sessionIdObj;
    console.log(`- Seeded user session ID: ${sessionId}`);
    console.log('✅ Test 3 Passed!');

    // Test 4: Log User actions
    console.log('\n[Test 4] Logging simulated user clicks (call & website)...');
    await db('user_actions').insert([
      {
        session_id: sessionId,
        phone: '9999999999',
        action_type: 'call',
        vendor_id: 0, // National Packers
        target_url: null
      },
      {
        session_id: sessionId,
        phone: '9999999999',
        action_type: 'website',
        vendor_id: 0,
        target_url: 'https://www.thenationalpackersmovers.com/'
      }
    ]);
    console.log('✅ Test 4 Passed!');

    // Test 5: Post review under user session
    console.log('\n[Test 5] Simulating customer review submission...');
    await db('reviews').insert({
      vendor_id: 0,
      city_id: 1, // first seeded city
      customer_name: 'Test Ramesh Customer',
      rating: 5,
      review_text: 'Excellent test review for National Packers!',
      user_id: sessionId
    });
    console.log('✅ Test 5 Passed!');

    // Test 6: Verify joins & queries for Admin dashboard
    console.log('\n[Test 6] Verifying Admin Dashboard queries...');
    const reviews = await db('reviews')
      .leftJoin('vendors', 'reviews.vendor_id', '=', 'vendors.id')
      .leftJoin('cities', 'reviews.city_id', '=', 'cities.id')
      .leftJoin('user_sessions', 'reviews.user_id', '=', 'user_sessions.id')
      .where({ 'reviews.customer_name': 'Test Ramesh Customer' })
      .select('reviews.*', 'user_sessions.phone as phone')
      .first();
    
    console.log(`- Retrieved review: Rating=${reviews.rating}, Phone=${reviews.phone}, Comment="${reviews.review_text}"`);
    if (!reviews || reviews.rating !== 5 || reviews.phone !== '9999999999') {
      throw new Error('Join query validation failed.');
    }
    console.log('✅ Test 6 Passed!');

    // Test 7: Verify user log counters
    console.log('\n[Test 7] Verifying user logins list and action count aggregations...');
    const users = await db('user_sessions')
      .leftJoin('user_actions', 'user_sessions.id', '=', 'user_actions.session_id')
      .where({ 'user_sessions.phone': '9999999999' })
      .groupBy('user_sessions.id')
      .select('user_sessions.*')
      .count('user_actions.id as action_count')
      .first();
    
    console.log(`- User: phone=${users.phone}, locality=${users.locality}, click action count=${users.action_count}`);
    if (!users || parseInt(users.action_count, 10) < 2) {
      throw new Error('User audit aggregations failed.');
    }
    console.log('✅ Test 7 Passed!');

    // Clean up
    console.log('\nCleaning up integration test logs...');
    await db('reviews').where({ customer_name: 'Test Ramesh Customer' }).delete();
    await db('user_sessions').where({ phone: '9999999999' }).delete();
    await db('user_actions').where({ phone: '9999999999' }).delete();

    console.log('\n✨ ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ✨');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED WITH ERROR:', error);
    process.exit(1);
  }
}

runTests();
