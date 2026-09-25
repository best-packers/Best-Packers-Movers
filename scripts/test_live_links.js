async function checkHomepageLinks() {
  const res = await fetch('https://www.bestpackermovers.com/');
  const html = await res.text();
  const hrefRegex = /href=["']([^"']+)["']/g;
  const hrefs = [];
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    hrefs.push(match[1]);
  }
  const uniqueHrefs = [...new Set(hrefs)];
  console.log('Total unique hrefs on homepage:', uniqueHrefs.length);
  const internalLinks = uniqueHrefs.filter(h => h.startsWith('/') && !h.startsWith('/_next') && !h.startsWith('/api') && !h.startsWith('/#') && h !== '/');
  console.log('Sample internal links found (' + internalLinks.length + ' total):');
  
  let passed = 0;
  let failed = 0;
  for (const link of internalLinks) {
    const testUrl = 'https://www.bestpackermovers.com' + link;
    try {
      const r = await fetch(testUrl, { redirect: 'follow' });
      if (r.status === 200) {
        passed++;
      } else {
        failed++;
        console.error('FAILED LINK:', link, '=> Status:', r.status);
      }
    } catch (e) {
      failed++;
      console.error('ERROR LINK:', link, '=>', e.message);
    }
  }
  console.log(`Results: ${passed} passed, ${failed} failed`);
}

checkHomepageLinks();
