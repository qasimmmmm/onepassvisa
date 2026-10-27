/* ==========================================================================
   OnePassVisa.com — Shared Interactive Application Engine
   ========================================================================== */

(function () {
  'use strict';

  const DATA = window.ONEPASS_DATA;
  let currentCurrency = localStorage.getItem('opv_currency') || 'USD';

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

    // Re-render dynamic views if present
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
     2. Mobile Navigation & Shared UI
     -------------------------------------------------------------------------- */
  function initNavigation() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('mainNavLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
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
        .map((n) => `<option value="${n.code}" ${n.code === defaultVal ? 'selected' : ''}>${n.flag} ${n.name} Citizen</option>`)
        .join('');
    });

    const destSelects = document.querySelectorAll('.js-destination-select');
    destSelects.forEach((select) => {
      const defaultVal = select.getAttribute('data-default') || 'uae';
      select.innerHTML = DATA.destinations
        .map((d) => `<option value="${d.id}" ${d.id === defaultVal ? 'selected' : ''}>${d.flag} ${d.name} — ${d.categoryBadge}</option>`)
        .join('');
    });
  }

  /* --------------------------------------------------------------------------
     4. Interactive Visa Eligibility Checker (Hero Widget)
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
            <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin-bottom:0.55rem;">
              <span class="badge badge-emerald">✓ Eligible for Online Processing</span>
              <span class="badge badge-dark">${dest.categoryBadge} • ${purpose}</span>
              <span class="badge badge-gold">Approval Rate: ${dest.approvalRate}</span>
            </div>
            <h3 style="font-size:1.35rem;font-weight:800;margin-bottom:0.35rem;">
              ${nat.flag} ${nat.name} → ${dest.flag} ${dest.name}: <span style="color:var(--emerald-400);">${dest.visaType}</span>
            </h3>
            <p style="font-size:0.9rem;color:var(--slate-300);">
              ${dest.overview}
            </p>
          </div>
          <div class="result-metrics">
            <div>
              <div style="font-size:0.7rem;color:var(--slate-400);text-transform:uppercase;font-weight:700;">Processing</div>
              <div style="font-size:0.95rem;font-weight:800;color:var(--white);margin-top:2px;">${dest.processingTime}</div>
              <div style="font-size:0.72rem;color:var(--emerald-400);">⚡ ${dest.expressTime}</div>
            </div>
            <div>
              <div style="font-size:0.7rem;color:var(--slate-400);text-transform:uppercase;font-weight:700;">Max Stay</div>
              <div style="font-size:0.95rem;font-weight:800;color:var(--white);margin-top:2px;">${dest.maxStay}</div>
              <div style="font-size:0.72rem;color:var(--slate-300);">${dest.entryType}</div>
            </div>
            <div>
              <div style="font-size:0.7rem;color:var(--slate-400);text-transform:uppercase;font-weight:700;">Total Fee</div>
              <div style="font-size:1.15rem;font-weight:800;color:var(--emerald-400);margin-top:2px;" data-usd="${totalUSD}">${formatMoney(totalUSD)}</div>
              <div style="font-size:0.7rem;color:var(--slate-300);">Gov + Service incl.</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.55rem;">
            <a href="apply.html?country=${dest.id}&nationality=${nat.code}&purpose=${encodeURIComponent(purpose)}" class="btn btn-primary">
              Start Application →
            </a>
            <button type="button" class="btn btn-ghost-light btn-sm" onclick="window.opvOpenCountryModal('${dest.id}')">
              View Full Checklist (${dest.documents.length} items)
            </button>
          </div>
        </div>
      `;
      drawer.classList.add('active');
    }

    form.addEventListener('submit', runCheck);
  }

  /* --------------------------------------------------------------------------
     5. Destination Cards Grid, Filter & Search
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
          <div style="grid-column:1/-1;text-align:center;padding:3rem;background:var(--white);border-radius:var(--radius-lg);border:1px solid var(--slate-200);">
            <h3 style="font-size:1.25rem;color:var(--navy-900);margin-bottom:0.5rem;">No matching destinations found</h3>
            <p style="color:var(--slate-500);margin-bottom:1.25rem;">Try searching for another country or contact our 24/7 Custom Embassy Desk for any of 190+ global jurisdictions.</p>
            <a href="apply.html" class="btn btn-primary btn-sm">Start Custom Visa Request</a>
          </div>
        `;
        return;
      }

      grid.innerHTML = list
        .map((d) => {
          const totalUSD = d.govFeeUSD + d.serviceFeeUSD;
          return `
            <article class="dest-card">
              <div class="dest-card-visual" style="background-image:url('${d.image}')">
                <div class="dest-visual-top">
                  <span class="badge badge-dark">${d.categoryBadge}</span>
                  <span class="badge badge-emerald">⚡ ${d.expressTime}</span>
                </div>
                <div class="dest-visual-bottom">
                  <h3 class="dest-country-title">
                    <span>${d.flag}</span> ${d.name}
                  </h3>
                  <span style="font-size:0.75rem;font-weight:700;color:var(--emerald-400);background:rgba(5,12,26,0.75);padding:0.2rem 0.55rem;border-radius:99px;">
                    ${d.approvalRate} Approved
                  </span>
                </div>
              </div>
              <div class="dest-card-body">
                <div>
                  <div style="font-size:0.86rem;font-weight:700;color:var(--teal-600);margin-bottom:0.75rem;">
                    ${d.visaType}
                  </div>
                  <div class="dest-specs">
                    <div>
                      <div class="dest-spec-label">Standard Speed</div>
                      <div class="dest-spec-val">${d.processingTime}</div>
                    </div>
                    <div>
                      <div class="dest-spec-label">Max Stay</div>
                      <div class="dest-spec-val">${d.maxStay}</div>
                    </div>
                    <div>
                      <div class="dest-spec-label">Entry Type</div>
                      <div class="dest-spec-val">${d.entryType}</div>
                    </div>
                    <div>
                      <div class="dest-spec-label">Gov Fee + Service</div>
                      <div class="dest-spec-val">${formatMoney(d.govFeeUSD)} + ${formatMoney(d.serviceFeeUSD)}</div>
                    </div>
                  </div>
                </div>
                <div class="dest-card-footer">
                  <div>
                    <div class="dest-price-label">All-Inclusive Total</div>
                    <div class="dest-price-val">${formatMoney(totalUSD)} <span>/ applicant</span></div>
                  </div>
                  <div style="display:flex;gap:0.45rem;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="window.opvOpenCountryModal('${d.id}')" title="View Requirements Checklist">
                      Checklist
                    </button>
                    <a href="apply.html?country=${d.id}" class="btn btn-navy btn-sm">
                      Apply →
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

    // Region pill buttons
    document.querySelectorAll('.js-region-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.js-region-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeRegion = btn.getAttribute('data-region') || 'all';
        renderGrid();
      });
    });

    // Search input
    const searchInput = document.getElementById('destSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderGrid();
      });
    }

    renderGrid();

    // Check URL param for modal auto-open
    const params = new URLSearchParams(window.location.search);
    const openCountry = params.get('country');
    if (openCountry && document.getElementById('countryDetailModal')) {
      window.opvOpenCountryModal(openCountry);
    }
  }

  /* --------------------------------------------------------------------------
     6. Country Visa Requirement Detail Modal
     -------------------------------------------------------------------------- */
  window.opvOpenCountryModal = function (destId) {
    const modal = document.getElementById('countryDetailModal');
    const body = document.getElementById('countryModalBody');
    const title = document.getElementById('countryModalTitle');
    if (!modal || !body) return;

    const d = DATA.destinations.find((item) => item.id === destId) || DATA.destinations[0];
    const totalUSD = d.govFeeUSD + d.serviceFeeUSD;

    title.innerHTML = `${d.flag} ${d.name} — Official Visa Requirements & Fee Breakdown`;
    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:1.5rem;margin-bottom:1.75rem;" class="modal-top-grid">
        <div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem;">
            <span class="badge badge-emerald">${d.categoryBadge}</span>
            <span class="badge badge-royal">Approval Rate: ${d.approvalRate}</span>
            <span class="badge badge-gold">${d.entryType}</span>
          </div>
          <h3 style="font-size:1.35rem;color:var(--navy-900);margin-bottom:0.5rem;">${d.visaType}</h3>
          <p style="color:var(--slate-600);font-size:0.95rem;margin-bottom:1rem;">${d.overview}</p>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;background:var(--slate-50);padding:1rem;border-radius:var(--radius-md);border:1px solid var(--slate-200);">
            <div>
              <div class="dest-spec-label">Standard Processing</div>
              <div class="dest-spec-val">${d.processingTime}</div>
            </div>
            <div>
              <div class="dest-spec-label">Super Rush Option</div>
              <div class="dest-spec-val" style="color:var(--emerald-600);">⚡ ${d.expressTime}</div>
            </div>
            <div>
              <div class="dest-spec-label">Visa Validity</div>
              <div class="dest-spec-val">${d.validity}</div>
            </div>
            <div>
              <div class="dest-spec-label">Maximum Stay</div>
              <div class="dest-spec-val">${d.maxStay}</div>
            </div>
          </div>
        </div>
        <div style="background:var(--navy-900);color:var(--white);padding:1.4rem;border-radius:var(--radius-lg);display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--emerald-400);font-weight:800;margin-bottom:0.5rem;">Transparent Pricing</div>
            <div style="display:flex;justify-content:space-between;padding:0.45rem 0;border-bottom:1px solid rgba(255,255,255,0.12);font-size:0.88rem;">
              <span>Government Immigration Fee</span>
              <strong>${formatMoney(d.govFeeUSD)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:0.45rem 0;border-bottom:1px solid rgba(255,255,255,0.12);font-size:0.88rem;">
              <span>OnePass 68-Point Audit & Filing</span>
              <strong>${formatMoney(d.serviceFeeUSD)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:0.75rem 0 0;font-size:1.15rem;font-weight:800;color:var(--emerald-400);">
              <span>Total Per Traveler</span>
              <span>${formatMoney(totalUSD)}</span>
            </div>
          </div>
          <div style="margin-top:1.25rem;">
            <a href="apply.html?country=${d.id}" class="btn btn-primary" style="width:100%;">
              Apply for ${d.name} Visa →
            </a>
            <div style="font-size:0.72rem;color:var(--slate-400);text-align:center;margin-top:0.5rem;">
              Includes 100% Privacy Encryption & Specialist Review
            </div>
          </div>
        </div>
      </div>

      <h4 style="font-size:1.05rem;color:var(--navy-900);margin-bottom:0.75rem;font-weight:800;">
        📋 Required Document Checklist (${d.documents.length} Items)
      </h4>
      <ul style="display:grid;gap:0.6rem;margin-bottom:1.5rem;">
        ${d.documents
          .map(
            (doc) => `
          <li style="display:flex;align-items:center;gap:0.65rem;background:var(--emerald-50);border:1px solid var(--emerald-100);padding:0.75rem 1rem;border-radius:var(--radius-sm);font-size:0.92rem;font-weight:600;color:var(--navy-900);">
            <span style="color:var(--emerald-600);font-weight:800;">✓</span> ${doc}
          </li>
        `
          )
          .join('')}
      </ul>

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-top:1rem;border-top:1px solid var(--slate-200);font-size:0.82rem;color:var(--slate-500);">
        <div>
          <strong>Government Transparency Link:</strong> Travelers may also apply directly via the official government portal at
          <a href="${d.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--royal-600);text-decoration:underline;">${d.govPortal}</a>
          without our concierge audit service.
        </div>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Print Checklist</button>
      </div>
    `;

    modal.classList.add('open');
  };

  window.opvCloseCountryModal = function () {
    const modal = document.getElementById('countryDetailModal');
    if (modal) modal.classList.remove('open');
  };

  /* --------------------------------------------------------------------------
     7. Homepage Interactive Fee & Speed Calculator
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
     8. 5-Step Application Wizard (apply.html)
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
      window.scrollTo({ top: 120, behavior: 'smooth' });
      updateSummary();
    }

    window.opvGoToStep = showStep;

    // Step indicator clicks
    document.querySelectorAll('.wizard-step-indicator').forEach((ind) => {
      ind.addEventListener('click', () => {
        const s = parseInt(ind.getAttribute('data-step'), 10);
        if (s <= 5) showStep(s);
      });
    });

    // Processing tier cards
    document.querySelectorAll('.tier-option').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.tier-option').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTier = card.getAttribute('data-tier') || 'standard';
        updateSummary();
      });
    });

    // AI Passport MRZ Scanner Simulator
    const scanBtn = document.getElementById('simulateOcrBtn');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        const statusEl = document.getElementById('ocrScanStatus');
        scanBtn.disabled = true;
        scanBtn.textContent = '🔍 Scanning Passport MRZ & Biometrics...';
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.innerHTML = 'Reading ICAO 9303 Machine Readable Zone (MRZ) lines & verifying check digits...';
        }

        setTimeout(() => {
          document.getElementById('wizFirstName').value = 'ALEXANDER JAMES';
          document.getElementById('wizLastName').value = 'VANCE';
          document.getElementById('wizPassportNo').value = 'N84920148';
          document.getElementById('wizDob').value = '1991-06-14';
          document.getElementById('wizPassportExpiry').value = '2032-09-22';
          document.getElementById('wizEmail').value = 'alex.vance@globaltravel.io';
          document.getElementById('wizPhone').value = '+1 (415) 890-4421';

          scanBtn.disabled = false;
          scanBtn.textContent = '✓ Passport MRZ Auto-Filled (Scan Again)';
          if (statusEl) {
            statusEl.innerHTML = `
              <strong style="color:var(--emerald-600);">✓ AI OCR Extraction Complete (99.9% Confidence):</strong>
              Populated 7 fields from MRZ <code class="mono" style="background:var(--navy-900);color:var(--emerald-400);padding:2px 6px;border-radius:4px;">P&lt;USAVANCE&lt;&lt;ALEXANDER&lt;JAMES&lt;&lt;&lt;&lt;&lt;&lt;&lt;N849201484USA9106148M3209226</code>
            `;
          }
        }, 700);
      });
    }

    // Document & Photo Biometric Check Simulator
    const photoBtn = document.getElementById('simulatePhotoCheckBtn');
    if (photoBtn) {
      photoBtn.addEventListener('click', () => {
        const out = document.getElementById('photoCheckResult');
        photoBtn.textContent = '✓ Biometric Photo & Passport Scan Verified';
        if (out) {
          out.style.display = 'block';
          out.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-top:0.75rem;text-align:left;font-size:0.8rem;">
              <div style="background:var(--white);padding:0.5rem 0.75rem;border-radius:6px;border:1px solid var(--emerald-400);">✅ <strong>Background:</strong> Pure White (#FFFFFF)</div>
              <div style="background:var(--white);padding:0.5rem 0.75rem;border-radius:6px;border:1px solid var(--emerald-400);">✅ <strong>Head Ratio:</strong> 74% (ICAO Compliant)</div>
              <div style="background:var(--white);padding:0.5rem 0.75rem;border-radius:6px;border:1px solid var(--emerald-400);">✅ <strong>Resolution:</strong> 600×600 DPI Crisp</div>
            </div>
          `;
        }
      });
    }

    // Promo Code button
    const promoBtn = document.getElementById('applyPromoBtn');
    if (promoBtn) {
      promoBtn.addEventListener('click', () => {
        const code = (document.getElementById('wizPromoInput').value || '').trim().toUpperCase();
        const msg = document.getElementById('promoMsg');
        if (code === 'ONEPASS10' || code === 'VIP10' || code === 'WELCOME') {
          promoDiscountRate = 0.1;
          if (msg) {
            msg.style.color = 'var(--emerald-600)';
            msg.textContent = '✓ Promo code applied! 10% discount on service fees.';
          }
        } else {
          promoDiscountRate = 0;
          if (msg) {
            msg.style.color = 'var(--danger-600)';
            msg.textContent = 'Try promo code ONEPASS10 for 10% off.';
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
        tierName = 'Express Priority (24–48 hrs)';
      } else if (selectedTier === 'rush') {
        tierAddUSD = 59;
        tierName = 'Super Rush (' + dest.expressTime + ')';
      }

      const addonRejection = document.getElementById('addonRejection')?.checked ? 19 : 0;
      const addonFlight = document.getElementById('addonFlight')?.checked ? 15 : 0;
      const addonWhatsapp = document.getElementById('addonWhatsapp')?.checked ? 5 : 0;
      const addonsUSD = addonRejection + addonFlight + addonWhatsapp;

      const rawServiceUSD = (dest.serviceFeeUSD + tierAddUSD + addonsUSD) * count;
      const discountUSD = Math.round(rawServiceUSD * promoDiscountRate);
      const govTotalUSD = dest.govFeeUSD * count;
      const grandTotalUSD = govTotalUSD + rawServiceUSD - discountUSD;

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = val;
      };

      setTxt('sumCountryTitle', `${dest.flag} ${dest.name}`);
      setTxt('sumVisaType', dest.visaType);
      setTxt('sumTravelers', `${count} Applicant${count > 1 ? 's' : ''}`);
      setTxt('sumTierName', tierName);
      setTxt('sumGovFee', formatMoney(govTotalUSD));
      setTxt('sumServiceFee', formatMoney(dest.serviceFeeUSD * count));
      setTxt('sumTierFee', tierAddUSD > 0 ? '+' + formatMoney(tierAddUSD * count) : 'Included');
      setTxt('sumAddonsFee', addonsUSD > 0 ? '+' + formatMoney(addonsUSD * count) : formatMoney(0));
      setTxt('sumDiscountFee', discountUSD > 0 ? '-' + formatMoney(discountUSD) : formatMoney(0));
      setTxt('sumGrandTotal', formatMoney(grandTotalUSD));
    }

    window.opvRefreshWizardSummary = updateSummary;

    if (destSelect) destSelect.addEventListener('change', updateSummary);
    if (travInput) travInput.addEventListener('input', updateSummary);
    ['addonRejection', 'addonFlight', 'addonWhatsapp'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updateSummary);
    });

    // Final Submit Order Handler
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
          nationality: `${nat.name} ${nat.flag}`,
          destination: `${dest.name} ${dest.flag}`,
          visaType: dest.visaType,
          submittedAt: 'Just Now • Oct 27, 2026',
          tier: selectedTier.toUpperCase() + ' PRIORITY',
          statusBadge: 'SPECIALIST AUDIT QUEUED',
          statusType: 'emerald',
          specialist: 'Sarah Al-Mansoor (Senior Consular Auditor)',
          evisaNumber: 'Assigned upon Government Dispatch',
          validUntil: dest.validity,
          steps: [
            { title: 'Application & Encrypted Payment Received', time: 'Completed Just Now', state: 'done', note: `Order ${orderId} confirmed with 256-bit SSL.` },
            { title: '68-Point Specialist Document & MRZ Audit', time: 'Active Now (Est. 15 mins)', state: 'current', note: 'Assigned specialist is verifying passport bio page & photo compliance.' },
            { title: 'Biometric Photo Compliance Optimization', time: 'Queued', state: 'pending', note: 'Automated ICAO calibration.' },
            { title: `Dispatched to ${dest.name} Immigration Portal`, time: 'Upcoming', state: 'pending', note: 'Direct government submission.' },
            { title: 'Immigration Authority Security Clearance', time: 'Upcoming', state: 'pending', note: 'Live status notifications enabled.' },
            { title: 'Official eVisa Issued & Delivered', time: 'Upcoming', state: 'pending', note: 'Sent via Email & downloadable in Tracker.' }
          ]
        };

        // Save to localStorage for Track page
        try {
          const saved = JSON.parse(localStorage.getItem('opv_custom_orders') || '{}');
          saved[orderId] = newOrder;
          localStorage.setItem('opv_custom_orders', JSON.stringify(saved));
        } catch (err) {
          console.error(err);
        }

        const confirmBox = document.getElementById('orderConfirmationView');
        const wizardMain = document.getElementById('wizardMainGrid');
        if (confirmBox && wizardMain) {
          wizardMain.style.display = 'none';
          confirmBox.style.display = 'block';
          confirmBox.innerHTML = `
            <div class="wizard-card" style="max-width:780px;margin:0 auto;text-align:center;padding:3rem 2rem;">
              <div style="width:72px;height:72px;border-radius:50%;background:var(--emerald-100);color:var(--emerald-600);font-size:2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-weight:800;">
                ✓
              </div>
              <span class="badge badge-emerald" style="margin-bottom:0.75rem;">256-Bit Encrypted Dossier Created</span>
              <h2 style="font-size:2rem;color:var(--navy-900);font-weight:800;margin-bottom:0.5rem;">
                Application Submitted Successfully!
              </h2>
              <p style="color:var(--slate-600);max-width:540px;margin:0 auto 1.75rem;">
                Your ${dest.name} visa dossier for <strong>${firstName} ${lastName}</strong> has been assigned to Senior Consular Auditor <strong>Sarah Al-Mansoor</strong> for your 68-point pre-submission check.
              </p>

              <div style="background:var(--navy-900);color:var(--white);padding:1.5rem;border-radius:var(--radius-lg);text-align:left;margin-bottom:2rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;padding-bottom:1rem;border-bottom:1px dashed rgba(255,255,255,0.2);">
                  <div>
                    <div style="font-size:0.72rem;color:var(--slate-400);text-transform:uppercase;font-weight:700;">Official OnePass Tracking ID</div>
                    <div class="mono" style="font-size:1.5rem;font-weight:800;color:var(--emerald-400);">${orderId}</div>
                  </div>
                  <a href="track.html?id=${orderId}" class="btn btn-primary btn-sm">
                    Track Live Status →
                  </a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;padding-top:1rem;font-size:0.85rem;">
                  <div>
                    <div style="color:var(--slate-400);font-size:0.72rem;">APPLICANT</div>
                    <strong>${firstName} ${lastName} (${passportNo})</strong>
                  </div>
                  <div>
                    <div style="color:var(--slate-400);font-size:0.72rem;">DESTINATION</div>
                    <strong>${dest.flag} ${dest.name}</strong>
                  </div>
                  <div>
                    <div style="color:var(--slate-400);font-size:0.72rem;">VISA CATEGORY</div>
                    <strong>${dest.visaType}</strong>
                  </div>
                </div>
              </div>

              <div style="display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">
                <a href="track.html?id=${orderId}" class="btn btn-navy">Open Live Application Tracker</a>
                <button type="button" class="btn btn-outline" onclick="window.print()">🖨️ Print Official Receipt</button>
                <a href="index.html" class="btn btn-outline">Return to Homepage</a>
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
        <div class="wizard-card" style="margin-top:2rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;padding-bottom:1.5rem;border-bottom:1px solid var(--slate-200);">
            <div>
              <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;">
                <span class="mono" style="font-size:1.35rem;font-weight:800;color:var(--navy-900);">${order.id}</span>
                <span class="badge badge-${order.statusType}">${order.statusBadge}</span>
              </div>
              <p style="font-size:0.9rem;color:var(--slate-500);">
                Submitted ${order.submittedAt} • Assigned Specialist: <strong style="color:var(--navy-900);">${order.specialist}</strong>
              </p>
            </div>
            <div style="display:flex;gap:0.65rem;flex-wrap:wrap;">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Print Dossier Status</button>
              <button type="button" class="btn btn-primary btn-sm" onclick="window.opvShowSampleEvisaModal('${order.id}')">
                📄 View / Download Official eVisa PDF
              </button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;padding:1.25rem 0;border-bottom:1px solid var(--slate-200);font-size:0.88rem;">
            <div>
              <div class="dest-spec-label">Primary Applicant</div>
              <div class="dest-spec-val">${order.applicant}</div>
            </div>
            <div>
              <div class="dest-spec-label">Passport Number</div>
              <div class="dest-spec-val mono">${order.passportNo} (${order.nationality})</div>
            </div>
            <div>
              <div class="dest-spec-label">Destination & Visa</div>
              <div class="dest-spec-val">${order.destination} — ${order.visaType}</div>
            </div>
            <div>
              <div class="dest-spec-label">eVisa / Permit Ref</div>
              <div class="dest-spec-val" style="color:var(--teal-600);">${order.evisaNumber}</div>
            </div>
          </div>

          <h3 style="font-size:1.15rem;color:var(--navy-900);margin-top:1.5rem;font-weight:800;">
            Live 6-Stage Processing & Consular Audit Log
          </h3>
          <div class="timeline-list">
            ${order.steps
              .map(
                (s) => `
              <div class="timeline-item ${s.state}">
                <div class="timeline-dot"></div>
                <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
                  <h4 style="font-size:0.98rem;font-weight:800;color:var(--navy-900);">${s.title}</h4>
                  <span class="mono" style="font-size:0.76rem;color:var(--slate-500);">${s.time}</span>
                </div>
                <p style="font-size:0.88rem;color:var(--slate-600);margin-top:0.2rem;">${s.note}</p>
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

  window.opvShowSampleEvisaModal = function (orderId) {
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

    // FAQ Search filter on faq.html
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

    // Policy Tab Switching (policies.html)
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
          window.scrollTo({ top: 140, behavior: 'smooth' });
        });
      });

      window.addEventListener('hashchange', () => {
        if (window.location.hash) activatePolicy(window.location.hash);
      });

      if (window.location.hash) {
        activatePolicy(window.location.hash);
      }
    }

    // Contact form handler on about.html
    const contactForm = document.getElementById('contactSupportForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const notice = document.getElementById('contactFormSuccess');
        if (notice) {
          notice.style.display = 'block';
          notice.innerHTML = '✓ Priority Support Ticket #OPV-SUP-9042 Created! A Senior Visa Concierge will reply within 15 minutes.';
        }
        contactForm.reset();
      });
    }
  }

  /* --------------------------------------------------------------------------
     Initialize Everything on DOMContentLoaded
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    populateSelects();
    initCurrencySelectors();
    initNavigation();
    initEligibilityChecker();
    initDestinationsGrid();
    initFeeCalculator();
    initApplicationWizard();
    initOrderTracker();
    initFaqAndPolicies();
    updateAllCurrencyDisplays();
  });
})();
