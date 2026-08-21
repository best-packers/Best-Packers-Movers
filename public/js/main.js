// BestPackersMovers — Main Frontend JS

document.addEventListener('DOMContentLoaded', () => {
  initCostCalculator();
  initQuoteModal();
  initLightbox();
});

// ─── 1. Interactive Cost Estimation Calculator ────────────────────────────────
function initCostCalculator() {
  const bhkSelect = document.getElementById('calc-bhk');
  const distSelect = document.getElementById('calc-distance');
  const resultEl = document.getElementById('calc-result');

  if (!bhkSelect || !distSelect || !resultEl) return;

  const baseRates = {
    '1bhk': { packing: [3000, 5000], labor: 1500 },
    '2bhk': { packing: [5000, 8000], labor: 2500 },
    '3bhk': { packing: [8000, 13000], labor: 4000 },
    '4bhk': { packing: [12000, 18000], labor: 6000 }
  };

  const distRates = {
    'local':   { transport: [2000, 4500], toll: 200 },
    '50-150':  { transport: [6000, 12000], toll: 800 },
    '150-350': { transport: [12000, 22000], toll: 1400 },
    '350-750': { transport: [20000, 35000], toll: 2500 },
    '750+':    { transport: [32000, 55000], toll: 4500 }
  };

  function calculateEstimate() {
    const bhk = bhkSelect.value;
    const dist = distSelect.value;

    const bhkCost = baseRates[bhk];
    const distKey = distRates[dist] ? dist : 'local';
    const distCost = distRates[distKey];

    const minTotal = bhkCost.packing[0] + bhkCost.labor + distCost.transport[0] + distCost.toll;
    const maxTotal = bhkCost.packing[1] + bhkCost.labor + distCost.transport[1] + distCost.toll;

    const fmt = (val) => '₹ ' + val.toLocaleString('en-IN');
    resultEl.textContent = `${fmt(minTotal)} – ${fmt(maxTotal)}`;
  }

  bhkSelect.addEventListener('change', calculateEstimate);
  distSelect.addEventListener('change', calculateEstimate);
  calculateEstimate();
}

// ─── 2. Quote Modal ───────────────────────────────────────────────────────────
function initQuoteModal() {
  const quoteModal = document.getElementById('quote-modal');
  const quoteForm = document.getElementById('quote-form');
  const closeQuoteBtn = document.getElementById('close-quote-btn');
  const quoteVendorIdInput = document.getElementById('quote-vendor-id');
  const quoteVendorNameSpan = document.getElementById('quote-vendor-name');

  const showModal = (modal) => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
  };

  const hideModal = (modal) => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  };

  // Open Quote Modal — attach to ALL .open-quote-btn elements
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-quote-btn');
    if (btn && quoteModal) {
      e.preventDefault();
      const vendorId = btn.getAttribute('data-vendor-id') || '0';
      const vendorName = btn.getAttribute('data-vendor-name') || 'National Packers & Movers';
      if (quoteVendorIdInput) quoteVendorIdInput.value = vendorId;
      if (quoteVendorNameSpan) quoteVendorNameSpan.textContent = vendorName;
      showModal(quoteModal);
    }
  });

  if (closeQuoteBtn && quoteModal) {
    closeQuoteBtn.addEventListener('click', () => hideModal(quoteModal));
  }

  // Close on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === quoteModal) hideModal(quoteModal);
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quoteModal && !quoteModal.classList.contains('hidden')) {
      hideModal(quoteModal);
    }
  });

  // Quote Form Submission
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';

      const formData = {
        vendor_id: document.getElementById('quote-vendor-id').value,
        moving_from: document.getElementById('quote-from').value,
        moving_to: document.getElementById('quote-to').value,
        moving_date: document.getElementById('quote-date').value,
        phone: document.getElementById('quote-phone').value
      };

      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          // Redirect to WhatsApp after successful quote submission
          const msg = encodeURIComponent(
            `Hello! I submitted a shifting quote request.\nFrom: ${formData.moving_from}\nTo: ${formData.moving_to}\nDate: ${formData.moving_date || 'Flexible'}\nPhone: +91${formData.phone}`
          );
          quoteForm.reset();
          quoteForm.closest('.fixed').classList.add('hidden');
          quoteForm.closest('.fixed').classList.remove('flex');
          document.body.classList.remove('overflow-hidden');
          window.open(`https://wa.me/919835168368?text=${msg}`, '_blank');
        } else {
          alert('Submission Failed: ' + data.message);
        }
      } catch (err) {
        console.error('Error submitting quote:', err);
        alert('Network error. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
}

// ─── 3. Lightbox for Gallery Images ──────────────────────────────────────────
function initLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  if (!lightbox) return;

  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightbox = document.getElementById('close-lightbox');

  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      lightboxImg.src = thumb.getAttribute('data-full') || thumb.src;
      lightboxCaption.textContent = thumb.getAttribute('data-caption') || '';
      lightbox.classList.remove('hidden');
      lightbox.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    });
  });

  const hideLightbox = () => {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  };

  if (closeLightbox) closeLightbox.addEventListener('click', hideLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideLightbox(); });
}

// ─── 4. Interactive Search & Auto-Location Matching ──────────────────────────
let searchCities = [];
let searchVendors = [];
let selectedCitySlug = '';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderSearch();
  initHomeLinks();
});

function initHomeLinks() {
  const homeLinks = document.querySelectorAll('a[href="/"]');
  homeLinks.forEach(link => {
    link.addEventListener('click', () => {
      sessionStorage.setItem('force_home', 'true');
    });
  });
}

function initHeaderSearch() {
  const locBtn = document.getElementById('header-loc-btn');
  const locDropdown = document.getElementById('header-loc-dropdown');
  const cityListDiv = document.getElementById('header-city-list');
  const searchInput = document.getElementById('header-search-input');
  const searchDropdown = document.getElementById('header-search-dropdown');
  const searchSuggestionsDiv = document.getElementById('header-search-suggestions');
  const searchBtn = document.getElementById('header-search-btn');

  if (!locBtn) return;

  locBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    locDropdown.classList.toggle('hidden');
    if (searchDropdown) searchDropdown.classList.add('hidden');
  });

  document.addEventListener('click', () => {
    if (locDropdown) locDropdown.classList.add('hidden');
    if (searchDropdown) searchDropdown.classList.add('hidden');
  });

  fetch('/api/search-data')
    .then(res => res.json())
    .then(data => {
      searchCities = data.cities || [];
      searchVendors = data.vendors || [];
      populateCityDropdown();
      detectUserLocation();
    })
    .catch(err => console.error('Error fetching search data:', err));

  function populateCityDropdown() {
    if (!cityListDiv) return;
    cityListDiv.innerHTML = '';
    searchCities.forEach(city => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-orange transition';
      btn.textContent = city.name;
      btn.addEventListener('click', () => selectCity(city.name, city.slug, true));
      cityListDiv.appendChild(btn);
    });
  }

  function selectCity(name, slug, shouldRedirect = false) {
    const label = document.getElementById('header-loc-label');
    if (label) label.textContent = name;
    selectedCitySlug = slug;
    if (locDropdown) locDropdown.classList.add('hidden');

    if (slug) {
      sessionStorage.setItem('user_city_slug', slug);
      sessionStorage.setItem('user_city_name', name);
    }

    if (shouldRedirect && slug) {
      const path = window.location.pathname;
      const isCityPage = searchCities.some(c => path === `/${c.slug}`);
      if (path === '/' || isCityPage) {
        window.location.href = `/${slug}`;
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase().trim();
      if (!val) { if (searchDropdown) searchDropdown.classList.add('hidden'); return; }

      const filteredVendors = searchVendors.filter(v => {
        const matchesText = v.name.toLowerCase().includes(val);
        const matchesCity = !selectedCitySlug || v.city_slug === selectedCitySlug;
        return matchesText && matchesCity;
      }).slice(0, 5);

      const filteredCities = selectedCitySlug ? [] : searchCities.filter(c =>
        c.name.toLowerCase().includes(val)
      ).slice(0, 3);

      if (!searchSuggestionsDiv) return;

      if (filteredVendors.length === 0 && filteredCities.length === 0) {
        searchSuggestionsDiv.innerHTML = `<div class="px-4 py-2.5 text-xs text-slate-400 font-medium">No results found</div>`;
      } else {
        searchSuggestionsDiv.innerHTML = '';

        filteredCities.forEach(city => {
          const div = document.createElement('div');
          div.className = 'px-4 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs font-semibold text-slate-700 hover:text-brand-orange';
          div.innerHTML = `<span><i class="fa-solid fa-location-dot text-brand-orange mr-2"></i>${city.name} Directory</span> <span class="text-[10px] text-slate-400 uppercase">City</span>`;
          div.addEventListener('click', () => { window.location.href = `/${city.slug}`; });
          searchSuggestionsDiv.appendChild(div);
        });

        filteredVendors.forEach(vendor => {
          const div = document.createElement('div');
          div.className = 'px-4 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs font-semibold text-slate-700 hover:text-brand-orange';
          div.innerHTML = `<span><i class="fa-solid fa-truck-ramp-box text-slate-400 mr-2"></i>${vendor.name}</span> <span class="text-[10px] text-slate-400 uppercase">${vendor.city_slug}</span>`;
          div.addEventListener('click', () => { window.location.href = `/${vendor.city_slug}/${vendor.slug}`; });
          searchSuggestionsDiv.appendChild(div);
        });
      }

      if (searchDropdown) searchDropdown.classList.remove('hidden');
    });
  }

  const triggerSearch = () => {
    if (!searchInput) return;
    const val = searchInput.value.toLowerCase().trim();
    if (selectedCitySlug) {
      window.location.href = `/${selectedCitySlug}`;
    } else if (val) {
      const matchedCity = searchCities.find(c => c.name.toLowerCase().includes(val));
      if (matchedCity) {
        window.location.href = `/${matchedCity.slug}`;
      } else {
        alert('Please select or specify a supported city.');
      }
    } else {
      alert('Please select a location to start search.');
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', triggerSearch);
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') triggerSearch();
    });
  }

  window.detectUserLocation = function(isManual = false) {
    const label = document.getElementById('header-loc-label');
    if (isManual && label) label.textContent = 'Detecting...';

    const cachedSlug = sessionStorage.getItem('user_city_slug');
    const cachedName = sessionStorage.getItem('user_city_name');

    if (cachedSlug && cachedName && !isManual) {
      selectCity(cachedName, cachedSlug, false);
      return;
    }

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const ipCity = data.city;
        if (ipCity) {
          const matchedCity = searchCities.find(c => c.name.toLowerCase() === ipCity.toLowerCase());
          if (matchedCity) {
            selectCity(matchedCity.name, matchedCity.slug, isManual);
            if (isManual) alert(`Location detected: ${matchedCity.name}`);
          } else {
            if (isManual) alert(`Detected city: ${ipCity} is not currently listed. Showing all India.`);
            selectCity('All India', '', false);
          }
        } else {
          selectCity('All India', '', false);
        }
      })
      .catch(() => selectCity('All India', '', false));
  };
}

// ─── 5. Homepage city select navigate ────────────────────────────────────────
function navigateCity() {
  const select = document.getElementById('quick-city-select');
  if (select && select.value) {
    window.location.href = select.value;
  } else {
    alert('Please select a city first.');
  }
}

function prefillSearch(term) {
  const input = document.getElementById('header-search-input');
  if (input) {
    input.value = term;
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
