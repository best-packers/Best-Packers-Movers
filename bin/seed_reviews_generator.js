const { db, initDb } = require('../config/db');

const INDIAN_NAMES = [
  "Ramesh Kumar", "Suresh Sharma", "Amit Patel", "Priya Singh", "Anjali Mehta",
  "Rajesh Mishra", "Sunita Rao", "Deepak Gupta", "Vikram Sen", "Neha Verma",
  "Sanjay Joshi", "Rohan Das", "Pooja Trivedi", "Siddharth Roy", "Arjun Nair",
  "Karan Malhotra", "Divya Reddy", "Manoj Pandey", "Swati Bose", "Alok Dwivedi",
  "Rahul Yadav", "Preeti Saxena", "Manish Choudhury", "Jyoti Mishra", "Sandip Ghosh",
  "Abhishek Sharma", "Aditi Rao", "Gaurav Sinha", "Ritu Phogat", "Harish Kumar",
  "Vikas Dubey", "Meera Nair", "Vijay Iyer", "Rashmi Bhat", "Srinivas Rao",
  "Prakash Mishra", "Suman Lata", "Kishore Dey", "Tushar Kapoor", "Sunil Dutt"
];

const TEMPLATES_5_STAR = [
  "I hired this team for my home relocation services in {city}. The crew arrived exactly on time, packed all my household shifting items with bubble wrap, and delivered them safely. Best packers movers {city} by far!",
  "Highly professional service for packers and movers in {city}. They provided transit insurance for household shifting {city} which gave me peace of mind. Very polite workers.",
  "Excellent office shifting experience. They are the budget packers and movers for office shifting in {city} that I was looking for. No items were damaged during local shifting.",
  "If you want the safest household goods transportation in {city}, call them. They handled my premium wooden furniture with great care. Outstanding transit support.",
  "Very reliable packers and movers for home shifting in {city}. Shifting charges were transparent with no hidden costs. Completely hassle-free move.",
  "Best household shifting in {city}! The packers packed my entire double bedroom set within 3 hours. Fast and cheap local shifting charges in {city}.",
  "Wonderful car carrier and bike moving in {city}. They transported my Royal Enfield motorcycle without a single scratch. Five stars for reliable packers and movers in {city}.",
  "Perfect experience relocating from {city}. Their staff was courteous and wore proper uniforms. Top rated packers and movers {city} review from my side!",
  "Highly recommended for home shifting services in {city}. All fragile glass items and kitchenware were double-packed. Excellent rates.",
  "Really impressed by their household relocation speed. Hired them for local shifting in {city} and they completed it within half a day. Very efficient."
];

const TEMPLATES_4_STAR = [
  "Good experience with packers and movers in {city}. Packing was decent and delivery was on time. Shifting charges were also reasonable.",
  "Satisfied with their home relocation services in {city}. The team was polite, though they arrived 30 minutes late. Overall good value.",
  "Decent household shifting in {city}. The packing quality of cartoon boxes was robust. Shifting from {city} went smoothly.",
  "Reliable packers and movers for home shifting in {city}. Safe transportation of items. Some minor delays in unloading but resolved well.",
  "Used their services for local shifting in {city}. Overall service was quick and goods arrived safely. Recommended for shifting chores.",
  "Fair pricing and professional handling. Decent transit insurance options for household shifting {city} relocations.",
  "They did a good job moving my 2 BHK flat. Good packers and movers in {city} with supportive customer care support.",
  "Shifting charges in {city} were quite affordable. Packing of electronic items was handled with care."
];

const TEMPLATES_3_STAR = [
  "Average experience. Shifting took longer than expected due to local traffic. Packing quality was just okay.",
  "Decent packers and movers in {city} but communication could be improved. Some minor scratches on my washing machine.",
  "Price was cheap for home shifting in {city}, but the unloading took too much time. Decent for low budget shifting."
];

const NATIONAL_TEMPLATES_5_STAR = [
  "National Packers & Movers provided the best household shifting in {city}! Their pricing was transparent, and the packing team was extremely professional. Recommended for home shifting services in {city}.",
  "Hired National Packers for my relocation from {city}. They are definitely the top rated packers and movers {city} review leaders. Excellent transit insurance options.",
  "Flawless home relocation services in {city} by National Packers & Movers. They handled all my heavy appliances and fragile items with expert care. Best packers movers {city}!",
  "Amazing experience with National Packers & Movers for local shifting in {city}. Their shifting charges were budget-friendly and packaging was top-notch.",
  "National Packers is the safest household goods transportation in {city} partner. Highly coordinated team and on-time delivery. Will hire again.",
  "Very reliable packers and movers for home shifting in {city}. They arrived on time and packed everything in durable crates. Seamless moving.",
  "Excellent car carrier and bike moving in {city} by National Packers. My car was transported safely in an enclosed car carrier truck.",
  "Budget packers and movers for office shifting in {city}. National Packers completed our commercial office move over the weekend with zero downtime.",
  "Fastest delivery and professional packing. Shifting from {city} was super easy with their digital tracking and update support.",
  "Superb customer service. Their team in {city} explained all shifting charges upfront. No hidden costs. 100% recommended!",
  "National Packers and Movers is the absolute gold standard for home shifting in {city}. Very helpful crew and great packing materials.",
  "Smooth transition from {city}. Hired them for long-distance domestic shifting and they did a fantastic job with complete door-to-door tracking.",
  "Great experience. The packing materials like bubble wraps and foam sheets were high quality. Shifting charges in {city} were well worth it.",
  "Highly skilled workers. They disassembled and reassembled all my beds and wardrobes perfectly. Reliable packers and movers in {city}.",
  "Excellent logistics support. The shifting manager kept me updated throughout the journey. Very professional packers movers {city} team.",
  "Fantastic home relocation services in {city} by National Packers. Very responsive sales quotes and quick booking process.",
  "Safe and timely delivery. Shifting from {city} was stress-free thanks to the professional staff.",
  "Best rate shifting estimate. The budget packers and movers for office shifting in {city} search ended with National Packers. Excellent support."
];

const NATIONAL_TEMPLATES_4_STAR = [
  "Very good service from National Packers & Movers in {city}. Packaging was secure, though they took a bit longer to complete the packing. Overall satisfied.",
  "Good home shifting experience with National Packers. Polite crew and secure transit. Shifting charges in {city} were reasonable."
];

// Ratings list distribution generator
function generateRatingsList(targetRating, count) {
  if (count <= 0) return [];
  const targetSum = Math.round(targetRating * count);
  const ratings = [];
  for (let i = 0; i < count; i++) {
    ratings.push(4); // Default initialize to 4
  }
  let currentSum = count * 4;
  
  let safety = 0;
  while (currentSum !== targetSum && safety < 500) {
    safety++;
    if (currentSum < targetSum) {
      const idx = ratings.findIndex(r => r < 5);
      if (idx !== -1) {
        ratings[idx]++;
        currentSum++;
      } else {
        break;
      }
    } else if (currentSum > targetSum) {
      const idx = ratings.findIndex(r => r > 3);
      if (idx !== -1) {
        ratings[idx]--;
        currentSum--;
      } else {
        break;
      }
    }
  }
  return ratings;
}

// Generate organic timestamps over last 12 months
function randomDate() {
  const start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

async function startSeeding() {
  console.log('=== STARTING BULK SEO REVIEWS SEEDER ===');
  await initDb();
  
  try {
    // 1. Fetch cities and vendors
    const cities = await db('cities').select('id', 'name');
    console.log(`Loaded ${cities.length} cities.`);

    const competitors = await db('vendors').whereNot({ id: 0 }).select('id', 'name', 'city_id', 'rating', 'reviews_count');
    console.log(`Loaded ${competitors.length} competitor vendors.`);

    // 2. Clear old seeded reviews to prevent duplications
    console.log('Clearing old auto-seeded reviews...');
    // We clean reviews where user_id is null (manually submitted reviews have user_id linked to user_sessions)
    const deletedCount = await db('reviews').whereNull('user_id').delete();
    console.log(`Cleared ${deletedCount} old mock reviews.`);

    const reviewsBuffer = [];

    // 3. Seed National Packers (vendor_id = 0) with exactly 20 reviews for every city
    console.log('\nSeeding National Packers & Movers reviews (20 reviews per city)...');
    for (const city of cities) {
      // For National Packers, we want 18 five-star and 2 four-star reviews (Average 4.9)
      const ratings = generateRatingsList(4.9, 20);
      
      // Shuffle templates to ensure unique ordering per city
      const fivestarPool = shuffle([...NATIONAL_TEMPLATES_5_STAR]);
      const fourstarPool = shuffle([...NATIONAL_TEMPLATES_4_STAR]);
      const namesPool = shuffle([...INDIAN_NAMES]);

      let fiveStarIdx = 0;
      let fourStarIdx = 0;

      for (let i = 0; i < 20; i++) {
        const rating = ratings[i];
        let text = '';
        
        if (rating === 5) {
          text = fivestarPool[fiveStarIdx % fivestarPool.length].replace(/{city}/g, city.name);
          fiveStarIdx++;
        } else {
          text = fourstarPool[fourStarIdx % fourstarPool.length].replace(/{city}/g, city.name);
          fourStarIdx++;
        }

        reviewsBuffer.push({
          vendor_id: 0,
          city_id: city.id,
          customer_name: namesPool[i % namesPool.length],
          rating: rating,
          review_text: text,
          created_at: randomDate()
        });
      }
    }
    console.log(`Buffered ${reviewsBuffer.length} reviews for National Packers.`);

    // 4. Seed Competitors (up to 8 reviews per listing based on GBP count)
    console.log('\nSeeding Competitors reviews (Capped at 8 reviews per vendor)...');
    let competitorReviewsCount = 0;
    
    for (const vendor of competitors) {
      const city = cities.find(c => c.id === vendor.city_id);
      if (!city) continue;

      // Capped count at 8 reviews, fallback to 3 reviews if GBP reviews_count is 0 but they have rating
      const targetCount = vendor.reviews_count > 0 ? Math.min(vendor.reviews_count, 8) : 0;
      if (targetCount === 0) continue;

      const ratings = generateRatingsList(vendor.rating || 4.2, targetCount);
      
      const fivestarPool = shuffle([...TEMPLATES_5_STAR]);
      const fourstarPool = shuffle([...TEMPLATES_4_STAR]);
      const threestarPool = shuffle([...TEMPLATES_3_STAR]);
      const namesPool = shuffle([...INDIAN_NAMES]);

      let fiveStarIdx = 0;
      let fourStarIdx = 0;
      let threeStarIdx = 0;

      for (let i = 0; i < targetCount; i++) {
        const rating = ratings[i];
        let text = '';

        if (rating === 5) {
          text = fivestarPool[fiveStarIdx % fivestarPool.length].replace(/{city}/g, city.name);
          fiveStarIdx++;
        } else if (rating === 4) {
          text = fourstarPool[fourStarIdx % fourstarPool.length].replace(/{city}/g, city.name);
          fourStarIdx++;
        } else {
          text = threestarPool[threeStarIdx % threestarPool.length].replace(/{city}/g, city.name);
          threeStarIdx++;
        }

        reviewsBuffer.push({
          vendor_id: vendor.id,
          city_id: vendor.city_id,
          customer_name: namesPool[i % namesPool.length],
          rating: rating,
          review_text: text,
          created_at: randomDate()
        });
        competitorReviewsCount++;
      }
    }
    console.log(`Buffered ${competitorReviewsCount} reviews for competitor listings.`);

    // 5. Batch insert reviews to PostgreSQL (chunk size 100)
    console.log(`\nWriting total ${reviewsBuffer.length} reviews to database in chunks...`);
    const chunkSize = 100;
    for (let i = 0; i < reviewsBuffer.length; i += chunkSize) {
      const chunk = reviewsBuffer.slice(i, i + chunkSize);
      await db('reviews').insert(chunk);
      if ((i + chunkSize) % 500 === 0 || i + chunkSize >= reviewsBuffer.length) {
        console.log(`- Inserted ${Math.min(i + chunkSize, reviewsBuffer.length)} / ${reviewsBuffer.length} reviews.`);
      }
    }

    console.log('\n✨ DYNAMIC BULK SEO REVIEWS SEEDING COMPLETED SUCCESSFULLY! ✨');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ SEEDING FAILED WITH ERROR:', error);
    process.exit(1);
  }
}

startSeeding();
