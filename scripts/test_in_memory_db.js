const states = require('../data/states.json');
const cities = require('../data/cities.json');
const intentRoutes = require('../data/intent_routes.json');
const movers = require('../data/movers.json');

console.log('States loaded:', states.length);
console.log('Cities loaded:', cities.length);
console.log('Intent routes loaded:', intentRoutes.length);
console.log('Movers loaded:', movers.length);

// Test query 1: intent route for bhubaneswar
const slug1 = 'packers-and-movers-bhubaneswar';
const route = intentRoutes.find(r => r.slug_pattern === slug1);
if (route) {
  const city = cities.find(c => c.id === route.city_id);
  const state = states.find(s => s.id === city?.state_id);
  console.log('✅ Found Route:', route.h1_heading, '| City:', city?.name, '| State:', state?.name);
} else {
  console.log('❌ Route not found');
}

// Test query 2: city movers for bhubaneswar
const bhubCity = cities.find(c => c.slug === 'bhubaneswar');
const cityMovers = movers
  .filter(m => m.city_id === bhubCity.id)
  .sort((a, b) => (a.rank_order || 99) - (b.rank_order || 99) || (b.rating || 0) - (a.rating || 0));
console.log('✅ Found Movers for Bhubaneswar:', cityMovers.length);
console.log('   #1 Mover:', cityMovers[0]?.name, '| Rank:', cityMovers[0]?.rank_order);
