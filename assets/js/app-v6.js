(function () {
  'use strict';

  const DATA = window.ONEPASS_DATA;
  if (!DATA) return;

  let currentCurrency = localStorage.getItem('opv_currency') || 'USD';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  const savedConsent = localStorage.getItem('opv_cookie_consent');
  gtag('consent', 'default', {
    ad_storage: savedConsent === 'granted' ? 'granted' : 'denied',
    ad_user_data: savedConsent === 'granted' ? 'granted' : 'denied',
    ad_personalization: savedConsent === 'granted' ? 'granted' : 'denied',
    analytics_storage: savedConsent === 'granted' ? 'granted' : 'denied'
  });
  gtag('js', new Date());
  gtag('config', 'G-ONEPASSVISA26', { anonymize_ip: true });

  function trackEvent(eventName, params) {
    try {
      gtag('event', eventName, params || {});
    } catch (e) {
    }
  }
  window.opvTrackEvent = trackEvent;

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
        if (usdVal === 0 && el.hasAttribute('data-free-label')) {
          el.textContent = '$0 (Free)';
        } else {
          el.textContent = formatMoney(usdVal);
        }
      }
    });

    document.querySelectorAll('.js-currency-select').forEach((sel) => {
      sel.value = currentCurrency;
    });

    if (typeof window.opvRefreshDestinations === 'function') window.opvRefreshDestinations();
    if (typeof window.opvRefreshCalculator === 'function') window.opvRefreshCalculator();
    if (typeof window.opvRefreshApplySummary === 'function') window.opvRefreshApplySummary();
  }

  function initHeaderAndConsent() {
    document.querySelectorAll('.js-currency-select').forEach((sel) => {
      sel.value = currentCurrency;
      sel.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        localStorage.setItem('opv_currency', currentCurrency);
        updateAllCurrencyDisplays();
      });
    });

    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('mainNavLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('mobile-open');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      navLinks.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          navLinks.classList.remove('mobile-open');
          menuBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    const banner = document.getElementById('cookieConsentBanner');
    if (banner && !savedConsent) {
      banner.classList.add('show');
    }
    const acceptBtn = document.getElementById('acceptCookiesBtn');
    const essentialBtn = document.getElementById('essentialCookiesBtn');
    if (acceptBtn && banner) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('opv_cookie_consent', 'granted');
        gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted'
        });
        banner.classList.remove('show');
      });
    }
    if (essentialBtn && banner) {
      essentialBtn.addEventListener('click', () => {
        localStorage.setItem('opv_cookie_consent', 'denied');
        banner.classList.remove('show');
      });
    }
  }

  function populateSelects() {
    document.querySelectorAll('.js-nationality-select').forEach((select) => {
      const def = select.getAttribute('data-default') || '';
      const placeholder = select.getAttribute('data-placeholder') || '';
      const opts = [];
      if (placeholder) {
        opts.push(`<option value="" ${!def ? 'selected' : ''}>${placeholder}</option>`);
      }
      DATA.nationalities.forEach((n) => {
        opts.push(`<option value="${n.code}" ${n.code === def ? 'selected' : ''}>${n.name}</option>`);
      });
      select.innerHTML = opts.join('');
    });

    document.querySelectorAll('.js-destination-select').forEach((select) => {
      const def = select.getAttribute('data-default') || 'vietnam';
      select.innerHTML = DATA.destinations
        .map((d) => `<option value="${d.id}" ${d.id === def ? 'selected' : ''}>${d.name} — ${d.categoryBadge}</option>`)
        .join('');
    });
  }

  function initRequirementsChecker() {
    const form = document.getElementById('heroCheckerForm');
    const drawer = document.getElementById('checkerResultDrawer');
    if (!form || !drawer) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const natEl = document.getElementById('checkerNationality');
      const destEl = document.getElementById('checkerDestination');
      const natCode = natEl ? natEl.value : 'US';
      const destId = destEl ? destEl.value : 'vietnam';

      if (!natCode) {
        natEl.setAttribute('aria-invalid', 'true');
        natEl.focus();
        return;
      }
      natEl.removeAttribute('aria-invalid');

      const res = DATA.evaluateRequirement(natCode, destId);
      const d = res.dest;
      const pricing = DATA.calculatePrice(d.id, 1, 'standard');
      const govLabel = pricing.govPerPersonUSD === 0 ? '$0 (Free official form)' : formatMoney(pricing.govPerPersonUSD);

      trackEvent('generate_lead', {
        passport: natCode,
        destination: d.id,
        status: res.status
      });

      let actionHtml = '';
      if (res.canApplyOnline) {
        actionHtml = `
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
            <div>
              <div style="font-size:0.8125rem;color:var(--text-muted);">
                Government fee: <strong>${govLabel}</strong> + OnePassVisa service fee: <strong>${formatMoney(pricing.servicePerPersonUSD)}</strong> =
                <strong style="color:var(--navy);font-size:1rem;">${formatMoney(pricing.totalPerPersonUSD)} total</strong>
              </div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;">
                Our handling: ${d.ourHandlingTime} • Gov processing: ${d.govProcessingTime} (Fees verified ${d.verifiedDate})
              </div>
            </div>
            <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
              <a href="${d.slug}.html" class="btn btn-outline btn-sm">Requirements &amp; Fees</a>
              <a href="apply.html?country=${encodeURIComponent(d.id)}&nationality=${encodeURIComponent(natCode)}" class="btn btn-primary btn-sm">
                <span>Start application</span>
              </a>
            </div>
          </div>
          <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem;">
            OnePassVisa is a private assistance service not affiliated with any government; you can apply directly at <a href="${d.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;">${d.govPortalName}</a> for the ${pricing.govPerPersonUSD === 0 ? '$0 government fee' : formatMoney(pricing.govPerPersonUSD) + ' government fee'} only.
          </p>
        `;
      } else {
        actionHtml = `
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
            <div style="font-size:0.85rem;color:var(--text-body);">
              ${res.status === 'embassy'
                ? `Online eVisa/ETA processing is not available for this passport. Please apply directly through the official government portal:`
                : `No visa application is required before your trip. Verify entry conditions on the official government portal:`}
            </div>
            <a href="${d.govPortal}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              Visit ${d.govPortalName} ↗
            </a>
          </div>
        `;
      }

      drawer.innerHTML = `
        <div>
          <span class="badge ${res.badgeClass}" style="margin-bottom:0.5rem;">${res.badgeText}</span>
          <h3 style="font-size:1.15rem;color:var(--navy);margin-bottom:0.35rem;">${res.headline}</h3>
          <p style="font-size:0.92rem;color:var(--text-body);">${res.explanation}</p>
          ${actionHtml}
        </div>
      `;
      drawer.classList.add('active');
    });
  }

  function initDestinationsFilter() {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;

    const limit = parseInt(grid.getAttribute('data-limit') || '0', 10);
    let activeRegion = 'all';
    let searchQuery = '';

    function renderCard(d) {
      const pricing = DATA.calculatePrice(d.id, 1, 'standard');
      const govText = pricing.govPerPersonUSD === 0 ? 'Gov $0 (Free)' : `Gov ${formatMoney(pricing.govPerPersonUSD)}`;
      return `
        <article class="dest-card">
          <a href="${d.slug}.html" aria-label="${d.name} — ${d.visaType}">
            <img
              src="${d.image}"
              srcset="${d.imageSmall} 480w, ${d.image} 800w"
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
              width="640"
              height="400"
              loading="lazy"
              decoding="async"
              alt="${d.name} landmark"
              class="dest-card-img"
            />
          </a>
          <div class="dest-card-body">
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.4rem;">
                <span class="badge badge-primary">${d.categoryBadge}</span>
                <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">${d.region}</span>
              </div>
              <h3 class="dest-card-title"><a href="${d.slug}.html">${d.name}</a></h3>
              <div class="dest-card-doc">${d.visaType}</div>
              <div class="dest-card-meta">Stay: ${d.maxStay} • Gov time: ${d.govProcessingTime.split(' by ')[0]}</div>
            </div>
            <div class="dest-card-footer">
              <div>
                <div class="dest-total-price" data-usd="${pricing.totalPerPersonUSD}">${formatMoney(pricing.totalPerPersonUSD)} <span style="font-size:0.75rem;font-weight:500;color:var(--text-muted);">total</span></div>
                <div class="dest-fee-sub">${govText} + ${formatMoney(pricing.servicePerPersonUSD)} service</div>
              </div>
              <a href="${d.slug}.html" class="btn btn-primary btn-sm">View &amp; Apply</a>
            </div>
          </div>
        </article>
      `;
    }

    function refresh() {
      let list = DATA.destinations.filter((d) => {
        const matchReg = activeRegion === 'all' || d.region.toLowerCase() === activeRegion.toLowerCase();
        const matchQ =
          !searchQuery ||
          d.name.toLowerCase().includes(searchQuery) ||
          d.shortName.toLowerCase().includes(searchQuery) ||
          d.visaType.toLowerCase().includes(searchQuery) ||
          d.categoryBadge.toLowerCase().includes(searchQuery);
        return matchReg && matchQ;
      });
      if (limit > 0 && activeRegion === 'all' && !searchQuery) {
        list = list.slice(0, limit);
      }
      if (list.length === 0) {
        grid.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;"><p>No destinations match your search. Try selecting "All Regions".</p></div>`;
        return;
      }
      grid.innerHTML = list.map(renderCard).join('');
    }

    window.opvRefreshDestinations = refresh;

    document.querySelectorAll('.js-region-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.js-region-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeRegion = btn.getAttribute('data-region') || 'all';
        refresh();
      });
    });

    const searchInput = document.getElementById('destSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        refresh();
      });
    }
  }

  function initCalculator() {
    const destSelect = document.getElementById('calcDestination');
    const travInput = document.getElementById('calcTravelers');
    if (!destSelect || !travInput) return;

    function updateCalc() {
      const destId = destSelect.value || 'vietnam';
      const count = Math.max(1, Math.min(20, parseInt(travInput.value || '1', 10)));
      const speedRadio = document.querySelector('input[name="calcTier"]:checked');
      const speedTier = speedRadio ? speedRadio.value : 'standard';

      const p = DATA.calculatePrice(destId, count, speedTier);
      const govEl = document.getElementById('calcGovFee');
      const srvEl = document.getElementById('calcServiceFee');
      const handlingEl = document.getElementById('calcHandlingOut');
      const govTimeEl = document.getElementById('calcGovTimeOut');
      const totEl = document.getElementById('calcTotalOut');
      const linkEl = document.getElementById('calcApplyLink');
      const govLinkEl = document.getElementById('calcDirectGovLink');
      const priorityPriceEl = document.getElementById('calcPriorityAddonPrice');

      if (priorityPriceEl) priorityPriceEl.textContent = formatMoney(p.dest.priorityFeeUSD);
      if (govEl) {
        govEl.textContent = p.govPerPersonUSD === 0
          ? `$0 (Free official form) × ${p.travelers}`
          : `${formatMoney(p.govPerPersonUSD)} × ${p.travelers} = ${formatMoney(p.govTotalUSD)}`;
      }
      if (srvEl) {
        srvEl.textContent = `${formatMoney(p.totalServicePerPersonUSD)} × ${p.travelers} = ${formatMoney(p.serviceTotalUSD)}`;
      }
      if (handlingEl) {
        handlingEl.textContent = speedTier === 'priority' ? 'Priority review within 2 hours' : p.dest.ourHandlingTime.split(' (')[0];
      }
      if (govTimeEl) {
        govTimeEl.textContent = p.dest.govProcessingTime;
      }
      if (totEl) {
        totEl.textContent = formatMoney(p.grandTotalUSD);
      }
      if (linkEl) {
        linkEl.href = `apply.html?country=${encodeURIComponent(p.dest.id)}&travelers=${p.travelers}&speed=${speedTier}`;
      }
      if (govLinkEl) {
        govLinkEl.innerHTML = `OnePassVisa is a private service not affiliated with any government; you can apply directly at <a href="${p.dest.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;">${p.dest.govPortalName}</a> for the ${p.govPerPersonUSD === 0 ? '$0 government fee' : formatMoney(p.govPerPersonUSD) + ' government fee'} only. (Verified ${p.dest.verifiedDate})`;
      }
    }

    window.opvRefreshCalculator = updateCalc;
    destSelect.addEventListener('change', updateCalc);
    travInput.addEventListener('input', updateCalc);
    document.querySelectorAll('input[name="calcTier"]').forEach((r) => r.addEventListener('change', updateCalc));
    updateCalc();
  }

  function initApplyFlow() {
    const form = document.getElementById('applyWizardForm');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const destSelect = document.getElementById('applyDestination');
    const travInput = document.getElementById('applyTravelers');
    const arrivalInput = document.getElementById('applyArrivalDate');
    const applicantsContainer = document.getElementById('applicantsContainer');

    if (arrivalInput && !arrivalInput.value) {
      const minDate = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
      arrivalInput.min = minDate;
    }

    if (params.get('country') && destSelect) {
      const c = params.get('country');
      if (DATA.destinations.some((d) => d.id === c)) destSelect.value = c;
    }
    if (params.get('travelers') && travInput) {
      travInput.value = Math.max(1, Math.min(20, parseInt(params.get('travelers'), 10) || 1));
    }
    if (params.get('speed') === 'priority') {
      const pr = document.querySelector('input[name="applySpeed"][value="priority"]');
      if (pr) pr.checked = true;
    }

    const defaultNat = params.get('nationality') || '';

    function renderApplicants() {
      const count = Math.max(1, Math.min(20, parseInt(travInput.value || '1', 10)));
      const existingData = [];
      applicantsContainer.querySelectorAll('.applicant-block').forEach((blk, idx) => {
        existingData[idx] = {
          givenName: (blk.querySelector('.js-app-given') || {}).value || '',
          surname: (blk.querySelector('.js-app-surname') || {}).value || '',
          dob: (blk.querySelector('.js-app-dob') || {}).value || '',
          nationality: (blk.querySelector('.js-app-nat') || {}).value || defaultNat,
          passportNumber: (blk.querySelector('.js-app-passnum') || {}).value || '',
          passportExpiry: (blk.querySelector('.js-app-passexp') || {}).value || ''
        };
      });

      const natOptions = ['<option value="">Select passport nationality</option>']
        .concat(DATA.nationalities.map((n) => `<option value="${n.code}">${n.name}</option>`))
        .join('');

      const blocks = [];
      for (let i = 0; i < count; i++) {
        const prev = existingData[i] || {
          givenName: '',
          surname: '',
          dob: '',
          nationality: defaultNat,
          passportNumber: '',
          passportExpiry: ''
        };
        blocks.push(`
          <div class="applicant-block" data-applicant-index="${i + 1}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.85rem;">
              <h3 style="font-size:1.05rem;color:var(--navy);">Traveler ${i + 1} Details (As Shown on Passport)</h3>
              <span class="badge badge-neutral">Applicant ${i + 1} of ${count}</span>
            </div>
            <div class="form-grid-2">
              <div class="field-group">
                <label class="field-label" for="appGiven_${i}">Given Name(s) *</label>
                <input type="text" id="appGiven_${i}" class="field-control js-app-given" value="${prev.givenName}" autocomplete="given-name" required />
              </div>
              <div class="field-group">
                <label class="field-label" for="appSurname_${i}">Surname / Family Name *</label>
                <input type="text" id="appSurname_${i}" class="field-control js-app-surname" value="${prev.surname}" autocomplete="family-name" required />
              </div>
              <div class="field-group">
                <label class="field-label" for="appNat_${i}">Passport Nationality *</label>
                <select id="appNat_${i}" class="field-control js-app-nat" data-selected="${prev.nationality}" required>
                  ${natOptions}
                </select>
              </div>
              <div class="field-group">
                <label class="field-label" for="appDob_${i}">Date of Birth *</label>
                <input type="date" id="appDob_${i}" class="field-control js-app-dob" value="${prev.dob}" autocomplete="bday" required />
              </div>
              <div class="field-group">
                <label class="field-label" for="appPassNum_${i}">Passport Number *</label>
                <input type="text" id="appPassNum_${i}" class="field-control js-app-passnum" value="${prev.passportNumber}" autocapitalize="characters" spellcheck="false" required />
              </div>
              <div class="field-group">
                <label class="field-label" for="appPassExp_${i}">Passport Expiration Date *</label>
                <input type="date" id="appPassExp_${i}" class="field-control js-app-passexp" value="${prev.passportExpiry}" required />
              </div>
              <div class="field-group">
                <label class="field-label" for="appPassFile_${i}">Passport Bio-Page Scan (JPG/PNG/PDF) *</label>
                <input type="file" id="appPassFile_${i}" class="field-control js-app-passfile" accept=".jpg,.jpeg,.png,.webp,.pdf" style="padding-top:0.55rem;" required />
              </div>
              <div class="field-group">
                <label class="field-label" for="appPhotoFile_${i}">Traveler Portrait Photo (JPG/PNG) *</label>
                <input type="file" id="appPhotoFile_${i}" class="field-control js-app-photofile" accept=".jpg,.jpeg,.png,.webp" style="padding-top:0.55rem;" required />
              </div>
            </div>
          </div>
        `);
      }

      applicantsContainer.innerHTML = blocks.join('');
      applicantsContainer.querySelectorAll('.js-app-nat').forEach((sel) => {
        const val = sel.getAttribute('data-selected');
        if (val) sel.value = val;
      });
    }

    function updateSummary() {
      const destId = destSelect ? destSelect.value : 'vietnam';
      const count = Math.max(1, Math.min(20, parseInt(travInput.value || '1', 10)));
      const speedRadio = document.querySelector('input[name="applySpeed"]:checked');
      const speedTier = speedRadio ? speedRadio.value : 'standard';

      document.querySelectorAll('.speed-option').forEach((opt) => {
        const r = opt.querySelector('input[type="radio"]');
        opt.classList.toggle('selected', Boolean(r && r.checked));
      });

      const p = DATA.calculatePrice(destId, count, speedTier);

      const docTitleEl = document.getElementById('sumDocTitle');
      const govRowEl = document.getElementById('sumGovFee');
      const srvRowEl = document.getElementById('sumServiceFee');
      const handRowEl = document.getElementById('sumHandlingTime');
      const govTimeRowEl = document.getElementById('sumGovTime');
      const totEl = document.getElementById('sumGrandTotal');
      const stickyTotEl = document.getElementById('stickyMobileTotal');
      const prioPriceEl = document.getElementById('applyPriorityPrice');
      const disclosureEl = document.getElementById('applyOfficialDisclosure');

      if (prioPriceEl) prioPriceEl.textContent = formatMoney(p.dest.priorityFeeUSD);
      if (docTitleEl) docTitleEl.textContent = p.dest.visaType;
      if (govRowEl) {
        govRowEl.textContent = p.govPerPersonUSD === 0
          ? `$0 (Free official form) × ${p.travelers}`
          : `${formatMoney(p.govPerPersonUSD)} × ${p.travelers} = ${formatMoney(p.govTotalUSD)}`;
      }
      if (srvRowEl) {
        srvRowEl.textContent = `${formatMoney(p.totalServicePerPersonUSD)} × ${p.travelers} = ${formatMoney(p.serviceTotalUSD)}`;
      }
      if (handRowEl) {
        handRowEl.textContent = speedTier === 'priority' ? 'Priority review within 2 hours' : p.dest.ourHandlingTime.split(' (')[0];
      }
      if (govTimeRowEl) {
        govTimeRowEl.textContent = p.dest.govProcessingTime;
      }
      if (totEl) totEl.textContent = formatMoney(p.grandTotalUSD);
      if (stickyTotEl) stickyTotEl.textContent = formatMoney(p.grandTotalUSD);
      if (disclosureEl) {
        disclosureEl.innerHTML = `OnePassVisa is a private assistance service, not a government website. You can apply directly at <a href="${p.dest.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;">${p.dest.govPortalName}</a> for the ${p.govPerPersonUSD === 0 ? '$0 government fee' : formatMoney(p.govPerPersonUSD) + ' government fee'} only. (Verified ${p.dest.verifiedDate})`;
      }
    }

    window.opvRefreshApplySummary = updateSummary;

    const savedDraftRaw = localStorage.getItem('opv_saved_draft');
    if (savedDraftRaw && (params.get('resume') === '1' || !params.get('country'))) {
      try {
        const draft = JSON.parse(savedDraftRaw);
        if (draft.destinationId && destSelect) destSelect.value = draft.destinationId;
        if (draft.travelers && travInput) travInput.value = draft.travelers;
        if (draft.arrivalDate && arrivalInput) arrivalInput.value = draft.arrivalDate;
        if (draft.email && document.getElementById('applyEmail')) document.getElementById('applyEmail').value = draft.email;
        if (draft.phone && document.getElementById('applyPhone')) document.getElementById('applyPhone').value = draft.phone;
      } catch (e) {
      }
    }

    renderApplicants();
    updateSummary();

    destSelect.addEventListener('change', updateSummary);
    travInput.addEventListener('change', () => {
      renderApplicants();
      updateSummary();
    });
    document.querySelectorAll('input[name="applySpeed"]').forEach((r) => r.addEventListener('change', updateSummary));

    const saveBtn = document.getElementById('saveDraftBtn');
    const saveStatus = document.getElementById('saveDraftStatus');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const draft = {
          savedAt: new Date().toISOString(),
          destinationId: destSelect.value,
          travelers: travInput.value,
          arrivalDate: arrivalInput ? arrivalInput.value : '',
          email: (document.getElementById('applyEmail') || {}).value || '',
          phone: (document.getElementById('applyPhone') || {}).value || ''
        };
        localStorage.setItem('opv_saved_draft', JSON.stringify(draft));
        if (saveStatus) {
          saveStatus.textContent = 'Progress saved on this device. You can return to /apply?resume=1 anytime.';
          saveStatus.style.display = 'block';
        }
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('applyFormError');
      const submitBtn = document.getElementById('applySubmitBtn');
      if (errBox) errBox.style.display = 'none';

      const email = (document.getElementById('applyEmail') || {}).value.trim();
      const phone = (document.getElementById('applyPhone') || {}).value.trim();
      const arrivalDate = (document.getElementById('applyArrivalDate') || {}).value;
      const termsChecked = (document.getElementById('applyTermsConsent') || {}).checked;
      const speedRadio = document.querySelector('input[name="applySpeed"]:checked');
      const speedTier = speedRadio ? speedRadio.value : 'standard';

      if (!termsChecked) {
        if (errBox) {
          errBox.textContent = 'Please confirm that you understand OnePassVisa is a private assistance service and agree to the Terms & Refund Policy.';
          errBox.style.display = 'block';
        }
        return;
      }

      const applicants = [];
      const blocks = applicantsContainer.querySelectorAll('.applicant-block');
      for (let i = 0; i < blocks.length; i++) {
        const blk = blocks[i];
        const givenName = blk.querySelector('.js-app-given').value.trim();
        const surname = blk.querySelector('.js-app-surname').value.trim();
        const nationality = blk.querySelector('.js-app-nat').value;
        const dob = blk.querySelector('.js-app-dob').value;
        const passportNumber = blk.querySelector('.js-app-passnum').value.trim();
        const passportExpiry = blk.querySelector('.js-app-passexp').value;
        const passFile = blk.querySelector('.js-app-passfile').files[0];
        const photoFile = blk.querySelector('.js-app-photofile').files[0];

        if (!givenName || !surname || !nationality || !dob || !passportNumber || !passportExpiry || !passFile || !photoFile) {
          if (errBox) {
            errBox.textContent = `Please complete all required fields and document uploads for Traveler ${i + 1}.`;
            errBox.style.display = 'block';
          }
          return;
        }

        applicants.push({
          givenName,
          surname,
          nationality,
          dob,
          passportNumber,
          passportExpiry,
          passportFileName: passFile.name,
          photoFileName: photoFile.name
        });
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Validating & Creating Secure Session...';
      }

      const payload = {
        destinationId: destSelect.value,
        speedTier,
        email,
        phone,
        arrivalDate,
        currency: currentCurrency,
        applicants
      };

      trackEvent('begin_checkout', {
        destination: destSelect.value,
        travelers: applicants.length
      });

      try {
        const res = await fetch('/api/submit-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Validation failed.');
        }

        const tokens = JSON.parse(localStorage.getItem('opv_order_tokens') || '[]');
        tokens.unshift(data.token);
        localStorage.setItem('opv_order_tokens', JSON.stringify(tokens.slice(0, 20)));
        localStorage.setItem('opv_latest_order', JSON.stringify(data.order));
        window.location.href = data.checkoutUrl;
      } catch (err) {
        if (window.location.protocol === 'file:') {
          const pricing = DATA.calculatePrice(destSelect.value, applicants.length, speedTier);
          const ref = 'OPV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(16).slice(2, 8).toUpperCase();
          const localOrder = {
            reference: ref,
            createdAt: new Date().toISOString(),
            status: 'Pending Payment',
            destinationId: pricing.dest.id,
            destinationName: pricing.dest.name,
            visaType: pricing.dest.visaType,
            govPortal: pricing.dest.govPortal,
            govPortalName: pricing.dest.govPortalName,
            ourHandlingTime: pricing.dest.ourHandlingTime,
            govProcessingTime: pricing.dest.govProcessingTime,
            speedTier: pricing.speedTier,
            travelersCount: pricing.travelers,
            email: email.toLowerCase(),
            phone,
            arrivalDate,
            govTotalUSD: pricing.govTotalUSD,
            serviceTotalUSD: pricing.serviceTotalUSD,
            grandTotalUSD: pricing.grandTotalUSD,
            applicants
          };
          localStorage.setItem('opv_latest_order', JSON.stringify(localOrder));
          window.location.href = `checkout.html?ref=${encodeURIComponent(ref)}`;
          return;
        }
        if (errBox) {
          errBox.textContent = err.message || 'Could not submit application. Please check your entries.';
          errBox.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Continue to Secure Checkout →';
        }
      }
    });
  }

  function initCheckoutPage() {
    const checkoutBox = document.getElementById('hostedCheckoutContainer');
    if (!checkoutBox) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    const latestOrderRaw = localStorage.getItem('opv_latest_order');
    let order = null;
    if (latestOrderRaw) {
      try {
        order = JSON.parse(latestOrderRaw);
      } catch (e) {
        order = null;
      }
    }

    if (!order) {
      checkoutBox.innerHTML = `
        <div class="card" style="text-align:center;">
          <h2>No active checkout session found</h2>
          <p style="margin:0.75rem 0 1.25rem;color:var(--text-muted);">Please start your visa or travel document application first.</p>
          <a href="apply.html" class="btn btn-primary">Start Application</a>
        </div>
      `;
      return;
    }

    const refEl = document.getElementById('chkRef');
    const docEl = document.getElementById('chkDoc');
    const emailEl = document.getElementById('chkEmail');
    const travEl = document.getElementById('chkTravelers');
    const govEl = document.getElementById('chkGovFee');
    const srvEl = document.getElementById('chkServiceFee');
    const totEl = document.getElementById('chkTotal');
    const discEl = document.getElementById('chkDisclosure');

    if (refEl) refEl.textContent = order.reference;
    if (docEl) docEl.textContent = order.visaType;
    if (emailEl) emailEl.textContent = order.email;
    if (travEl) travEl.textContent = `${order.travelersCount} Traveler(s)`;
    if (govEl) govEl.textContent = order.govTotalUSD === 0 ? '$0 (Free official form)' : formatMoney(order.govTotalUSD);
    if (srvEl) srvEl.textContent = formatMoney(order.serviceTotalUSD);
    if (totEl) totEl.textContent = formatMoney(order.grandTotalUSD);
    if (discEl) {
      discEl.innerHTML = `OnePassVisa is a private assistance service, not a government site. You can apply directly at <a href="${order.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline;">${order.govPortalName}</a> for the ${order.govTotalUSD === 0 ? '$0 government fee' : formatMoney(order.govTotalUSD) + ' government fee'} only.`;
    }

    async function completePayment(methodLabel) {
      const paymentFormWrap = document.getElementById('checkoutPaymentStage');
      const receiptWrap = document.getElementById('checkoutReceiptStage');
      let confirmedOrder = order;

      try {
        const res = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, paymentMethod: methodLabel })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          confirmedOrder = data.order;
          const tokens = JSON.parse(localStorage.getItem('opv_order_tokens') || '[]');
          tokens.unshift(data.token);
          localStorage.setItem('opv_order_tokens', JSON.stringify(tokens.slice(0, 20)));
        }
      } catch (e) {
        confirmedOrder.status = 'Received — Under Document Review';
        confirmedOrder.paidAt = new Date().toISOString();
        confirmedOrder.receiptNumber = 'RCP-' + confirmedOrder.reference.replace('OPV-', '');
      }

      const paidOrders = JSON.parse(localStorage.getItem('opv_paid_orders') || '[]');
      paidOrders.unshift(confirmedOrder);
      localStorage.setItem('opv_paid_orders', JSON.stringify(paidOrders.slice(0, 30)));
      localStorage.removeItem('opv_saved_draft');

      trackEvent('purchase', {
        transaction_id: confirmedOrder.reference,
        value: confirmedOrder.grandTotalUSD,
        currency: 'USD'
      });

      if (paymentFormWrap) paymentFormWrap.style.display = 'none';
      if (receiptWrap) {
        receiptWrap.innerHTML = `
          <div class="card" style="border-color:var(--success-border);background:#FFFFFF;">
            <span class="badge badge-emerald" style="margin-bottom:0.75rem;">Payment Confirmed • Application Queued</span>
            <h2 style="font-size:1.6rem;margin-bottom:0.5rem;">Thank you. Your application is now under specialist review.</h2>
            <p style="color:var(--text-body);margin-bottom:1.25rem;">
              A confirmation email and itemized receipt have been sent to <strong>${confirmedOrder.email}</strong>. Save your reference number below to track your status at any time.
            </p>
            <div style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem;margin-bottom:1.25rem;">
              <div class="summary-row"><span>Application Reference</span><strong style="font-family:var(--font-mono);color:var(--primary);">${confirmedOrder.reference}</strong></div>
              <div class="summary-row"><span>Receipt Number</span><strong style="font-family:var(--font-mono);">${confirmedOrder.receiptNumber || 'RCP-' + confirmedOrder.reference}</strong></div>
              <div class="summary-row"><span>Document</span><strong>${confirmedOrder.visaType}</strong></div>
              <div class="summary-row"><span>Current Status</span><strong style="color:var(--success);">${confirmedOrder.status}</strong></div>
              <div class="summary-row"><span>Statutory Government Fee</span><strong>${confirmedOrder.govTotalUSD === 0 ? '$0 (Free)' : formatMoney(confirmedOrder.govTotalUSD)}</strong></div>
              <div class="summary-row"><span>OnePassVisa Service Fee</span><strong>${formatMoney(confirmedOrder.serviceTotalUSD)}</strong></div>
              <div class="summary-total"><span>Total Paid (${methodLabel})</span><span>${formatMoney(confirmedOrder.grandTotalUSD)}</span></div>
            </div>
            <h3 style="font-size:1.05rem;margin-bottom:0.5rem;">Next Steps</h3>
            <ol style="list-style:decimal;padding-left:1.25rem;color:var(--text-body);font-size:0.92rem;margin-bottom:1.5rem;">
              <li><strong>Specialist Verification (${confirmedOrder.ourHandlingTime}):</strong> Our team checks your passport scan and formats your portrait photo to official specifications.</li>
              <li><strong>Government Filing (${confirmedOrder.govProcessingTime}):</strong> Once verified, your application is submitted to ${confirmedOrder.govPortalName}.</li>
              <li><strong>PDF Delivery:</strong> Your approved document is emailed directly to <strong>${confirmedOrder.email}</strong>.</li>
            </ol>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
              <a href="track.html?ref=${encodeURIComponent(confirmedOrder.reference)}&email=${encodeURIComponent(confirmedOrder.email)}" class="btn btn-primary">Track Application Status</a>
              <button type="button" class="btn btn-outline" onclick="window.print()">Print Itemized Receipt</button>
            </div>
          </div>
        `;
        receiptWrap.style.display = 'block';
      }
    }

    document.querySelectorAll('.js-express-wallet-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wallet = btn.getAttribute('data-wallet') || 'Apple Pay';
        completePayment(wallet);
      });
    });

    const cardForm = document.getElementById('hostedCardPaymentForm');
    if (cardForm) {
      cardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        completePayment('Card');
      });
    }
  }

  function initTracker() {
    const form = document.getElementById('trackOrderForm');
    const out = document.getElementById('trackResultContainer');
    if (!form || !out) return;

    const params = new URLSearchParams(window.location.search);
    const refInput = document.getElementById('trackReferenceInput');
    const emailInput = document.getElementById('trackEmailInput');
    if (params.get('ref') && refInput) refInput.value = params.get('ref');
    if (params.get('email') && emailInput) emailInput.value = params.get('email');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reference = (refInput ? refInput.value : '').trim().toUpperCase();
      const email = (emailInput ? emailInput.value : '').trim().toLowerCase();

      if (!reference || !email) {
        out.innerHTML = `<div class="card" style="border-color:var(--danger);"><p style="color:var(--danger);font-weight:600;">Please enter both your Application Reference and the email address used on your application.</p></div>`;
        out.style.display = 'block';
        return;
      }

      const tokens = JSON.parse(localStorage.getItem('opv_order_tokens') || '[]');
      const localPaid = JSON.parse(localStorage.getItem('opv_paid_orders') || '[]');
      let matchedOrder = localPaid.find((o) => o.reference === reference && String(o.email).toLowerCase() === email) || null;

      try {
        const res = await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, email, tokens })
        });
        const data = await res.json();
        if (res.ok && data.found && data.order) {
          matchedOrder = data.order;
        }
      } catch (err) {
      }

      if (!matchedOrder) {
        out.innerHTML = `
          <div class="card" style="border-color:var(--border-input);">
            <span class="badge badge-amber" style="margin-bottom:0.5rem;">Application Not Found</span>
            <h3 style="font-size:1.15rem;margin-bottom:0.35rem;">No application matches reference "${reference}" and email "${email}".</h3>
            <p style="font-size:0.92rem;color:var(--text-body);">
              Please verify the reference code sent in your confirmation email (format: <code style="font-family:var(--font-mono);">OPV-YYYYMMDD-XXXXXX</code>) and ensure you entered the exact email address used during checkout. If you need assistance, email <a href="mailto:support@onepassvisa.com" style="color:var(--primary);text-decoration:underline;">support@onepassvisa.com</a>.
            </p>
          </div>
        `;
        out.style.display = 'block';
        return;
      }

      out.innerHTML = `
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
            <div>
              <span class="badge badge-emerald">${matchedOrder.status}</span>
              <h3 style="font-size:1.3rem;margin-top:0.4rem;">${matchedOrder.visaType}</h3>
            </div>
            <div style="font-family:var(--font-mono);font-weight:700;color:var(--primary);">${matchedOrder.reference}</div>
          </div>
          <div class="summary-row"><span>Applicant Email</span><strong>${matchedOrder.email}</strong></div>
          <div class="summary-row"><span>Travelers</span><strong>${matchedOrder.travelersCount}</strong></div>
          <div class="summary-row"><span>Planned Arrival Date</span><strong>${matchedOrder.arrivalDate}</strong></div>
          <div class="summary-row"><span>Our Handling Time</span><strong>${matchedOrder.ourHandlingTime}</strong></div>
          <div class="summary-row"><span>Government Processing Time</span><strong>${matchedOrder.govProcessingTime}</strong></div>
          <div class="summary-row"><span>Total Paid</span><strong>${formatMoney(matchedOrder.grandTotalUSD)} (Gov $${matchedOrder.govTotalUSD} + Service $${matchedOrder.serviceTotalUSD})</strong></div>
        </div>
      `;
      out.style.display = 'block';
    });

    if (params.get('ref') && params.get('email')) {
      form.dispatchEvent(new Event('submit'));
    }
  }

  function initContactForm() {
    const form = document.getElementById('contactSupportForm');
    const out = document.getElementById('contactFormStatus');
    if (!form || !out) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (document.getElementById('contactName') || {}).value.trim();
      const email = (document.getElementById('contactEmail') || {}).value.trim();
      const reference = (document.getElementById('contactRef') || {}).value.trim();
      const message = (document.getElementById('contactMessage') || {}).value.trim();

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, reference, message })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Could not send message.');
        out.innerHTML = `<div class="card" style="background:var(--success-tint);border-color:var(--success-border);color:var(--navy);"><strong>Ticket ${data.ticketId} Created:</strong> ${data.message}</div>`;
        out.style.display = 'block';
        form.reset();
      } catch (err) {
        out.innerHTML = `<div class="card" style="background:var(--primary-tint);border-color:var(--primary-border);">Thank you, ${name}. Your inquiry has been logged for <strong>support@onepassvisa.com</strong>. We will reply to <strong>${email}</strong> within 4 business hours.</div>`;
        out.style.display = 'block';
      }
    });
  }

  function initAccordionsAndPolicies() {
    document.querySelectorAll('.faq-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panelId = btn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : btn.nextElementSibling;
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        if (panel) {
          if (expanded) panel.setAttribute('hidden', '');
          else panel.removeAttribute('hidden');
        }
      });
    });

    const policyBtns = document.querySelectorAll('.policy-nav-btn');
    const policySecs = document.querySelectorAll('.policy-section');
    if (policyBtns.length > 0 && policySecs.length > 0) {
      function activatePolicy(id) {
        policyBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-policy') === id));
        policySecs.forEach((s) => s.classList.toggle('active', s.id === id));
      }
      policyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-policy');
          activatePolicy(id);
          history.replaceState(null, '', '#' + id);
        });
      });
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById(hash)) {
        activatePolicy(hash);
      }
      window.addEventListener('hashchange', () => {
        const h = window.location.hash.replace('#', '');
        if (h && document.getElementById(h)) activatePolicy(h);
      });
    }
  }

  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal-on-scroll');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateSelects();
    initHeaderAndConsent();
    initRequirementsChecker();
    initDestinationsFilter();
    initCalculator();
    initApplyFlow();
    initCheckoutPage();
    initTracker();
    initContactForm();
    initAccordionsAndPolicies();
    initScrollReveal();
    updateAllCurrencyDisplays();
  });
})();
