const { db, initDb } = require('../config/db');
require('dotenv').config();

const extraStatesData = [
  {
    name: 'Odisha',
    slug: 'odisha',
    cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Balasore', 'Berhampur', 'Jharsuguda', 'Baripada', 'Bhadrak']
  },
  {
    name: 'Uttar Pradesh',
    slug: 'uttar-pradesh',
    cities: ['Agra', 'Varanasi', 'Meerut', 'Aligarh', 'Bareilly', 'Gorakhpur', 'Mathura', 'Jhansi', 'Moradabad', 'Firozabad']
  },
  {
    name: 'West Bengal',
    slug: 'west-bengal',
    cities: ['Howrah', 'Kharagpur', 'Haldia', 'Darjeeling', 'Bardhaman', 'Malda', 'Jalpaiguri', 'Kalyani', 'Habra']
  },
  {
    name: 'Jharkhand',
    slug: 'jharkhand',
    cities: ['Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Medininagar', 'Chas', 'Jhumri Telaiya']
  },
  {
    name: 'Bihar',
    slug: 'bihar',
    cities: ['Darbhanga', 'Arrah', 'Begusarai', 'Purnia', 'Katihar', 'Munger', 'Chhapra', 'Bihar Sharif']
  },
  {
    name: 'Madhya Pradesh',
    slug: 'madhya-pradesh',
    cities: ['Ujjain', 'Dewas', 'Satna', 'Sagar', 'Ratlam', 'Rewa', 'Katni', 'Morena']
  },
  {
    name: 'Andhra Pradesh',
    slug: 'andhra-pradesh',
    cities: ['Tirupati', 'Kurnool', 'Kakinada', 'Rajamahendravaram', 'Kadapa', 'Anantapur', 'Eluru', 'Vizianagaram']
  }
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
    await initDb();
    console.log('Running safe incremental states & cities seeder...');

    for (const stateItem of extraStatesData) {
      // Find or insert State
      let stateRow = await db('states').where({ slug: stateItem.slug }).first();
      let stateId;

      if (!stateRow) {
        const [insertedObj] = await db('states')
          .insert({
            name: stateItem.name,
            slug: stateItem.slug
          })
          .returning('id');
        stateId = typeof insertedObj === 'object' ? insertedObj.id : insertedObj;
        console.log(`✅ Created State: ${stateItem.name} (ID: ${stateId})`);
      } else {
        stateId = stateRow.id;
        console.log(`ℹ️ State Exists: ${stateItem.name} (ID: ${stateId})`);
      }

      for (const cityName of stateItem.cities) {
        const citySlug = slugify(cityName);
        
        // Find or insert City
        let cityRow = await db('cities').where({ slug: citySlug, state_id: stateId }).first();
        let cityId;

        if (!cityRow) {
          const [insertedCityObj] = await db('cities')
            .insert({
              state_id: stateId,
              name: cityName,
              slug: citySlug
            })
            .returning('id');
          cityId = typeof insertedCityObj === 'object' ? insertedCityObj.id : insertedCityObj;
          console.log(`  + Created City: ${cityName} (ID: ${cityId})`);

          // Seed initial mock listings for newly added cities
          const numVendors = Math.floor(Math.random() * 4) + 6; // Seed 6 to 9 vendors initially
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
              address: `Plot No. ${Math.floor(Math.random() * 200) + 1}, Industrial Area, near Main Crossing, ${cityName}, ${stateItem.name}`,
              phone: `+91 98765 ${Math.floor(Math.random() * 90000) + 10000}`,
              rating: template.rating,
              reviews_count: reviewCount,
              status: 'unclaimed',
              website: `http://www.${slugify(template.name)}.in`,
              is_national: false
            });
          }
          console.log(`    Seeded ${numVendors} initial listings for ${cityName}`);
        } else {
          console.log(`  - City already exists: ${cityName}`);
        }
      }
    }

    console.log('✅ Safe incremental seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Incremental seed failed:', error);
    process.exit(1);
  }
}

runSeed();
