const fs = require('fs');
const path = require('path');

function checkFile(filePath, tests) {
  const content = fs.readFileSync(filePath, 'utf8');
  let allPassed = true;
  console.log(`\nChecking ${path.basename(filePath)}:`);
  for (const t of tests) {
    const passed = typeof t.test === 'string' ? content.includes(t.test) : t.test.test(content);
    console.log(`   - ${t.name}:`, passed ? 'PASS ✅' : 'FAIL ❌');
    if (!passed) allPassed = false;
  }
  return allPassed;
}

function verify() {
  console.log('=== VERIFYING LIQUID MOBILE RESPONSIVENESS (v5.3) ===');

  // 1. Layout.js
  checkFile(path.join(__dirname, '../app/layout.js'), [
    { name: 'Exports viewport object', test: 'export const viewport' },
    { name: 'device-width in viewport', test: "width: 'device-width'" },
    { name: 'overflow-x-hidden on html & body', test: 'overflow-x-hidden' },
  ]);

  // 2. Globals.css
  checkFile(path.join(__dirname, '../app/globals.css'), [
    { name: 'overflow-x: hidden on body', test: 'overflow-x-hidden' },
    { name: 'Tap highlight transparent', test: '-webkit-tap-highlight-color: transparent' },
    { name: 'touch-action manipulation', test: 'touch-action: manipulation' },
    { name: 'no-scrollbar utility', test: '.no-scrollbar' },
  ]);

  // 3. Navbar.jsx
  checkFile(path.join(__dirname, '../components/Navbar.jsx'), [
    { name: 'use client directive', test: "'use client'" },
    { name: 'isMobileMenuOpen state', test: 'isMobileMenuOpen' },
    { name: 'Mobile hamburger button', test: 'aria-label="Toggle Mobile Menu"' },
    { name: 'Mobile slide-down drawer panel', test: 'Mobile Slide-down Navigation Drawer' },
    { name: 'Direct phone call CTA in drawer', test: 'tel:+919835168368' },
    { name: 'Top Movers link in mobile drawer', test: 'href="/top-packers-and-movers"' },
    { name: 'IBA Approved link in mobile drawer', test: 'href="/iba-approved-packers-and-movers"' },
  ]);

  // 4. MoverCard.jsx
  checkFile(path.join(__dirname, '../components/MoverCard.jsx'), [
    { name: 'Mobile Badge Strip (sm:hidden)', test: 'sm:hidden mb-3' },
    { name: 'Desktop Corner Ribbon (hidden sm:block)', test: 'hidden sm:block absolute top-0 right-0' },
    { name: 'Mobile header row avatar + title', test: 'md:hidden flex-1 min-w-0' },
    { name: 'Fluid touch CTA buttons', test: 'w-full py-3 px-4 rounded-xl' },
  ]);

  // 5. QuoteModal.jsx
  checkFile(path.join(__dirname, '../components/QuoteModal.jsx'), [
    { name: 'max-h-[92vh] mobile height limit', test: 'max-h-[92vh]' },
    { name: 'Scrollable modal body on mobile', test: 'overflow-y-auto flex-1 overscroll-contain' },
  ]);

  // 6. CostEstimator.jsx
  checkFile(path.join(__dirname, '../components/CostEstimator.jsx'), [
    { name: 'Fluid padding (p-4 sm:p-6 lg:p-8)', test: 'p-4 sm:p-6 lg:p-8' },
    { name: 'Fluid price typography', test: 'text-2xl xs:text-3xl sm:text-4xl' },
    { name: 'Full width responsive mode switch', test: 'grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto' },
  ]);

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify();
