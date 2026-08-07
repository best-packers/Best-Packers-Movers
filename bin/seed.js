const { db, initDb } = require('../config/db');
require('dotenv').config();

const statesData = [
  { name: 'Uttar Pradesh', slug: 'uttar-pradesh', cities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad'] },
  { name: 'West Bengal', slug: 'west-bengal', cities: ['Kolkata', 'Siliguri', 'Asansol', 'Durgapur'] },
  { name: 'Jharkhand', slug: 'jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
  { name: 'Bihar', slug: 'bihar', cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'] },
  { name: 'Madhya Pradesh', slug: 'madhya-pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'] },
  { name: 'Andhra Pradesh', slug: 'andhra-pradesh', cities: ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Nellore'] }
];

const mockVendorTemplates = [
  { name: 'VRL Cargo Packers and Movers', rating: 4.6, reviewMin: 90, reviewMax: 240 },
  { name: 'Gati Relocation Services', rating: 4.4, reviewMin: 60, reviewMax: 180 },
  { name: 'DTC Logistics Movers', rating: 4.2, reviewMin: 40, reviewMax: 120 },
  { name: 'Express Household Shifting', rating: 4.5, reviewMin: 50, reviewMax: 190 },
  { name: 'Super Safe Packers & Movers', rating: 4.3, reviewMin: 30, reviewMax: 95 },
  { name: 'Blue Star Logistics India', rating: 4.1, reviewMin: 25, reviewMax: 80 },
  { name: 'Agarwal Domestic Relocation', rating: 4.7, reviewMin: 120, reviewMax: 310 },
  { name: 'Fast Track Packers & Movers', rating: 4.0, reviewMin: 15, reviewMax: 65 },
  { name: 'Safe Move Packers Group', rating: 4.3, reviewMin: 20, reviewMax: 70 },
  { name: 'Reliable Movers and Carriers', rating: 3.9, reviewMin: 10, reviewMax: 45 },
  { name: 'Quick Relocation Logistics', rating: 4.5, reviewMin: 45, reviewMax: 140 },
  { name: 'Air Cargo Packers & Movers', rating: 4.2, reviewMin: 35, reviewMax: 90 }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function runSeed() {
  try {
    // 1. Initialize tables
    await initDb();
    
    console.log('Seeding states, cities, and initial mock vendor data...');

    // Clear existing data to avoid conflicts on duplicate seed runs
    await db('claims').del();
    await db('leads').del();
    await db('vendors').del();
    await db('cities').del();
    await db('states').del();
    
    console.log('Cleared existing data.');

    for (const stateItem of statesData) {
      // Insert state
      const [stateIdObj] = await db('states')
        .insert({
          name: stateItem.name,
          slug: stateItem.slug
        })
        .returning('id');
      
      const stateId = typeof stateIdObj === 'object' ? stateIdObj.id : stateIdObj;
      console.log(`Inserted state: ${stateItem.name} (ID: ${stateId})`);

      for (const cityName of stateItem.cities) {
        const citySlug = slugify(cityName);
        
        // Insert city
        const [cityIdObj] = await db('cities')
          .insert({
            state_id: stateId,
            name: cityName,
            slug: citySlug
          })
          .returning('id');
        
        const cityId = typeof cityIdObj === 'object' ? cityIdObj.id : cityIdObj;
        
        // Seed 8-12 local mock vendors per city
        const numVendors = Math.floor(Math.random() * 5) + 8; // Between 8 and 12
        const shuffledTemplates = [...mockVendorTemplates].sort(() => 0.5 - Math.random());
        const selectedTemplates = shuffledTemplates.slice(0, numVendors);

        for (const template of selectedTemplates) {
          const vendorName = `${template.name} (${cityName})`;
          const vendorSlug = `${slugify(template.name)}-${citySlug}`;
          const reviewCount = Math.floor(Math.random() * (template.reviewMax - template.reviewMin + 1)) + template.reviewMin;
          
          await db('vendors').insert({
            city_id: cityId,
            name: vendorName,
            slug: vendorSlug,
            address: `Plot No. ${Math.floor(Math.random() * 200) + 1}, Industrial Area, Near Main Junction, ${cityName}, ${stateItem.name}`,
            phone: `+91 98765 ${Math.floor(Math.random() * 90000) + 10000}`,
            rating: template.rating,
            reviews_count: reviewCount,
            status: 'unclaimed',
            website: `http://www.${slugify(template.name)}.in`,
            is_national: false
          });
        }
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
