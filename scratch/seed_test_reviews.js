const { db } = require('../config/db');

async function seedTestReviews() {
  console.log('Seeding premium test reviews for National Packers & Movers in Dhanbad...');
  
  try {
    const dhanbad = await db('cities').where({ slug: 'dhanbad' }).first();
    if (!dhanbad) {
      console.error('Error: Dhanbad city not found in the database. Run seed script first.');
      process.exit(1);
    }
    console.log(`Found Dhanbad city record with ID: ${dhanbad.id}`);

    // Insert 3 premium reviews for National Packers (vendor_id = 0) in Dhanbad
    const reviewsToSeed = [
      {
        vendor_id: 0,
        city_id: dhanbad.id,
        customer_name: 'Rajesh Mishra',
        rating: 5,
        review_text: 'I hired National Packers for my relocation from Dhanbad to Ranchi. The team arrived on time, packed all items securely with bubble wrap, and delivered without a single scratch. Excellent service!'
      },
      {
        vendor_id: 0,
        city_id: dhanbad.id,
        customer_name: 'Anjali Sharma',
        rating: 5,
        review_text: 'Highly professional movers. Their household packing and car transportation services are top-notch. Transit insurance was also provided. Very happy with their polite behavior.'
      },
      {
        vendor_id: 0,
        city_id: dhanbad.id,
        customer_name: 'Vikram Singh',
        rating: 5,
        review_text: 'Best shifting experience in Dhanbad. Low prices and super fast delivery. Recommended to anyone looking for hassle-free packers and movers.'
      }
    ];

    for (const rev of reviewsToSeed) {
      // Check if already exists to avoid duplicates
      const exists = await db('reviews').where({
        customer_name: rev.customer_name,
        vendor_id: 0,
        city_id: dhanbad.id
      }).first();
      
      if (!exists) {
        await db('reviews').insert(rev);
        console.log(`Inserted review from ${rev.customer_name}`);
      } else {
        console.log(`Review from ${rev.customer_name} already exists.`);
      }
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedTestReviews();
