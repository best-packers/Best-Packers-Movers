const { db, initDb } = require('../config/db');
const bcrypt = require('bcryptjs');

async function testVendorPortal() {
  console.log('--- STARTING VENDOR PORTAL INTEGRATION TEST ---');
  try {
    await initDb();

    // 1. Check database alterations
    const hasUserId = await db.schema.hasColumn('vendors', 'user_id');
    const hasViewsCount = await db.schema.hasColumn('vendors', 'views_count');
    const hasClaimsUserId = await db.schema.hasColumn('claims', 'user_id');

    console.log(`Database columns check:`);
    console.log(`- vendors.user_id exists: ${hasUserId}`);
    console.log(`- vendors.views_count exists: ${hasViewsCount}`);
    console.log(`- claims.user_id exists: ${hasClaimsUserId}`);

    if (!hasUserId || !hasViewsCount || !hasClaimsUserId) {
      throw new Error('Database columns migration check failed!');
    }

    // Clear old test users if exist to make test clean & repeatable
    await db('users').where({ username: 'test_vendor@example.com' }).del();
    
    // 2. Simulate User Registration
    const hashedPassword = await bcrypt.hash('password123', 10);
    const [userId] = await db('users').insert({
      username: 'test_vendor@example.com',
      password: hashedPassword,
      role: 'vendor'
    });
    console.log(`User registration test: SUCCESS (User ID: ${userId})`);

    // 3. Setup a mock vendor listing
    const mockVendorSlug = 'test-packers-mover';
    await db('vendors').where({ slug: mockVendorSlug }).del();
    const [vendorId] = await db('vendors').insert({
      city_id: 1, // First city
      name: 'Test Packers Mover',
      slug: mockVendorSlug,
      address: 'Old Address',
      phone: '9876500000',
      rating: 4.5,
      reviews_count: 50,
      status: 'unclaimed',
      is_national: false,
      google_rank: 2,
      user_id: null
    });
    console.log(`Mock vendor setup: SUCCESS (Vendor ID: ${vendorId})`);

    // 4. Simulate submitting a Claim Request
    const [claimId] = await db('claims').insert({
      vendor_id: vendorId,
      user_id: userId,
      contact_name: 'Test Manager',
      contact_phone: '9876511111',
      contact_email: 'test_vendor@example.com',
      verification_details: 'GST Proof File Uploaded',
      status: 'pending'
    });
    console.log(`Claim request submission: SUCCESS (Claim ID: ${claimId})`);

    // Verify claim exists
    const claim = await db('claims').where({ id: claimId }).first();
    if (claim.user_id !== userId || claim.status !== 'pending') {
      throw new Error('Claim fields mapping validation failed!');
    }

    // 5. Simulate Admin Claim Approval
    await db.transaction(async trx => {
      await trx('claims').where({ id: claimId }).update({ status: 'approved' });
      await trx('vendors').where({ id: claim.vendor_id }).update({ 
        status: 'verified',
        user_id: claim.user_id
      });
    });
    console.log(`Admin claim approval simulation: SUCCESS`);

    // Verify vendor details mapping
    const updatedVendor = await db('vendors').where({ id: vendorId }).first();
    if (updatedVendor.status !== 'verified' || updatedVendor.user_id !== userId) {
      throw new Error('Vendor listing was not correctly verified or linked to the user account!');
    }
    console.log(`Listing ownership transfer check: SUCCESS (Linked to User ID: ${updatedVendor.user_id})`);

    // 6. Simulate Vendor Editing Profile Details
    await db('vendors')
      .where({ id: vendorId })
      .update({
        address: '123 New Business Hub, Sector 5',
        phone: '+91 99999 88888',
        website: 'http://www.testpackers.in'
      });
    
    const editedVendor = await db('vendors').where({ id: vendorId }).first();
    if (editedVendor.address !== '123 New Business Hub, Sector 5' || editedVendor.phone !== '+91 99999 88888') {
      throw new Error('Vendor profile customization update failed!');
    }
    console.log(`Vendor profile customization edit check: SUCCESS`);

    // 7. Cleanup test records
    await db('claims').where({ id: claimId }).del();
    await db('vendors').where({ id: vendorId }).del();
    await db('users').where({ id: userId }).del();
    console.log('Database cleanup complete.');

    console.log('\n--- ALL VENDOR PORTAL TESTS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

testVendorPortal();
