/* ==========================================================================
   OnePassVisa.com — Interactive Engine (With Photo Credits & Ads Compliance)
   ========================================================================== */

(function () {
  'use strict';

  const DATA = window.ONEPASS_DATA;
  let currentCurrency = localStorage.getItem('opv_currency') || 'USD';

  const SVG_ARROW = `<svg class="icon-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h12M11 5l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const SVG_CHECK = `<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16.5 5.5l-8 8-4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* --------------------------------------------------------------------------
     1. Currency Formatting & Global Switcher
     -------------------------------------------------------------------------- */
  function formatMoney(amountUSD) {
    const curr = DATA.currencies[currentCurrency] || DATA.currencies.USD;
    const converted = Math.round(amountUSD * curr.rate);
    return curr.symbol + converted.toLocaleString();
  }

  window.opvFormatMoney = formatMoney;

  function updateAllCurrencyDisplays() {
    document.querySelectorAll('[data-usd]').forEach((el) => {
      const usdVal = parseFloat(el.getAttribute('data-usd'));
      if (!isNaN(usdVal)) {
        el.textContent = formatMoney(usdVal);
      }
    });

    document.querySelectorAll('.js-currency-select').forEach((sel) => {
      sel.value = currentCurrency;
    });

    if (typeof window.opvRefreshDestinations === 'function') window.opvRefreshDestinations();
    if (typeof window.opvRefreshCalculator === 'function') window.opvRefreshCalculator();
    if (typeof window.opvRefreshWizardSummary === 'function') window.opvRefreshWizardSummary();
  }

  function initCurrencySelectors() {
    document.querySelectorAll('.js-currency-select').forEach((sel) => {
      sel.value = currentCurrency;
      sel.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        localStorage.setItem('opv_currency', currentCurrency);
        updateAllCurrencyDisplays();
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. Mobile Navigation & Cookie Consent Bar (Google Ads Compliant)
     -------------------------------------------------------------------------- */
  function initNavigationAndCookies() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('mainNavLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });
    }

    const cookieBanner = document.getElementById('cookieConsentBanner');
    if (cookieBanner && !localStorage.getItem('opv_cookie_accepted')) {
      cookieBanner.classList.add('show');
    }
    const acceptBtn = document.getElementById('acceptCookiesBtn');
    if (acceptBtn && cookieBanner) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('opv_cookie_accepted', '1');
        cookieBanner.classList.remove('show');
      });
    }
  }

  /* --------------------------------------------------------------------------
     3. Populate Nationality & Destination Dropdowns
     -------------------------------------------------------------------------- */
  function populateSelects() {
    const natSelects = document.querySelectorAll('.js-nationality-select');
    natSelects.forEach((select) => {
      const defaultVal = select.getAttribute('data-default') || 'US';
      select.innerHTML = DATA.nationalities
        .map((n) => `<option value="${n.code}" ${n.code === defaultVal ? 'selected' : ''}>${n.name}</option>`)
        .join('');
    });

    const destSelects = document.querySelectorAll('.js-destination-select');
    destSelects.forEach((select) => {
      const defaultVal = select.getAttribute('data-default') || 'uae';
      select.innerHTML = DATA.destinations
        .map((d) => `<option value="${d.id}" ${d.id === defaultVal ? 'selected' : ''}>${d.name} (${d.categoryBadge})</option>`)
        .join('');
    });
  }

  /* --------------------------------------------------------------------------
     4. Interactive Visa Eligibility Checker
     -------------------------------------------------------------------------- */
  function initEligibilityChecker() {
    const form = document.getElementById('heroCheckerForm');
    const drawer = document.getElementById('checkerResultDrawer');
    if (!form || !drawer) return;

    function runCheck(e) {
      if (e) e.preventDefault();
      const natCode = document.getElementById('checkerNationality').value;
      const destId = document.getElementById('checkerDestination').value;
      const purpose = document.getElementById('checkerPurpose').value;

      const nat = DATA.nationalities.find((n) => n.code === natCode) || DATA.nationalities[0];
      const dest = DATA.destinations.find((d) => d.id === destId) || DATA.destinations[0];
      const totalUSD = dest.govFeeUSD + dest.serviceFeeUSD;

      drawer.innerHTML = `
        <div class="result-banner">
          <div>
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.45rem;">
              <span class="badge badge-emerald">Online Application Available</span>
              <span class="badge badge-blue">${dest.categoryBadge} • ${purpose}</span>
            </div>
            <h3 style="font-size:1.15rem;font-weight:700;color:var(--navy-900);margin-bottom:0.25rem;">
              ${nat.name} Passport → ${dest.name}: <span style="color:var(--blue-600);">${dest.visaType}</span>
            </h3>
            <p style="font-size:0.88rem;color:var(--gray-600);margin-bottom:0.35rem;">
              ${dest.overview}
            </p>
            <div style="font-size:0.76rem;color:var(--gray-500);">
              Government Fee: <strong>${formatMoney(dest.govFeeUSD)}</strong> + OnePass Service Fee: <strong>${formatMoney(dest.serviceFeeUSD)}</strong>
              (Or apply directly at <a href="${dest.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--blue-600);text-decoration:underline;">${dest.govPortal}</a>)
            </div>
          </div>
          <div class="result-metrics">
            <div>
              <div class="dest-spec-label">Processing</div>
              <div class="dest-spec-val">${dest.processingTime}</div>
              <div style="font-size:0.72rem;color:var(--blue-600);font-weight:600;margin-top:2px;">${dest.expressTime}</div>
            </div>
            <div>
              <div class="dest-spec-label">Max Stay</div>
              <div class="dest-spec-val">${dest.maxStay}</div>
              <div style="font-size:0.72rem;color:var(--gray-500);margin-top:2px;">${dest.entryType}</div>
            </div>
            <div>
              <div class="dest-spec-label">Total Fee</div>
              <div class="dest-spec-val" style="color:var(--blue-600);font-size:1.05rem;font-weight:800;" data-usd="${totalUSD}">${formatMoney(totalUSD)}</div>
              <div style="font-size:0.7rem;color:var(--gray-500);margin-top:2px;">All-inclusive</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <a href="apply.html?country=${dest.id}&nationality=${nat.code}&purpose=${encodeURIComponent(purpose)}" class="btn btn-primary">
              <span>Start Application</span> ${SVG_ARROW}
            </a>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.opvOpenCountryModal('${dest.id}')">
              View Checklist (${dest.documents.length})
            </button>
          </div>
        </div>
      `;
      drawer.classList.add('active');
    }

    form.addEventListener('submit', runCheck);
  }

  /* --------------------------------------------------------------------------
     5. Destination Cards Grid (With Visible Photo Credits)
     -------------------------------------------------------------------------- */
  function initDestinationsGrid() {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;

    const limit = parseInt(grid.getAttribute('data-limit') || '0', 10);
    let activeRegion = 'all';
    let searchQuery = '';

    function renderGrid() {
      let list = DATA.destinations.filter((d) => {
        const matchesRegion = activeRegion === 'all' || d.region.toLowerCase() === activeRegion.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          d.name.toLowerCase().includes(searchQuery) ||
          d.shortName.toLowerCase().includes(searchQuery) ||
          d.visaType.toLowerCase().includes(searchQuery) ||
          d.categoryBadge.toLowerCase().includes(searchQuery);
        return matchesRegion && matchesSearch;
      });

      if (limit > 0 && activeRegion === 'all' && !searchQuery) {
        list = list.slice(0, limit);
      }

      if (list.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:2.5rem;background:var(--white);border-radius:var(--radius-md);border:1px solid var(--gray-200);">
            <h3 style="font-size:1.1rem;color:var(--navy-900);margin-bottom:0.35rem;">No matching destinations found</h3>
            <p style="color:var(--gray-500);font-size:0.88rem;margin-bottom:1rem;">Try searching for another country or select "All Regions".</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = list
        .map((d) => {
          const totalUSD = d.govFeeUSD + d.serviceFeeUSD;
          return `
            <article class="dest-card">
              <div class="dest-card-visual" style="background-image:url('${d.image}')" role="img" aria-label="${d.name} landmark photo by ${d.photoCredit}">
                <div class="dest-visual-top">
                  <span class="badge badge-dark">${d.categoryBadge}</span>
                  <span class="badge badge-dark">${d.region}</span>
                </div>
                <div class="dest-visual-bottom">
                  <h3 class="dest-country-title">${d.name}</h3>
                </div>
              </div>
              <div class="dest-credit-bar">
                <span>Photo: <a href="${d.photoCreditUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">${d.photoCredit}</a></span>
                <span>${d.expressTime}</span>
              </div>
              <div class="dest-card-body">
                <div>
                  <div class="dest-doc-type">${d.visaType}</div>
                  <div class="dest-specs">
                    <div>
                      <div class="dest-spec-label">Processing Time</div>
                      <div class="dest-spec-val">${d.processingTime}</div>
                    </div>
                    <div>
                      <div class="dest-spec-label">Maximum Stay</div>
                      <div class="dest-spec-val">${d.maxStay}</div>
                    </div>
                    <div>
                      <div class="dest-spec-label">Government Fee</div>
                      <div class="dest-spec-val">${formatMoney(d.govFeeUSD)}</div>
                    </div>
                    <div>
                      <div class="dest-spec-label">Service Fee</div>
                      <div class="dest-spec-val">${formatMoney(d.serviceFeeUSD)}</div>
                    </div>
                  </div>
                </div>
                <div class="dest-card-footer">
                  <div>
                    <div class="dest-price-label">Total Per Person</div>
                    <div class="dest-price-val">${formatMoney(totalUSD)} <span>incl. fees</span></div>
                  </div>
                  <div style="display:flex;gap:0.45rem;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="window.opvOpenCountryModal('${d.id}')">
                      Details
                    </button>
                    <a href="apply.html?country=${d.id}" class="btn btn-primary btn-sm">
                      <span>Apply</span> ${SVG_ARROW}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          `;
        })
        .join('');
    }

    window.opvRefreshDestinations = renderGrid;

    document.querySelectorAll('.js-region-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.js-region-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeRegion = btn.getAttribute('data-region') || 'all';
        renderGrid();
      });
    });

    const searchInput = document.getElementById('destSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderGrid();
      });
    }

    renderGrid();

    const params = new URLSearchParams(window.location.search);
    const openCountry = params.get('country');
    if (openCountry && document.getElementById('countryDetailModal')) {
      window.opvOpenCountryModal(openCountry);
    }
  }

  /* --------------------------------------------------------------------------
     6. Country Visa Requirement Modal (With Photo & Credit + Gov Link)
     -------------------------------------------------------------------------- */
  window.opvOpenCountryModal = function (destId) {
    const modal = document.getElementById('countryDetailModal');
    const body = document.getElementById('countryModalBody');
    const title = document.getElementById('countryModalTitle');
    if (!modal || !body) return;

    const d = DATA.destinations.find((item) => item.id === destId) || DATA.destinations[0];
    const totalUSD = d.govFeeUSD + d.serviceFeeUSD;

    title.textContent = `${d.name} — Visa & Travel Document Details`;
    body.innerHTML = `
      <div style="position:relative;height:180px;border-radius:var(--radius-md);overflow:hidden;margin-bottom:1.25rem;border:1px solid var(--gray-200);">
        <img src="${d.image}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;" />
        <span class="photo-credit">Photo: <a href="${d.photoCreditUrl}" target="_blank" rel="noopener noreferrer">${d.photoCredit}</a></span>
      </div>

      <div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:1.35rem;margin-bottom:1.35rem;">
        <div>
          <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.5rem;">
            <span class="badge badge-blue">${d.categoryBadge}</span>
            <span class="badge badge-neutral">${d.entryType}</span>
          </div>
          <h3 style="font-size:1.2rem;color:var(--navy-900);margin-bottom:0.4rem;">${d.visaType}</h3>
          <p style="color:var(--gray-600);font-size:0.9rem;margin-bottom:0.9rem;">${d.overview}</p>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.65rem;background:var(--gray-50);padding:0.9rem;border-radius:var(--radius-sm);border:1px solid var(--gray-200);">
            <div>
              <div class="dest-spec-label">Standard Processing</div>
              <div class="dest-spec-val">${d.processingTime}</div>
            </div>
            <div>
              <div class="dest-spec-label">Priority Processing</div>
              <div class="dest-spec-val" style="color:var(--blue-600);">${d.expressTime}</div>
            </div>
            <div>
              <div class="dest-spec-label">Document Validity</div>
              <div class="dest-spec-val">${d.validity}</div>
            </div>
            <div>
              <div class="dest-spec-label">Maximum Stay</div>
              <div class="dest-spec-val">${d.maxStay}</div>
            </div>
          </div>
        </div>
        <div style="background:var(--gray-50);border:1px solid var(--gray-200);padding:1.15rem;border-radius:var(--radius-md);display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:700;margin-bottom:0.45rem;">Transparent Fee Breakdown</div>
            <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--gray-200);font-size:0.86rem;">
              <span style="color:var(--gray-600);">Government Fee</span>
              <strong>${formatMoney(d.govFeeUSD)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--gray-200);font-size:0.86rem;">
              <span style="color:var(--gray-600);">OnePass Service Fee</span>
              <strong>${formatMoney(d.serviceFeeUSD)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:0.6rem 0 0;font-size:1.05rem;font-weight:800;color:var(--navy-900);">
              <span>Total Per Person</span>
              <span style="color:var(--blue-600);">${formatMoney(totalUSD)}</span>
            </div>
          </div>
          <div style="margin-top:1rem;">
            <a href="apply.html?country=${d.id}" class="btn btn-primary btn-block">
              <span>Start Application</span> ${SVG_ARROW}
            </a>
          </div>
        </div>
      </div>

      <h4 style="font-size:0.92rem;color:var(--navy-900);margin-bottom:0.55rem;font-weight:700;">
        Required Documents (${d.documents.length})
      </h4>
      <ul style="display:grid;gap:0.45rem;margin-bottom:1.25rem;">
        ${d.documents
          .map(
            (doc) => `
          <li style="display:flex;align-items:center;gap:0.55rem;background:var(--gray-50);border:1px solid var(--gray-200);padding:0.6rem 0.85rem;border-radius:var(--radius-xs);font-size:0.86rem;color:var(--navy-900);">
            <span style="color:var(--emerald-600);display:flex;">${SVG_CHECK}</span> ${doc}
          </li>
        `
          )
          .join('')}
      </ul>

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;padding-top:0.9rem;border-top:1px solid var(--gray-200);font-size:0.78rem;color:var(--gray-500);">
        <div>
          <strong>Government Portal Disclosure:</strong> You may also apply directly via the official government website at
          <a href="${d.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--blue-600);text-decoration:underline;">${d.govPortal}</a>
          for the ${formatMoney(d.govFeeUSD)} statutory fee alone.
        </div>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print Checklist</button>
      </div>
    `;

    modal.classList.add('open');
  };

  window.opvCloseCountryModal = function () {
    const modal = document.getElementById('countryDetailModal');
    if (modal) modal.classList.remove('open');
  };

  /* --------------------------------------------------------------------------
     7. Homepage Fee & Turnaround Calculator
     -------------------------------------------------------------------------- */
  function initFeeCalculator() {
    const destSelect = document.getElementById('calcDestination');
    const travelersInput = document.getElementById('calcTravelers');
    const tierRadios = document.querySelectorAll('input[name="calcTier"]');
    const protectionCheck = document.getElementById('calcProtection');
    if (!destSelect || !travelersInput) return;

    function updateCalc() {
      const dest = DATA.destinations.find((d) => d.id === destSelect.value) || DATA.destinations[0];
      const count = Math.max(1, Math.min(20, parseInt(travelersInput.value || '1', 10)));
      let tierAddUSD = 0;
      let speedLabel = dest.processingTime;

      tierRadios.forEach((r) => {
        if (r.checked) {
          if (r.value === 'express') {
            tierAddUSD = 29;
            speedLabel = '24 – 48 Hours Express';
          } else if (r.value === 'rush') {
            tierAddUSD = 59;
            speedLabel = dest.expressTime;
          }
        }
      });

      const protectUSD = protectionCheck && protectionCheck.checked ? 19 : 0;
      const perPersonUSD = dest.govFeeUSD + dest.serviceFeeUSD + tierAddUSD + protectUSD;
      const grandTotalUSD = perPersonUSD * count;

      const elGov = document.getElementById('calcGovFee');
      const elSvc = document.getElementById('calcServiceFee');
      const elSpeed = document.getElementById('calcSpeedOut');
      const elTotal = document.getElementById('calcTotalOut');
      const elApplyBtn = document.getElementById('calcApplyLink');

      if (elGov) elGov.textContent = `${formatMoney(dest.govFeeUSD)} × ${count}`;
      if (elSvc) elSvc.textContent = `${formatMoney(dest.serviceFeeUSD + tierAddUSD + protectUSD)} × ${count}`;
      if (elSpeed) elSpeed.textContent = speedLabel;
      if (elTotal) elTotal.textContent = formatMoney(grandTotalUSD);
      if (elApplyBtn) elApplyBtn.href = `apply.html?country=${dest.id}&travelers=${count}`;
    }

    window.opvRefreshCalculator = updateCalc;

    destSelect.addEventListener('change', updateCalc);
    travelersInput.addEventListener('input', updateCalc);
    tierRadios.forEach((r) => r.addEventListener('change', updateCalc));
    if (protectionCheck) protectionCheck.addEventListener('change', updateCalc);
    updateCalc();
  }

  /* --------------------------------------------------------------------------
     8. Application Wizard (apply.html)
     -------------------------------------------------------------------------- */
  function initApplicationWizard() {
    const wizardRoot = document.getElementById('applicationWizard');
    if (!wizardRoot) return;

    const params = new URLSearchParams(window.location.search);
    const initialCountry = params.get('country') || 'uae';
    const initialNat = params.get('nationality') || 'US';
    const initialTravelers = params.get('travelers') || '1';

    const destSelect = document.getElementById('wizDestination');
    const natSelect = document.getElementById('wizNationality');
    const travInput = document.getElementById('wizTravelers');

    if (destSelect && DATA.destinations.some((d) => d.id === initialCountry)) {
      destSelect.value = initialCountry;
    }
    if (natSelect && DATA.nationalities.some((n) => n.code === initialNat)) {
      natSelect.value = initialNat;
    }
    if (travInput) {
      travInput.value = initialTravelers;
    }

    let currentStep = 1;
    let selectedTier = 'standard';
    let promoDiscountRate = 0;

    function showStep(step) {
      currentStep = step;
      document.querySelectorAll('.wizard-pane').forEach((pane) => {
        pane.classList.toggle('active', parseInt(pane.getAttribute('data-step'), 10) === step);
      });
      document.querySelectorAll('.wizard-step-indicator').forEach((ind) => {
        const s = parseInt(ind.getAttribute('data-step'), 10);
        ind.classList.toggle('active', s === step);
        ind.classList.toggle('completed', s < step);
      });
      window.scrollTo({ top: 100, behavior: 'smooth' });
      updateSummary();
    }

    window.opvGoToStep = showStep;

    document.querySelectorAll('.wizard-step-indicator').forEach((ind) => {
      ind.addEventListener('click', () => {
        const s = parseInt(ind.getAttribute('data-step'), 10);
        if (s <= 4) showStep(s);
      });
    });

    document.querySelectorAll('.tier-option').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.tier-option').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTier = card.getAttribute('data-tier') || 'standard';
        updateSummary();
      });
    });

    const scanBtn = document.getElementById('simulateOcrBtn');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        const statusEl = document.getElementById('ocrScanStatus');
        scanBtn.disabled = true;
        scanBtn.textContent = 'Reading Passport Details...';

        setTimeout(() => {
          document.getElementById('wizFirstName').value = 'ALEXANDER JAMES';
          document.getElementById('wizLastName').value = 'VANCE';
          document.getElementById('wizPassportNo').value = 'N84920148';
          document.getElementById('wizDob').value = '1991-06-14';
          document.getElementById('wizPassportExpiry').value = '2032-09-22';
          document.getElementById('wizEmail').value = 'alex.vance@globaltravel.io';
          document.getElementById('wizPhone').value = '+1 (415) 890-4421';

          scanBtn.disabled = false;
          scanBtn.textContent = 'Sample Passport Filled';
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.innerHTML = `<span style="color:var(--emerald-700);font-weight:600;">Sample passport details filled automatically.</span>`;
          }
        }, 400);
      });
    }

    const promoBtn = document.getElementById('applyPromoBtn');
    if (promoBtn) {
      promoBtn.addEventListener('click', () => {
        const code = (document.getElementById('wizPromoInput').value || '').trim().toUpperCase();
        const msg = document.getElementById('promoMsg');
        if (code === 'ONEPASS10' || code === 'VIP10' || code === 'WELCOME') {
          promoDiscountRate = 0.1;
          if (msg) {
            msg.style.color = 'var(--emerald-700)';
            msg.textContent = 'Promo code applied: 10% off service fee.';
          }
        } else {
          promoDiscountRate = 0;
          if (msg) {
            msg.style.color = 'var(--red-600)';
            msg.textContent = 'Use code ONEPASS10 for 10% off.';
          }
        }
        updateSummary();
      });
    }

    function updateSummary() {
      const destId = destSelect ? destSelect.value : 'uae';
      const dest = DATA.destinations.find((d) => d.id === destId) || DATA.destinations[0];
      const count = Math.max(1, parseInt(travInput ? travInput.value : '1', 10) || 1);

      let tierAddUSD = 0;
      let tierName = 'Standard (' + dest.processingTime + ')';
      if (selectedTier === 'express') {
        tierAddUSD = 29;
        tierName = 'Express (24–48 hrs)';
      } else if (selectedTier === 'rush') {
        tierAddUSD = 59;
        tierName = 'Priority (' + dest.expressTime + ')';
      }

      const addonRejection = document.getElementById('addonRejection')?.checked ? 19 : 0;
      const rawServiceUSD = (dest.serviceFeeUSD + tierAddUSD + addonRejection) * count;
      const discountUSD = Math.round(rawServiceUSD * promoDiscountRate);
      const govTotalUSD = dest.govFeeUSD * count;
      const grandTotalUSD = govTotalUSD + rawServiceUSD - discountUSD;

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = val;
      };

      setTxt('sumCountryTitle', dest.name);
      setTxt('sumVisaType', dest.visaType);
      setTxt('sumTravelers', `${count} Applicant${count > 1 ? 's' : ''}`);
      setTxt('sumTierName', tierName);
      setTxt('sumGovFee', formatMoney(govTotalUSD));
      setTxt('sumServiceFee', formatMoney(dest.serviceFeeUSD * count));
      setTxt('sumTierFee', tierAddUSD > 0 ? '+' + formatMoney(tierAddUSD * count) : 'Included');
      setTxt('sumAddonsFee', addonRejection > 0 ? '+' + formatMoney(addonRejection * count) : formatMoney(0));
      setTxt('sumDiscountFee', discountUSD > 0 ? '-' + formatMoney(discountUSD) : formatMoney(0));
      setTxt('sumGrandTotal', formatMoney(grandTotalUSD));
    }

    window.opvRefreshWizardSummary = updateSummary;

    if (destSelect) destSelect.addEventListener('change', updateSummary);
    if (travInput) travInput.addEventListener('input', updateSummary);
    const rejEl = document.getElementById('addonRejection');
    if (rejEl) rejEl.addEventListener('change', updateSummary);

    const submitBtn = document.getElementById('completeOrderBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const destId = destSelect ? destSelect.value : 'uae';
        const dest = DATA.destinations.find((d) => d.id === destId) || DATA.destinations[0];
        const natCode = natSelect ? natSelect.value : 'US';
        const nat = DATA.nationalities.find((n) => n.code === natCode) || DATA.nationalities[0];

        const firstName = (document.getElementById('wizFirstName')?.value || 'ALEXANDER').trim();
        const lastName = (document.getElementById('wizLastName')?.value || 'VANCE').trim();
        const passportNo = (document.getElementById('wizPassportNo')?.value || 'N84920148').trim();
        const randomNum = Math.floor(10000 + Math.random() * 89999);
        const orderId = `OPV-2026-${randomNum}`;

        const newOrder = {
          id: orderId,
          applicant: `${firstName} ${lastName}`,
          passportNo: passportNo,
          nationality: nat.name,
          destination: dest.name,
          visaType: dest.visaType,
          submittedAt: 'Oct 27, 2026',
          tier: selectedTier.toUpperCase(),
          statusBadge: 'DOCUMENT REVIEW IN PROGRESS',
          statusType: 'blue',
          specialist: 'Sarah Al-Mansoor (Senior Visa Reviewer)',
          evisaNumber: 'Assigned upon Submission',
          validUntil: dest.validity,
          steps: [
            { title: 'Application & Payment Received', time: 'Completed', state: 'done', note: `Order ${orderId} confirmed.` },
            { title: 'Specialist Passport & Document Verification', time: 'In Progress', state: 'current', note: 'Assigned specialist is reviewing your passport details and photo.' },
            { title: 'Photograph & File Formatting', time: 'Queued', state: 'pending', note: 'Formatting to destination specifications.' },
            { title: `Submitted to ${dest.name} Immigration Portal`, time: 'Upcoming', state: 'pending', note: 'Electronic filing.' },
            { title: 'Immigration Review', time: 'Upcoming', state: 'pending', note: 'Updates sent by email.' },
            { title: 'Travel Document Delivery', time: 'Upcoming', state: 'pending', note: 'Delivered via email and downloadable in Tracker.' }
          ]
        };

        try {
          const saved = JSON.parse(localStorage.getItem('opv_custom_orders') || '{}');
          saved[orderId] = newOrder;
          localStorage.setItem('opv_custom_orders', JSON.stringify(saved));
        } catch (err) {}

        const confirmBox = document.getElementById('orderConfirmationView');
        const wizardMain = document.getElementById('wizardMainGrid');
        if (confirmBox && wizardMain) {
          wizardMain.style.display = 'none';
          confirmBox.style.display = 'block';
          confirmBox.innerHTML = `
            <div class="wizard-card" style="max-width:700px;margin:0 auto;text-align:center;padding:2.5rem 2rem;">
              <span class="badge badge-emerald" style="margin-bottom:0.65rem;">Application Received</span>
              <h2 style="font-size:1.65rem;color:var(--navy-900);font-weight:800;margin-bottom:0.45rem;">
                Thank You — Your Application Is Under Review
              </h2>
              <p style="color:var(--gray-600);max-width:500px;margin:0 auto 1.5rem;font-size:0.92rem;">
                Your ${dest.name} application for <strong>${firstName} ${lastName}</strong> has been received and assigned to our document review team.
              </p>

              <div style="background:var(--gray-50);border:1px solid var(--gray-200);padding:1.35rem;border-radius:var(--radius-md);text-align:left;margin-bottom:1.5rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;padding-bottom:0.9rem;border-bottom:1px solid var(--gray-200);">
                  <div>
                    <div class="dest-spec-label">Tracking Reference Number</div>
                    <div class="mono" style="font-size:1.3rem;font-weight:800;color:var(--blue-600);">${orderId}</div>
                  </div>
                  <a href="track.html?id=${orderId}" class="btn btn-primary btn-sm">
                    <span>Track Status</span> ${SVG_ARROW}
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;padding-top:0.9rem;font-size:0.84rem;">
                  <div>
                    <div class="dest-spec-label">Applicant</div>
                    <strong style="color:var(--navy-900);">${firstName} ${lastName}</strong>
                  </div>
                  <div>
                    <div class="dest-spec-label">Destination</div>
                    <strong style="color:var(--navy-900);">${dest.name}</strong>
                  </div>
                  <div>
                    <div class="dest-spec-label">Document Type</div>
                    <strong style="color:var(--navy-900);">${dest.visaType}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;">
                <a href="track.html?id=${orderId}" class="btn btn-navy">Open Application Tracker</a>
                <button type="button" class="btn btn-outline" onclick="window.print()">Print Receipt</button>
                <a href="index.html" class="btn btn-outline">Return Home</a>
              </div>
            </div>
          `;
          window.scrollTo({ top: 80, behavior: 'smooth' });
        }
      });
    }

    updateSummary();
  }

  /* --------------------------------------------------------------------------
     9. Live Application Status Tracker (track.html)
     -------------------------------------------------------------------------- */
  function initOrderTracker() {
    const form = document.getElementById('trackOrderForm');
    const out = document.getElementById('trackResultContainer');
    if (!form || !out) return;

    function renderOrder(orderIdRaw) {
      const code = (orderIdRaw || '').trim().toUpperCase();
      let customOrders = {};
      try {
        customOrders = JSON.parse(localStorage.getItem('opv_custom_orders') || '{}');
      } catch (e) {}

      const order = customOrders[code] || DATA.sampleOrders[code] || DATA.sampleOrders['OPV-2026-84920'];

      out.innerHTML = `
        <div class="wizard-card" style="margin-top:1.5rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-bottom:1.15rem;border-bottom:1px solid var(--gray-200);">
            <div>
              <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.3rem;">
                <span class="mono" style="font-size:1.2rem;font-weight:800;color:var(--navy-900);">${order.id}</span>
                <span class="badge badge-${order.statusType}">${order.statusBadge}</span>
              </div>
              <p style="font-size:0.84rem;color:var(--gray-500);">
                Submitted ${order.submittedAt} • Reviewer: <strong style="color:var(--navy-900);">${order.specialist}</strong>
              </p>
            </div>
            <div style="display:flex;gap:0.55rem;flex-wrap:wrap;">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print Summary</button>
              <button type="button" class="btn btn-primary btn-sm" onclick="window.opvShowSampleEvisaModal('${order.id}')">
                Preview Travel Document PDF
              </button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;padding:1.1rem 0;border-bottom:1px solid var(--gray-200);font-size:0.85rem;">
            <div>
              <div class="dest-spec-label">Applicant Name</div>
              <div class="dest-spec-val">${order.applicant}</div>
            </div>
            <div>
              <div class="dest-spec-label">Passport Number</div>
              <div class="dest-spec-val mono">${order.passportNo} (${order.nationality})</div>
            </div>
            <div>
              <div class="dest-spec-label">Destination &amp; Document</div>
              <div class="dest-spec-val">${order.destination} — ${order.visaType}</div>
            </div>
            <div>
              <div class="dest-spec-label">Document Reference</div>
              <div class="dest-spec-val" style="color:var(--blue-600);">${order.evisaNumber}</div>
            </div>
          </div>

          <h3 style="font-size:1rem;color:var(--navy-900);margin-top:1.25rem;font-weight:700;">
            Application Progress
          </h3>
          <div class="timeline-list">
            ${order.steps
              .map(
                (s) => `
              <div class="timeline-item ${s.state}">
                <div class="timeline-dot"></div>
                <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
                  <h4 style="font-size:0.92rem;font-weight:700;color:var(--navy-900);">${s.title}</h4>
                  <span class="mono" style="font-size:0.74rem;color:var(--gray-500);">${s.time}</span>
                </div>
                <p style="font-size:0.84rem;color:var(--gray-600);margin-top:0.15rem;">${s.note}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('trackOrderIdInput').value;
      renderOrder(val);
    });

    document.querySelectorAll('.js-demo-track-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        document.getElementById('trackOrderIdInput').value = id;
        renderOrder(id);
      });
    });

    const params = new URLSearchParams(window.location.search);
    const initialId = params.get('id') || 'OPV-2026-84920';
    const inp = document.getElementById('trackOrderIdInput');
    if (inp) inp.value = initialId;
    renderOrder(initialId);
  }

  window.opvShowSampleEvisaModal = function () {
    const modal = document.getElementById('evisaPreviewModal');
    if (modal) modal.classList.add('open');
  };

  window.opvCloseSampleEvisaModal = function () {
    const modal = document.getElementById('evisaPreviewModal');
    if (modal) modal.classList.remove('open');
  };

  /* --------------------------------------------------------------------------
     10. FAQ Accordions & Policy Tabs
     -------------------------------------------------------------------------- */
  function initFaqAndPolicies() {
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (item) item.classList.toggle('open');
      });
    });

    const faqSearch = document.getElementById('faqSearchInput');
    if (faqSearch) {
      faqSearch.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll('.faq-item').forEach((item) => {
          const text = item.textContent.toLowerCase();
          item.style.display = !q || text.includes(q) ? 'block' : 'none';
        });
      });
    }

    const policyBtns = document.querySelectorAll('.policy-nav-btn');
    if (policyBtns.length > 0) {
      function activatePolicy(tabId) {
        const cleanId = tabId.replace('#', '') || 'terms';
        policyBtns.forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-policy') === cleanId);
        });
        document.querySelectorAll('.policy-section').forEach((sec) => {
          sec.classList.toggle('active', sec.id === 'policy-' + cleanId);
        });
      }

      policyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-policy');
          history.replaceState(null, '', '#' + target);
          activatePolicy(target);
          window.scrollTo({ top: 120, behavior: 'smooth' });
        });
      });

      window.addEventListener('hashchange', () => {
        if (window.location.hash) activatePolicy(window.location.hash);
      });

      if (window.location.hash) {
        activatePolicy(window.location.hash);
      }
    }

    const contactForm = document.getElementById('contactSupportForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const notice = document.getElementById('contactFormSuccess');
        if (notice) {
          notice.style.display = 'block';
          notice.textContent = 'Thank you. Your inquiry has been received and a specialist will reply by email shortly.';
        }
        contactForm.reset();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateSelects();
    initCurrencySelectors();
    initNavigationAndCookies();
    initEligibilityChecker();
    initDestinationsGrid();
    initFeeCalculator();
    initApplicationWizard();
    initOrderTracker();
    initFaqAndPolicies();
    updateAllCurrencyDisplays();
  });
})();
