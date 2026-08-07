const { db, initDb } = require('../config/db');
const { execSync } = require('child_process');
const path = require('path');

async function scrapeAll() {
  try {
    await initDb();
    
    // Fetch all cities from the database
    const cities = await db('cities').select('name');
    console.log(`Found ${cities.length} cities to scrape.`);
    
    const scrapeScript = path.join(__dirname, 'scrape.js');
    
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      console.log(`\n========================================`);
      console.log(`[${i + 1}/${cities.length}] Scraping city: ${city.name}`);
      console.log(`========================================`);
      
      try {
        // Run scrape.js for this city using execSync to run it synchronously in loop
        execSync(`node "${scrapeScript}" --city="${city.name}"`, { stdio: 'inherit' });
      } catch (err) {
        console.error(`Error scraping city '${city.name}':`, err.message);
      }
    }
    
    console.log('\n--- ALL CITIES SCRAPED AND DATABASE POPULATED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Scrape all execution error:', error);
    process.exit(1);
  }
}

scrapeAll();
