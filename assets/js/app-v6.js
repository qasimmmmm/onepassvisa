(function () {
  'use strict';

  const DATA = window.ONEPASS_DATA;
  if (!DATA) return;

  let currentCurrency = localStorage.getItem('opv_currency') || 'USD';
  if (!DATA.currencies[currentCurrency]) {
    currentCurrency = 'USD';
  }

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
    } catch (e) {}
  }
  window.opvTrackEvent = trackEvent;

  function formatMoney(amountUSD) {
    return DATA.formatMoney(amountUSD, currentCurrency);
  }
  window.opvFormatMoney = formatMoney;

  function getSavedNationality() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = (params.get('nationality') || '').toUpperCase();
    if (fromUrl && DATA.nationalities.some((n) => n.code === fromUrl)) {
      localStorage.setItem('opv_selected_nationality', fromUrl);
      return fromUrl;
    }
    const fromStorage = (localStorage.getItem('opv_selected_nationality') || '').toUpperCase();
    if (fromStorage && DATA.nationalities.some((n) => n.code === fromStorage)) {
      return fromStorage;
    }
    return '';
  }

  function saveNationality(code) {
    if (code && DATA.nationalities.some((n) => n.code === code)) {
      localStorage.setItem('opv_selected_nationality', code);
    }
  }

  function updateAllCurrencyDisplays() {
    document.querySelectorAll('[data-usd]').forEach((el) => {
      const usdVal = parseFloat(el.getAttribute('data-usd'));
      if (!isNaN(usdVal)) {
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        if (usdVal === 0 && el.hasAttribute('data-free-label')) {
          el.textContent = prefix + formatMoney(0) + ' (Free)' + suffix;
        } else {
          el.textContent = prefix + formatMoney(usdVal) + suffix;
        }
      }
    });

    document.querySelectorAll('.js-currency-select').forEach((sel) => {
      sel.value = currentCurrency;
    });

    const currObj = DATA.currencies[currentCurrency] || DATA.currencies.USD;
    const trigLabel = document.getElementById('currencyTriggerLabel');
    if (trigLabel) {
      trigLabel.textContent = `${currObj.code}`;
    }
    document.querySelectorAll('.js-currency-option').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-currency') === currentCurrency);
    });

    document.querySelectorAll('.js-currency-notice').forEach((noticeEl) => {
      if (currentCurrency === 'USD') {
        noticeEl.textContent = 'All prices are shown and charged in USD (US$).';
        noticeEl.classList.remove('visible');
      } else {
        noticeEl.textContent = `Prices are displayed in ${currObj.code} as an approximate estimate; checkout is charged in USD (US$).`;
        noticeEl.classList.add('visible');
      }
    });

    if (typeof window.opvRefreshDestinations === 'function') window.opvRefreshDestinations();
    if (typeof window.opvRefreshCalculator === 'function') window.opvRefreshCalculator();
    if (typeof window.opvRefreshApplySummary === 'function') window.opvRefreshApplySummary();
    if (typeof window.opvRefreshComboboxPrices === 'function') window.opvRefreshComboboxPrices();
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

    const currWrap = document.getElementById('currencyDropdownWrap');
    const currBtn = document.getElementById('currencyTriggerBtn');
    const currMenu = document.getElementById('currencyMenu');
    if (currWrap && currBtn && currMenu) {
      currBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = currMenu.classList.toggle('open');
        currBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      currMenu.querySelectorAll('.js-currency-option').forEach((opt) => {
        opt.addEventListener('click', () => {
          currentCurrency = opt.getAttribute('data-currency') || 'USD';
          localStorage.setItem('opv_currency', currentCurrency);
          currMenu.classList.remove('open');
          currBtn.setAttribute('aria-expanded', 'false');
          updateAllCurrencyDisplays();
        });
      });
      document.addEventListener('click', (e) => {
        if (!currWrap.contains(e.target)) {
          currMenu.classList.remove('open');
          currBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

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
    const savedNat = getSavedNationality();

    document.querySelectorAll('.js-nationality-select').forEach((select) => {
      const def = savedNat || select.getAttribute('data-default') || '';
      const placeholder = select.getAttribute('data-placeholder') || 'Select passport country';
      const opts = [`<option value="" ${!def ? 'selected' : ''}>${placeholder}</option>`];
      DATA.nationalities.forEach((n) => {
        opts.push(`<option value="${n.code}" ${n.code === def ? 'selected' : ''}>${n.flag} ${n.name}</option>`);
      });
      select.innerHTML = opts.join('');
    });

    document.querySelectorAll('.js-destination-select').forEach((select) => {
      const def = select.getAttribute('data-default') || 'vietnam';
      select.innerHTML = DATA.destinations
        .map((d) => `<option value="${d.id}" ${d.id === def ? 'selected' : ''}>${d.flag} ${d.name} — ${d.shortDocName || d.categoryBadge}</option>`)
        .join('');
    });
  }

  function initSearchableComboboxes() {
    const natWrap = document.getElementById('comboNationalityWrap');
    const destWrap = document.getElementById('comboDestinationWrap');
    const natSelect = document.getElementById('checkerNationality');
    const destSelect = document.getElementById('checkerDestination');
    if (!natWrap || !destWrap || !natSelect || !destSelect) return;

    const natTrigger = document.getElementById('comboNationalityTrigger');
    const natLabel = document.getElementById('comboNationalityLabel');
    const natSearch = document.getElementById('comboNationalitySearch');
    const natList = document.getElementById('comboNationalityList');

    const destTrigger = document.getElementById('comboDestinationTrigger');
    const destLabel = document.getElementById('comboDestinationLabel');
    const destSearch = document.getElementById('comboDestinationSearch');
    const destList = document.getElementById('comboDestinationList');

    function setNationality(code) {
      const n = DATA.nationalities.find((x) => x.code === code) || null;
      if (!n) {
        natSelect.value = '';
        if (natLabel) {
          natLabel.innerHTML = `<span style="color:var(--text-muted);font-weight:600;">Select passport country</span><span style="color:var(--text-muted);font-size:0.75rem;">▾</span>`;
        }
      } else {
        natSelect.value = n.code;
        saveNationality(n.code);
        const flag = n.flag || '';
        if (natLabel) {
          natLabel.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.45rem;overflow:hidden;text-overflow:ellipsis;"><span class="combo-flag">${flag}</span><span>${n.name}</span></span><span style="color:var(--text-muted);font-size:0.75rem;">▾</span>`;
        }
        document.querySelectorAll('.js-carry-nationality').forEach((link) => {
          try {
            const url = new URL(link.getAttribute('href'), window.location.origin);
            url.searchParams.set('nationality', n.code);
            link.setAttribute('href', url.pathname.replace(/^\//, '') + url.search);
          } catch (e) {}
        });
      }
      natWrap.classList.remove('open');
      if (natTrigger) natTrigger.setAttribute('aria-expanded', 'false');
    }

    function setDestination(id) {
      const d = DATA.destinations.find((x) => x.id === id) || DATA.destinations[0];
      destSelect.value = d.id;
      const flag = d.flag || '';
      if (destLabel) {
        destLabel.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.45rem;overflow:hidden;text-overflow:ellipsis;"><span class="combo-flag">${flag}</span><span>${d.name} (${d.shortDocName || d.categoryBadge})</span></span><span style="color:var(--text-muted);font-size:0.75rem;">▾</span>`;
      }
      destWrap.classList.remove('open');
      if (destTrigger) destTrigger.setAttribute('aria-expanded', 'false');
    }

    function renderNatItems(q = '') {
      const query = q.trim().toLowerCase();
      const filtered = DATA.nationalities.filter(
        (n) => !query || n.name.toLowerCase().includes(query) || n.code.toLowerCase().includes(query)
      );
      if (!filtered.length) {
        natList.innerHTML = `<div style="padding:0.65rem;font-size:0.82rem;color:var(--text-muted);">No matching passport country</div>`;
        return;
      }
      natList.innerHTML = filtered
        .map(
          (n) => `
          <button type="button" class="combo-item ${n.code === natSelect.value ? 'selected' : ''}" data-code="${n.code}">
            <span style="display:inline-flex;align-items:center;gap:0.5rem;"><span>${n.flag}</span><span>${n.name}</span></span>
            <span style="font-size:0.72rem;color:var(--text-muted);">${n.code}</span>
          </button>
        `
        )
        .join('');
      natList.querySelectorAll('.combo-item').forEach((btn) => {
        btn.addEventListener('click', () => setNationality(btn.getAttribute('data-code')));
      });
    }

    function renderDestItems(q = '') {
      const query = q.trim().toLowerCase();
      const filtered = DATA.destinations.filter(
        (d) =>
          !query ||
          d.name.toLowerCase().includes(query) ||
          d.shortName.toLowerCase().includes(query) ||
          (d.shortDocName || '').toLowerCase().includes(query) ||
          d.categoryBadge.toLowerCase().includes(query)
      );
      if (!filtered.length) {
        destList.innerHTML = `<div style="padding:0.65rem;font-size:0.82rem;color:var(--text-muted);">No matching destination</div>`;
        return;
      }
      destList.innerHTML = filtered
        .map((d) => {
          const p = DATA.calculatePrice(d.id, 1, 'standard');
          return `
            <button type="button" class="combo-item ${d.id === destSelect.value ? 'selected' : ''}" data-id="${d.id}">
              <span style="display:inline-flex;align-items:center;gap:0.5rem;"><span>${d.flag}</span><span>${d.name} — ${d.shortDocName || d.categoryBadge}</span></span>
              <span class="badge badge-emerald" style="font-size:0.68rem;padding:0.15rem 0.45rem;">${formatMoney(p.totalPerPersonUSD)}</span>
            </button>
          `;
        })
        .join('');
      destList.querySelectorAll('.combo-item').forEach((btn) => {
        btn.addEventListener('click', () => setDestination(btn.getAttribute('data-id')));
      });
    }

    window.opvRefreshComboboxPrices = () => {
      renderDestItems(destSearch ? destSearch.value : '');
    };

    natTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      destWrap.classList.remove('open');
      const isOpen = natWrap.classList.toggle('open');
      natTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        renderNatItems('');
        if (natSearch) {
          natSearch.value = '';
          setTimeout(() => natSearch.focus(), 20);
        }
      }
    });

    destTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      natWrap.classList.remove('open');
      const isOpen = destWrap.classList.toggle('open');
      destTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        renderDestItems('');
        if (destSearch) {
          destSearch.value = '';
          setTimeout(() => destSearch.focus(), 20);
        }
      }
    });

    if (natSearch) {
      natSearch.addEventListener('input', (e) => renderNatItems(e.target.value));
      natSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') natWrap.classList.remove('open');
        if (e.key === 'Enter') {
          e.preventDefault();
          const first = natList.querySelector('.combo-item');
          if (first) setNationality(first.getAttribute('data-code'));
        }
      });
    }

    if (destSearch) {
      destSearch.addEventListener('input', (e) => renderDestItems(e.target.value));
      destSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') destWrap.classList.remove('open');
        if (e.key === 'Enter') {
          e.preventDefault();
          const first = destList.querySelector('.combo-item');
          if (first) setDestination(first.getAttribute('data-id'));
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!natWrap.contains(e.target)) {
        natWrap.classList.remove('open');
        natTrigger.setAttribute('aria-expanded', 'false');
      }
      if (!destWrap.contains(e.target)) {
        destWrap.classList.remove('open');
        destTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    const initialNat = getSavedNationality() || natSelect.getAttribute('data-default') || '';
    setNationality(initialNat);
    setDestination(destSelect.getAttribute('data-default') || 'vietnam');
  }

  function initRequirementsChecker() {
    const form = document.getElementById('heroCheckerForm');
    const drawer = document.getElementById('checkerResultDrawer');
    if (!form || !drawer) return;

    const natEl = document.getElementById('checkerNationality');
    const destEl = document.getElementById('checkerDestination');

    // Sync nationality selection to localStorage and page CTA links
    if (natEl) {
      const savedNat = getSavedNationality();
      if (savedNat) {
        natEl.value = savedNat;
        document.querySelectorAll('.js-carry-nationality').forEach((link) => {
          try {
            const url = new URL(link.getAttribute('href'), window.location.origin);
            url.searchParams.set('nationality', savedNat);
            link.setAttribute('href', url.pathname.replace(/^\//, '') + url.search);
          } catch (e) {}
        });
      }
      natEl.addEventListener('change', () => {
        if (natEl.value) {
          saveNationality(natEl.value);
          document.querySelectorAll('.js-carry-nationality').forEach((link) => {
            try {
              const url = new URL(link.getAttribute('href'), window.location.origin);
              url.searchParams.set('nationality', natEl.value);
              link.setAttribute('href', url.pathname.replace(/^\//, '') + url.search);
            } catch (e) {}
          });
        }
      });
    }

    function runEvaluation(animate) {
      const natCode = natEl ? natEl.value : '';
      const destId = destEl ? destEl.value : 'vietnam';

      if (!natCode) {
        if (natEl) {
          natEl.setAttribute('aria-invalid', 'true');
          const comboTrig = document.getElementById('comboNationalityTrigger');
          if (comboTrig) comboTrig.click();
          else natEl.focus();
        }
        if (drawer) {
          drawer.innerHTML = `
            <div style="padding:0.75rem 0.5rem;text-align:center;">
              <span class="badge badge-emerald" style="margin-bottom:0.5rem;">Passport Selection Required</span>
              <h3 style="font-size:1.1rem;color:var(--navy);margin-bottom:0.35rem;">Please select your passport country</h3>
              <p style="font-size:0.88rem;color:var(--text-muted);margin:0;">Visa, ETA, and arrival card rules depend on the passport you travel with. Select your nationality from the dropdown above to view eligibility and pricing.</p>
            </div>
          `;
          drawer.classList.add('active');
        }
        return;
      }
      if (natEl) natEl.removeAttribute('aria-invalid');
      saveNationality(natCode);

      const capsule = form.closest('.checker-capsule') || form;
      if (animate) capsule.classList.add('checker-loading-pulse');

      const delay = animate ? 150 : 0;
      setTimeout(() => {
        capsule.classList.remove('checker-loading-pulse');
        const res = DATA.evaluateRequirement(natCode, destId);
        const d = res.dest;
        const pricing = DATA.calculatePrice(d.id, 1, 'standard');
        const govLabel = pricing.govPerPersonUSD === 0 ? `${formatMoney(0)} (Free official form)` : formatMoney(pricing.govPerPersonUSD);

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
                <div class="tabular-nums" style="font-size:0.9rem;color:var(--text-body);">
                  Government ${govLabel} + service ${formatMoney(pricing.servicePerPersonUSD)} = <strong style="color:var(--navy);font-size:1.05rem;">${formatMoney(pricing.totalPerPersonUSD)} / traveler</strong>
                </div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;">
                  Our review time: ${d.standardReviewTime} • Expected processing: ${d.govProcessingTime}
                </div>
              </div>
              <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
                <a href="${d.slug}.html?nationality=${encodeURIComponent(natCode)}" class="btn btn-outline btn-sm">View requirements</a>
                <a href="apply.html?country=${encodeURIComponent(d.id)}&nationality=${encodeURIComponent(natCode)}" class="btn btn-primary btn-sm">
                  <span>Start application</span>
                  <span class="arrow-icon">→</span>
                </a>
              </div>
            </div>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem;">
              OnePassVisa is a private assistance service not affiliated with any government; you can apply directly at <a href="${d.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--emerald);font-weight:600;text-decoration:underline;">${d.govPortalName}</a> for the ${pricing.govPerPersonUSD === 0 ? formatMoney(0) + ' government fee' : formatMoney(pricing.govPerPersonUSD) + ' government fee'} only.
            </p>
          `;
        } else {
          actionHtml = `
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
              <div style="font-size:0.88rem;color:var(--text-body);">
                ${res.status === 'embassy'
                  ? `Online processing is not available for this passport. Please apply directly through the official government portal:`
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
            <span class="badge ${res.badgeClass}" style="margin-bottom:0.5rem;">✓ ${res.badgeText}</span>
            <h3 style="font-size:1.15rem;color:var(--navy);margin-bottom:0.35rem;">${res.headline}</h3>
            <p style="font-size:0.92rem;color:var(--text-body);">${res.explanation}</p>
            ${actionHtml}
          </div>
        `;
        drawer.classList.add('active');
      }, delay);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      runEvaluation(true);
    });

    // If on a destination page and nationality was carried over, auto-run the evaluation
    const params = new URLSearchParams(window.location.search);
    if (params.get('nationality') && natEl && natEl.value) {
      runEvaluation(false);
    }
  }

  function initDestinationsFilter() {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;

    const limit = parseInt(grid.getAttribute('data-limit') || '0', 10);
    let activeRegion = 'all';
    let searchQuery = '';

    function renderCard(d) {
      const pricing = DATA.calculatePrice(d.id, 1, 'standard');
      const savedNat = getSavedNationality();
      const detailHref = savedNat ? `${d.slug}.html?nationality=${encodeURIComponent(savedNat)}` : `${d.slug}.html`;
      const govText = pricing.govPerPersonUSD === 0 ? `Government ${formatMoney(0)} (Free)` : `Government ${formatMoney(pricing.govPerPersonUSD)}`;
      const breakdownText = `${govText} + service ${formatMoney(pricing.servicePerPersonUSD)}`;

      return `
        <article class="dest-card">
          <a href="${detailHref}" class="dest-card-media" aria-label="${d.name} — ${d.shortDocName || d.visaType}">
            <img
              src="${d.image}"
              srcset="${d.imageSmall} 480w, ${d.image} 800w"
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
              width="640"
              height="400"
              loading="lazy"
              decoding="async"
              alt="${d.name}"
              class="dest-card-img"
            />
            <span class="dest-flag-badge" aria-hidden="true">${d.flag}</span>
          </a>
          <div class="dest-card-body">
            <div>
              <h3 class="dest-card-title"><a href="${detailHref}">${d.name}</a></h3>
              <div class="dest-card-doc">${d.shortDocName || d.visaType}</div>
            </div>
            <div class="dest-card-footer">
              <div>
                <div class="dest-total-price tabular-nums">${formatMoney(pricing.totalPerPersonUSD)} <span style="font-size:0.8rem;font-weight:500;color:var(--text-muted);">/ traveler</span></div>
                <div class="dest-fee-summary tabular-nums">${breakdownText}</div>
              </div>
              <a href="${detailHref}" class="dest-card-cta">
                <span>View requirements</span>
              </a>
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
          (d.shortDocName || '').toLowerCase().includes(searchQuery) ||
          d.visaType.toLowerCase().includes(searchQuery);
        return matchReg && matchQ;
      });
      if (limit > 0 && activeRegion === 'all' && !searchQuery) {
        list = list.slice(0, limit);
      }
      if (list.length === 0) {
        grid.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;"><p>No destinations match your search. Try selecting "All".</p></div>`;
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

      document.querySelectorAll('.speed-option').forEach((opt) => {
        const r = opt.querySelector('input[type="radio"]');
        opt.classList.toggle('selected', Boolean(r && r.checked));
      });

      const p = DATA.calculatePrice(destId, count, speedTier);
      const govEl = document.getElementById('calcGovFee');
      const srvEl = document.getElementById('calcServiceFee');
      const handlingEl = document.getElementById('calcHandlingOut');
      const govTimeEl = document.getElementById('calcGovTimeOut');
      const totEl = document.getElementById('calcTotalOut');
      const linkEl = document.getElementById('calcApplyLink');
      const govLinkEl = document.getElementById('calcDirectGovLink');
      const standardPriceEl = document.getElementById('calcStandardAddonPrice');
      const priorityPriceEl = document.getElementById('calcPriorityAddonPrice');
      const standardTimeDescEl = document.getElementById('calcStandardTimeDesc');
      const priorityTimeDescEl = document.getElementById('calcPriorityTimeDesc');

      if (standardPriceEl) standardPriceEl.textContent = `+${formatMoney(0)}`;
      if (priorityPriceEl) priorityPriceEl.textContent = `+${formatMoney(p.dest.priorityFeeUSD)}`;
      if (standardTimeDescEl) standardTimeDescEl.textContent = p.dest.standardReviewTime;
      if (priorityTimeDescEl) priorityTimeDescEl.textContent = p.dest.priorityReviewTime;

      if (govEl) {
        govEl.textContent =
          p.govPerPersonUSD === 0
            ? `${formatMoney(0)} (Free official form) × ${p.travelers}`
            : `${formatMoney(p.govPerPersonUSD)} × ${p.travelers} = ${formatMoney(p.govTotalUSD)}`;
      }
      if (srvEl) {
        srvEl.textContent = `${formatMoney(p.totalServicePerPersonUSD)} × ${p.travelers} = ${formatMoney(p.serviceTotalUSD)}`;
      }
      if (handlingEl) {
        handlingEl.textContent = speedTier === 'priority' ? p.dest.priorityReviewTime : p.dest.standardReviewTime;
      }
      if (govTimeEl) {
        govTimeEl.textContent = p.dest.govProcessingTime;
      }
      if (totEl) {
        totEl.textContent = formatMoney(p.grandTotalUSD);
      }
      if (linkEl) {
        const savedNat = getSavedNationality();
        const natParam = savedNat ? `&nationality=${encodeURIComponent(savedNat)}` : '';
        linkEl.href = `apply.html?country=${encodeURIComponent(p.dest.id)}&travelers=${p.travelers}&speed=${speedTier}${natParam}`;
      }
      if (govLinkEl) {
        govLinkEl.innerHTML = `OnePassVisa is a private service not affiliated with any government; you can apply directly at <a href="${p.dest.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--emerald);font-weight:600;text-decoration:underline;">${p.dest.govPortalName}</a> for the ${p.govPerPersonUSD === 0 ? formatMoney(0) + ' government fee' : formatMoney(p.govPerPersonUSD) + ' government fee'} only. (Verified ${p.dest.verifiedDate})`;
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
    const flightInput = document.getElementById('applyFlightNumber');
    const portInput = document.getElementById('applyPortOfEntry');
    const hotelInput = document.getElementById('applyAccommodation');
    const arrivalCardTripFields = document.getElementById('arrivalCardTripFields');
    const applicantsContainer = document.getElementById('applicantsContainer');
    const documentsContainer = document.getElementById('documentsStageContainer');
    const stage4ReviewSummary = document.getElementById('stage4ReviewSummary');

    let currentStage = 1;
    const uploadedFilesMap = {};

    if (arrivalInput && !arrivalInput.value) {
      const minDate = new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10);
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

    const defaultNat = getSavedNationality() || '';

    function getSelectedDest() {
      const destId = destSelect ? destSelect.value : 'vietnam';
      return DATA.destinations.find((d) => d.id === destId) || DATA.destinations[0];
    }

    function updateDocumentSpecificVisibility() {
      const dest = getSelectedDest();
      if (arrivalCardTripFields) {
        arrivalCardTripFields.style.display = dest.requiresFlightAndHotel ? 'block' : 'none';
      }
      if (flightInput) flightInput.required = Boolean(dest.requiresFlightAndHotel);
      if (hotelInput) hotelInput.required = Boolean(dest.requiresFlightAndHotel);
    }

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
          passportExpiry: (blk.querySelector('.js-app-passexp') || {}).value || '',
          collapsed: blk.getAttribute('data-collapsed') === 'true'
        };
      });

      const natOptions = ['<option value="">Select passport country</option>']
        .concat(DATA.nationalities.map((n) => `<option value="${n.code}">${n.flag} ${n.name}</option>`))
        .join('');

      const blocks = [];
      for (let i = 0; i < count; i++) {
        const prev = existingData[i] || {
          givenName: '',
          surname: '',
          dob: '',
          nationality: defaultNat,
          passportNumber: '',
          passportExpiry: '',
          collapsed: false
        };
        const isComplete = prev.givenName && prev.surname && prev.nationality && prev.dob && prev.passportNumber && prev.passportExpiry;
        const showCollapsed = prev.collapsed && isComplete;

        blocks.push(`
          <div class="applicant-block" data-applicant-index="${i + 1}" data-collapsed="${showCollapsed ? 'true' : 'false'}">
            <div class="js-traveler-summary-bar" style="display:${showCollapsed ? 'flex' : 'none'};align-items:center;justify-content:space-between;gap:0.75rem;">
              <div>
                <strong style="color:var(--navy);">Traveler ${i + 1}: ${prev.givenName} ${prev.surname}</strong>
                <div style="font-size:0.82rem;color:var(--text-muted);">Passport ${prev.passportNumber} • Nationality: ${prev.nationality}</div>
              </div>
              <button type="button" class="btn btn-outline btn-sm js-expand-traveler">Edit</button>
            </div>
            <div class="js-traveler-fields-wrap" style="display:${showCollapsed ? 'none' : 'block'};">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.85rem;">
                <h3 style="font-size:1.05rem;color:var(--navy);">Traveler ${i + 1} (as shown on passport)</h3>
                <span class="badge badge-emerald">Traveler ${i + 1} of ${count}</span>
              </div>
              <div class="form-grid-2">
                <div class="field-group">
                  <label class="field-label" for="appGiven_${i}">Given name(s) *</label>
                  <input type="text" id="appGiven_${i}" class="field-control js-app-given" value="${prev.givenName}" autocomplete="given-name" required />
                </div>
                <div class="field-group">
                  <label class="field-label" for="appSurname_${i}">Surname / family name *</label>
                  <input type="text" id="appSurname_${i}" class="field-control js-app-surname" value="${prev.surname}" autocomplete="family-name" required />
                </div>
                <div class="field-group">
                  <label class="field-label" for="appNat_${i}">Passport country *</label>
                  <select id="appNat_${i}" class="field-control js-app-nat" data-selected="${prev.nationality}" required>
                    ${natOptions}
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label" for="appDob_${i}">Date of birth *</label>
                  <input type="date" id="appDob_${i}" class="field-control js-app-dob" value="${prev.dob}" autocomplete="bday" required />
                </div>
                <div class="field-group">
                  <label class="field-label" for="appPassNum_${i}">Passport number *</label>
                  <input type="text" id="appPassNum_${i}" class="field-control js-app-passnum" value="${prev.passportNumber}" autocapitalize="characters" spellcheck="false" required />
                </div>
                <div class="field-group">
                  <label class="field-label" for="appPassExp_${i}">Passport expiry date *</label>
                  <input type="date" id="appPassExp_${i}" class="field-control js-app-passexp" value="${prev.passportExpiry}" required />
                </div>
              </div>
              ${count > 1 ? `
                <div style="margin-top:0.85rem;text-align:right;">
                  <button type="button" class="btn btn-outline btn-sm js-collapse-traveler">Save traveler ${i + 1}</button>
                </div>
              ` : ''}
            </div>
          </div>
        `);
      }

      applicantsContainer.innerHTML = blocks.join('');
      applicantsContainer.querySelectorAll('.js-app-nat').forEach((sel) => {
        const val = sel.getAttribute('data-selected');
        if (val) sel.value = val;
        sel.addEventListener('change', () => {
          if (sel.value) saveNationality(sel.value);
        });
      });

      applicantsContainer.querySelectorAll('.js-collapse-traveler').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = btn.closest('.applicant-block');
          if (!blk) return;
          const g = blk.querySelector('.js-app-given').value.trim();
          const s = blk.querySelector('.js-app-surname').value.trim();
          const n = blk.querySelector('.js-app-nat').value;
          const d = blk.querySelector('.js-app-dob').value;
          const p = blk.querySelector('.js-app-passnum').value.trim();
          const e = blk.querySelector('.js-app-passexp').value;
          if (g && s && n && d && p && e) {
            blk.setAttribute('data-collapsed', 'true');
            renderApplicants();
          }
        });
      });

      applicantsContainer.querySelectorAll('.js-expand-traveler').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = btn.closest('.applicant-block');
          if (!blk) return;
          blk.setAttribute('data-collapsed', 'false');
          renderApplicants();
        });
      });
    }

    function renderDocumentsStage() {
      if (!documentsContainer) return;
      const dest = getSelectedDest();
      const count = Math.max(1, Math.min(20, parseInt(travInput.value || '1', 10)));

      if (!dest.requiresUploads) {
        documentsContainer.innerHTML = `
          <div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-border);">
            <span class="badge badge-emerald" style="margin-bottom:0.5rem;">✓ No File Uploads Needed</span>
            <h3 style="font-size:1.15rem;margin-bottom:0.4rem;">${dest.cleanTitle || dest.visaType} does not require passport scan or photo uploads</h3>
            <p style="font-size:0.92rem;color:var(--text-body);">
              This ${(dest.categoryBadge || 'document').toLowerCase()} is filed electronically using the passport numbers and trip details you entered in Steps 1 and 2. Our specialists will review your entry dates, passport validity, and ${dest.requiresFlightAndHotel ? 'flight and accommodation details' : 'eligibility answers'} before submission.
            </p>
          </div>
        `;
        return;
      }

      const blocks = [];
      for (let i = 0; i < count; i++) {
        const passKey = `pass_${i}`;
        const photoKey = `photo_${i}`;
        const savedPass = uploadedFilesMap[passKey] || null;
        const savedPhoto = uploadedFilesMap[photoKey] || null;

        blocks.push(`
          <div class="applicant-block" data-doc-traveler="${i + 1}">
            <h3 style="font-size:1.05rem;color:var(--navy);margin-bottom:0.35rem;">Traveler ${i + 1} Documents</h3>
            <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:1rem;">
              Accepted formats: JPG, PNG, WEBP, or PDF (up to 10 MB per file). Our specialists check and format your photo and passport scan to meet official requirements.
            </p>
            <div class="form-grid-2">
              <div class="field-group">
                <label class="field-label" for="appPassFile_${i}">Passport bio-page scan *</label>
                <div class="accessible-upload-box">
                  <input type="file" id="appPassFile_${i}" class="js-app-passfile" data-key="${passKey}" accept=".jpg,.jpeg,.png,.webp,.pdf" style="width:100%;font-size:0.88rem;" ${savedPass ? '' : 'required'} />
                  <div class="field-hint" style="margin-top:0.35rem;">Clear image of the full passport information page, including the bottom machine-readable zone.</div>
                  <div class="upload-file-meta ${savedPass ? 'visible' : ''}" id="meta_${passKey}">
                    <span>${savedPass ? `✓ ${savedPass.name} (${savedPass.sizeLabel})` : ''}</span>
                    <label for="appPassFile_${i}" style="color:var(--emerald);font-weight:700;cursor:pointer;text-decoration:underline;">Replace file</label>
                  </div>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label" for="appPhotoFile_${i}">Traveler portrait photo *</label>
                <div class="accessible-upload-box">
                  <input type="file" id="appPhotoFile_${i}" class="js-app-photofile" data-key="${photoKey}" accept=".jpg,.jpeg,.png,.webp" style="width:100%;font-size:0.88rem;" ${savedPhoto ? '' : 'required'} />
                  <div class="field-hint" style="margin-top:0.35rem;">Front-facing photo against a plain light background (a clear phone photo works well).</div>
                  <div class="upload-file-meta ${savedPhoto ? 'visible' : ''}" id="meta_${photoKey}">
                    <span>${savedPhoto ? `✓ ${savedPhoto.name} (${savedPhoto.sizeLabel})` : ''}</span>
                    <label for="appPhotoFile_${i}" style="color:var(--emerald);font-weight:700;cursor:pointer;text-decoration:underline;">Replace file</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      }

      documentsContainer.innerHTML = blocks.join('');

      documentsContainer.querySelectorAll('input[type="file"]').forEach((inp) => {
        inp.addEventListener('change', () => {
          const f = inp.files && inp.files[0];
          const key = inp.getAttribute('data-key');
          const metaEl = document.getElementById(`meta_${key}`);
          if (f && key) {
            const kb = Math.max(1, Math.round(f.size / 1024));
            const sizeLabel = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
            uploadedFilesMap[key] = { name: f.name, sizeLabel };
            if (metaEl) {
              metaEl.querySelector('span').textContent = `✓ ${f.name} (${sizeLabel})`;
              metaEl.classList.add('visible');
            }
          }
        });
      });
    }

    function renderStage4Review() {
      if (!stage4ReviewSummary) return;
      const dest = getSelectedDest();
      const email = (document.getElementById('applyEmail') || {}).value || 'Not entered';
      const arrival = (arrivalInput || {}).value || 'Not selected';
      const blocks = applicantsContainer.querySelectorAll('.applicant-block');
      const travelerLines = [];
      blocks.forEach((blk, idx) => {
        const g = (blk.querySelector('.js-app-given') || {}).value || '';
        const s = (blk.querySelector('.js-app-surname') || {}).value || '';
        const n = (blk.querySelector('.js-app-nat') || {}).value || '';
        const p = (blk.querySelector('.js-app-passnum') || {}).value || '';
        travelerLines.push(`<div style="font-size:0.88rem;color:var(--text-body);">• <strong>Traveler ${idx + 1}:</strong> ${g || '—'} ${s || ''} (${n || '—'}, Passport ${p || '—'})</div>`);
      });

      let extraTripHtml = '';
      if (dest.requiresFlightAndHotel) {
        const fl = (flightInput || {}).value || '—';
        const ht = (hotelInput || {}).value || '—';
        extraTripHtml = `<div style="font-size:0.86rem;color:var(--text-muted);margin-top:0.25rem;">Flight/Vessel: <strong>${fl}</strong> • Accommodation: <strong>${ht}</strong></div>`;
      }

      stage4ReviewSummary.innerHTML = `
        <div style="background:var(--bg-page);border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem;margin-bottom:1.25rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
            <strong style="color:var(--navy);">${dest.flag} ${dest.cleanTitle || dest.visaType}</strong>
            <button type="button" class="btn btn-outline btn-sm" data-goto-stage="1" style="min-height:32px;padding:0 0.65rem;font-size:0.78rem;">Edit trip</button>
          </div>
          <div style="font-size:0.86rem;color:var(--text-muted);">Planned arrival: <strong>${arrival}</strong> • Delivery email: <strong>${email}</strong></div>
          ${extraTripHtml}
          <div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:0.25rem;">
            ${travelerLines.join('')}
          </div>
        </div>
      `;

      stage4ReviewSummary.querySelectorAll('[data-goto-stage]').forEach((btn) => {
        btn.addEventListener('click', () => goToStage(parseInt(btn.getAttribute('data-goto-stage'), 10)));
      });
    }

    function validateStage(stageNum) {
      const errBox = document.getElementById('applyFormError');
      if (errBox) errBox.style.display = 'none';
      const dest = getSelectedDest();

      if (stageNum === 1) {
        const email = ((document.getElementById('applyEmail') || {}).value || '').trim();
        const arrival = (arrivalInput || {}).value || '';
        if (!arrival) {
          if (errBox) {
            errBox.textContent = 'Please select your planned arrival date.';
            errBox.style.display = 'block';
          }
          if (arrivalInput) arrivalInput.focus();
          return false;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (errBox) {
            errBox.textContent = 'Please enter a valid email address for document delivery.';
            errBox.style.display = 'block';
          }
          const emEl = document.getElementById('applyEmail');
          if (emEl) emEl.focus();
          return false;
        }
        if (dest.requiresFlightAndHotel) {
          const fl = ((flightInput || {}).value || '').trim();
          const ht = ((hotelInput || {}).value || '').trim();
          if (fl.length < 2) {
            if (errBox) {
              errBox.textContent = 'Please enter your arrival flight or vessel number for this arrival card.';
              errBox.style.display = 'block';
            }
            if (flightInput) flightInput.focus();
            return false;
          }
          if (ht.length < 3) {
            if (errBox) {
              errBox.textContent = 'Please enter your hotel name or accommodation address for this arrival card.';
              errBox.style.display = 'block';
            }
            if (hotelInput) hotelInput.focus();
            return false;
          }
        }
      }

      if (stageNum === 2) {
        const blocks = applicantsContainer.querySelectorAll('.applicant-block');
        for (let i = 0; i < blocks.length; i++) {
          const blk = blocks[i];
          const givenName = blk.querySelector('.js-app-given').value.trim();
          const surname = blk.querySelector('.js-app-surname').value.trim();
          const nationality = blk.querySelector('.js-app-nat').value;
          const dob = blk.querySelector('.js-app-dob').value;
          const passportNumber = blk.querySelector('.js-app-passnum').value.trim();
          const passportExpiry = blk.querySelector('.js-app-passexp').value;
          if (!givenName || !surname || !nationality || !dob || !passportNumber || !passportExpiry) {
            if (errBox) {
              errBox.textContent = `Please complete all passport fields for Traveler ${i + 1}.`;
              errBox.style.display = 'block';
            }
            blk.setAttribute('data-collapsed', 'false');
            renderApplicants();
            return false;
          }
        }
      }

      if (stageNum === 3 && dest.requiresUploads) {
        const count = Math.max(1, Math.min(20, parseInt(travInput.value || '1', 10)));
        for (let i = 0; i < count; i++) {
          const passInp = document.getElementById(`appPassFile_${i}`);
          const photoInp = document.getElementById(`appPhotoFile_${i}`);
          const hasPass = (passInp && passInp.files && passInp.files[0]) || uploadedFilesMap[`pass_${i}`];
          const hasPhoto = (photoInp && photoInp.files && photoInp.files[0]) || uploadedFilesMap[`photo_${i}`];
          if (!hasPass || !hasPhoto) {
            if (errBox) {
              errBox.textContent = `Please upload both the passport bio-page scan and portrait photo for Traveler ${i + 1}.`;
              errBox.style.display = 'block';
            }
            return false;
          }
        }
      }

      return true;
    }

    function goToStage(targetStage) {
      if (targetStage > currentStage) {
        for (let s = currentStage; s < targetStage; s++) {
          if (!validateStage(s)) return;
        }
      }
      currentStage = Math.max(1, Math.min(4, targetStage));

      if (currentStage === 3) renderDocumentsStage();
      if (currentStage === 4) renderStage4Review();

      document.querySelectorAll('.stage-panel').forEach((panel) => {
        const s = parseInt(panel.getAttribute('data-stage'), 10);
        panel.classList.toggle('active', s === currentStage);
      });

      document.querySelectorAll('.stage-step-btn').forEach((btn) => {
        const s = parseInt(btn.getAttribute('data-stage-target'), 10);
        btn.classList.toggle('active', s === currentStage);
        btn.classList.toggle('completed', s < currentStage);
        btn.setAttribute('aria-current', s === currentStage ? 'step' : 'false');
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.stage-step-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-stage-target'), 10);
        goToStage(target);
      });
    });

    document.querySelectorAll('.js-next-stage').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = parseInt(btn.getAttribute('data-next'), 10);
        goToStage(next);
      });
    });

    document.querySelectorAll('.js-prev-stage').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prev = parseInt(btn.getAttribute('data-prev'), 10);
        goToStage(prev);
      });
    });

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
      const stdPriceEl = document.getElementById('applyStandardPrice');
      const prioPriceEl = document.getElementById('applyPriorityPrice');
      const stdDescEl = document.getElementById('applyStandardTimeDesc');
      const prioDescEl = document.getElementById('applyPriorityTimeDesc');
      const disclosureEl = document.getElementById('applyOfficialDisclosure');

      if (stdPriceEl) stdPriceEl.textContent = `+${formatMoney(0)}`;
      if (prioPriceEl) prioPriceEl.textContent = `+${formatMoney(p.dest.priorityFeeUSD)}`;
      if (stdDescEl) stdDescEl.textContent = `Specialist check (${p.dest.standardReviewTime.toLowerCase()})`;
      if (prioDescEl) prioDescEl.textContent = `Front-of-queue review (${p.dest.priorityReviewTime.toLowerCase()})`;

      if (docTitleEl) docTitleEl.textContent = p.dest.cleanTitle || p.dest.visaType;
      if (govRowEl) {
        govRowEl.textContent =
          p.govPerPersonUSD === 0
            ? `${formatMoney(0)} (Free official form) × ${p.travelers}`
            : `${formatMoney(p.govPerPersonUSD)} × ${p.travelers} = ${formatMoney(p.govTotalUSD)}`;
      }
      if (srvRowEl) {
        srvRowEl.textContent = `${formatMoney(p.totalServicePerPersonUSD)} × ${p.travelers} = ${formatMoney(p.serviceTotalUSD)}`;
      }
      if (handRowEl) {
        handRowEl.textContent = speedTier === 'priority' ? p.dest.priorityReviewTime : p.dest.standardReviewTime;
      }
      if (govTimeRowEl) {
        govTimeRowEl.textContent = p.dest.govProcessingTime;
      }
      if (totEl) totEl.textContent = formatMoney(p.grandTotalUSD);
      if (stickyTotEl) stickyTotEl.textContent = formatMoney(p.grandTotalUSD);
      if (disclosureEl) {
        disclosureEl.innerHTML = `OnePassVisa is a private assistance service, not a government website. You can apply directly at <a href="${p.dest.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--emerald);font-weight:600;text-decoration:underline;">${p.dest.govPortalName}</a> for the ${p.govPerPersonUSD === 0 ? formatMoney(0) + ' government fee' : formatMoney(p.govPerPersonUSD) + ' government fee'} only. (Verified ${p.dest.verifiedDate})`;
      }

      updateDocumentSpecificVisibility();
    }

    window.opvRefreshApplySummary = updateSummary;

    const savedDraftRaw = localStorage.getItem('opv_saved_draft');
    if (savedDraftRaw && (params.get('resume') === '1' || !params.get('country'))) {
      try {
        const draft = JSON.parse(savedDraftRaw);
        if (draft.destinationId && destSelect) destSelect.value = draft.destinationId;
        if (draft.travelers && travInput) travInput.value = draft.travelers;
        if (draft.arrivalDate && arrivalInput) arrivalInput.value = draft.arrivalDate;
        if (draft.flightNumber && flightInput) flightInput.value = draft.flightNumber;
        if (draft.portOfEntry && portInput) portInput.value = draft.portOfEntry;
        if (draft.accommodationAddress && hotelInput) hotelInput.value = draft.accommodationAddress;
        if (draft.email && document.getElementById('applyEmail')) document.getElementById('applyEmail').value = draft.email;
        if (draft.phone && document.getElementById('applyPhone')) document.getElementById('applyPhone').value = draft.phone;
      } catch (e) {}
    }

    updateDocumentSpecificVisibility();
    renderApplicants();
    renderDocumentsStage();
    updateSummary();

    destSelect.addEventListener('change', () => {
      updateDocumentSpecificVisibility();
      renderDocumentsStage();
      updateSummary();
    });
    travInput.addEventListener('change', () => {
      renderApplicants();
      renderDocumentsStage();
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
          flightNumber: flightInput ? flightInput.value : '',
          portOfEntry: portInput ? portInput.value : '',
          accommodationAddress: hotelInput ? hotelInput.value : '',
          email: (document.getElementById('applyEmail') || {}).value || '',
          phone: (document.getElementById('applyPhone') || {}).value || ''
        };
        localStorage.setItem('opv_saved_draft', JSON.stringify(draft));
        if (saveStatus) {
          saveStatus.textContent = 'Saved in this browser. Return anytime via /apply?resume=1 on this device (uploaded files are not stored in browser storage for your privacy).';
          saveStatus.style.display = 'block';
        }
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateStage(1) || !validateStage(2) || !validateStage(3)) {
        return;
      }

      const errBox = document.getElementById('applyFormError');
      const submitBtn = document.getElementById('applySubmitBtn');
      if (errBox) errBox.style.display = 'none';

      const dest = getSelectedDest();
      const email = (document.getElementById('applyEmail') || {}).value.trim();
      const phone = ((document.getElementById('applyPhone') || {}).value || '').trim();
      const arrivalDate = (document.getElementById('applyArrivalDate') || {}).value;
      const flightNumber = flightInput ? flightInput.value.trim() : '';
      const portOfEntry = portInput ? portInput.value.trim() : '';
      const accommodationAddress = hotelInput ? hotelInput.value.trim() : '';
      const termsChecked = (document.getElementById('applyTermsConsent') || {}).checked;
      const speedRadio = document.querySelector('input[name="applySpeed"]:checked');
      const speedTier = speedRadio ? speedRadio.value : 'standard';

      if (!termsChecked) {
        if (errBox) {
          errBox.textContent =
            'Please confirm that you understand OnePassVisa is a private assistance service and agree to the Terms & Refund Policy.';
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

        let passportFileName = null;
        let photoFileName = null;
        if (dest.requiresUploads) {
          const passInp = document.getElementById(`appPassFile_${i}`);
          const photoInp = document.getElementById(`appPhotoFile_${i}`);
          const passFile = (passInp && passInp.files && passInp.files[0]) || uploadedFilesMap[`pass_${i}`];
          const photoFile = (photoInp && photoInp.files && photoInp.files[0]) || uploadedFilesMap[`photo_${i}`];
          if (!passFile || !photoFile) {
            if (errBox) {
              errBox.textContent = `Please upload both the passport scan and portrait photo for Traveler ${i + 1}.`;
              errBox.style.display = 'block';
            }
            goToStage(3);
            return;
          }
          passportFileName = passFile.name;
          photoFileName = photoFile.name;
        }

        applicants.push({
          givenName,
          surname,
          nationality,
          dob,
          passportNumber,
          passportExpiry,
          passportFileName,
          photoFileName
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
        flightNumber,
        portOfEntry,
        accommodationAddress,
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
          const ref =
            'OPV-' +
            new Date().toISOString().slice(0, 10).replace(/-/g, '') +
            '-' +
            Math.random().toString(16).slice(2, 8).toUpperCase();
          const localOrder = {
            reference: ref,
            createdAt: new Date().toISOString(),
            status: 'Pending Payment',
            destinationId: pricing.dest.id,
            destinationName: pricing.dest.name,
            category: pricing.dest.category,
            cleanTitle: pricing.dest.cleanTitle || pricing.dest.visaType,
            visaType: pricing.dest.visaType,
            govPortal: pricing.dest.govPortal,
            govPortalName: pricing.dest.govPortalName,
            ourHandlingTime: speedTier === 'priority' ? pricing.dest.priorityReviewTime : pricing.dest.standardReviewTime,
            govProcessingTime: pricing.dest.govProcessingTime,
            speedTier: pricing.speedTier,
            travelersCount: pricing.travelers,
            email: email.toLowerCase(),
            phone,
            arrivalDate,
            flightNumber,
            portOfEntry,
            accommodationAddress,
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
          submitBtn.textContent = 'Continue to secure checkout →';
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
          <p style="margin:0.75rem 0 1.25rem;color:var(--text-muted);">Please start your travel document application first.</p>
          <a href="apply.html" class="btn btn-primary">Start application</a>
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
    if (docEl) docEl.textContent = order.cleanTitle || order.visaType;
    if (emailEl) emailEl.textContent = order.email;
    if (travEl) travEl.textContent = `${order.travelersCount} Traveler(s)`;
    if (govEl) govEl.textContent = order.govTotalUSD === 0 ? `${formatMoney(0)} (Free official form)` : formatMoney(order.govTotalUSD);
    if (srvEl) srvEl.textContent = formatMoney(order.serviceTotalUSD);
    if (totEl) totEl.textContent = `${DATA.formatMoney(order.grandTotalUSD, 'USD')} USD`;
    if (discEl) {
      discEl.innerHTML = `OnePassVisa is a private assistance service, not a government site. You can apply directly at <a href="${order.govPortal}" target="_blank" rel="noopener noreferrer" style="color:var(--emerald);font-weight:600;text-decoration:underline;">${order.govPortalName}</a> for the ${order.govTotalUSD === 0 ? formatMoney(0) + ' government fee' : formatMoney(order.govTotalUSD) + ' government fee'} only.`;
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
        confirmedOrder.status = 'In review';
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
          <div class="card" style="border-color:var(--emerald-border);background:#FFFFFF;">
            <span class="badge badge-emerald" style="margin-bottom:0.75rem;">✓ Payment Confirmed • In Review</span>
            <h2 style="font-size:1.55rem;margin-bottom:0.5rem;">Thank you. Your application is now in specialist review.</h2>
            <p style="color:var(--text-body);margin-bottom:1.25rem;">
              A confirmation email and itemized receipt have been sent to <strong>${confirmedOrder.email}</strong>. Save your reference number below to track your status at any time.
            </p>
            <div style="background:var(--bg-page);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem;margin-bottom:1.25rem;">
              <div class="summary-row"><span>Application Reference</span><strong style="font-family:var(--font-mono);color:var(--emerald);">${confirmedOrder.reference}</strong></div>
              <div class="summary-row"><span>Receipt Number</span><strong style="font-family:var(--font-mono);">${confirmedOrder.receiptNumber || 'RCP-' + confirmedOrder.reference}</strong></div>
              <div class="summary-row"><span>Document</span><strong>${confirmedOrder.cleanTitle || confirmedOrder.visaType}</strong></div>
              <div class="summary-row"><span>Current Status</span><strong style="color:var(--emerald);">${confirmedOrder.status}</strong></div>
              <div class="summary-row"><span>Government Fee</span><strong>${confirmedOrder.govTotalUSD === 0 ? DATA.formatMoney(0, 'USD') + ' (Free)' : DATA.formatMoney(confirmedOrder.govTotalUSD, 'USD')}</strong></div>
              <div class="summary-row"><span>OnePassVisa Service</span><strong>${DATA.formatMoney(confirmedOrder.serviceTotalUSD, 'USD')}</strong></div>
              <div class="summary-total"><span>Total Charged (${methodLabel})</span><span>${DATA.formatMoney(confirmedOrder.grandTotalUSD, 'USD')} USD</span></div>
            </div>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
              <a href="track.html?ref=${encodeURIComponent(confirmedOrder.reference)}&email=${encodeURIComponent(confirmedOrder.email)}" class="btn btn-primary">Track application →</a>
              <button type="button" class="btn btn-outline" onclick="window.print()">Print receipt</button>
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

    const recoverBtn = document.getElementById('recoverReferenceBtn');
    const recoverBox = document.getElementById('recoverReferenceBox');
    if (recoverBtn && recoverBox) {
      recoverBtn.addEventListener('click', () => {
        const isHidden = recoverBox.style.display === 'none' || !recoverBox.style.display;
        recoverBox.style.display = isHidden ? 'block' : 'none';
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reference = (refInput ? refInput.value : '').trim().toUpperCase();
      const email = (emailInput ? emailInput.value : '').trim().toLowerCase();

      if (!reference || !email) {
        out.innerHTML = `<div class="card" style="border-color:var(--danger);"><p style="color:var(--danger);font-weight:600;">Please enter both your application reference and the email address used on your application.</p></div>`;
        out.style.display = 'block';
        return;
      }

      const tokens = JSON.parse(localStorage.getItem('opv_order_tokens') || '[]');
      const localPaid = JSON.parse(localStorage.getItem('opv_paid_orders') || '[]');
      let matchedOrder =
        localPaid.find((o) => o.reference === reference && String(o.email).toLowerCase() === email) || null;

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
      } catch (err) {}

      if (!matchedOrder) {
        out.innerHTML = `
          <div class="card" style="border-color:var(--border-input);">
            <span class="badge badge-amber" style="margin-bottom:0.5rem;">Application Not Found</span>
            <h3 style="font-size:1.15rem;margin-bottom:0.35rem;">No application matches reference "${reference}" and email "${email}".</h3>
            <p style="font-size:0.92rem;color:var(--text-body);margin-bottom:0.75rem;">
              <strong>What to do next:</strong>
            </p>
            <ul style="list-style:disc;padding-left:1.25rem;font-size:0.88rem;color:var(--text-body);display:flex;flex-direction:column;gap:0.35rem;">
              <li>Check your email inbox (and spam folder) for a message from <strong>support@onepassvisa.com</strong> containing your reference code (format: <code style="font-family:var(--font-mono);">OPV-YYYYMMDD-XXXXXX</code>).</li>
              <li>Make sure you entered the exact email address used when submitting your application.</li>
              <li>Need help recovering your reference? Email <a href="mailto:support@onepassvisa.com?subject=Reference%20Lookup" style="color:var(--emerald);font-weight:600;text-decoration:underline;">support@onepassvisa.com</a> with your full name and planned arrival date.</li>
            </ul>
          </div>
        `;
        out.style.display = 'block';
        return;
      }

      // Compute scheduled submission date if this is an arrival card with an arrival window
      let scheduledNote = 'Queued for official portal filing immediately after review.';
      if (matchedOrder.category === 'Arrival Card' && matchedOrder.arrivalDate) {
        const arrTime = new Date(matchedOrder.arrivalDate + 'T00:00:00Z').getTime();
        if (!isNaN(arrTime)) {
          const windowOpenDate = new Date(arrTime - 3 * 86400000).toISOString().slice(0, 10);
          scheduledNote = `Official submission window opens 3 days before arrival (scheduled for ${windowOpenDate}).`;
        }
      }

      out.innerHTML = `
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
            <div>
              <span class="badge badge-emerald">✓ In review</span>
              <h3 style="font-size:1.3rem;margin-top:0.4rem;">${matchedOrder.cleanTitle || matchedOrder.visaType}</h3>
            </div>
            <div style="font-family:var(--font-mono);font-weight:700;color:var(--emerald);">${matchedOrder.reference}</div>
          </div>

          <div class="status-timeline" aria-label="Application status timeline">
            <div class="status-step done">
              <span class="status-dot">✓</span>
              <div>
                <strong style="color:var(--navy);font-size:0.92rem;">1. Awaiting documents</strong>
                <div style="font-size:0.82rem;color:var(--text-muted);">Application and traveler details received.</div>
              </div>
            </div>
            <div class="status-step current">
              <span class="status-dot">2</span>
              <div>
                <strong style="color:var(--navy);font-size:0.92rem;">2. In review (${matchedOrder.ourHandlingTime})</strong>
                <div style="font-size:0.82rem;color:var(--text-body);">Our specialists are verifying your passport details and formatting requirements.</div>
              </div>
            </div>
            <div class="status-step">
              <span class="status-dot">3</span>
              <div>
                <strong style="color:var(--navy);font-size:0.92rem;">3. Scheduled for submission</strong>
                <div style="font-size:0.82rem;color:var(--text-muted);">${scheduledNote}</div>
              </div>
            </div>
            <div class="status-step">
              <span class="status-dot">4</span>
              <div>
                <strong style="color:var(--navy);font-size:0.92rem;">4. Submitted (${matchedOrder.govProcessingTime})</strong>
                <div style="font-size:0.82rem;color:var(--text-muted);">Filed with ${matchedOrder.govPortalName}.</div>
              </div>
            </div>
            <div class="status-step">
              <span class="status-dot">5</span>
              <div>
                <strong style="color:var(--navy);font-size:0.92rem;">5. Outcome received</strong>
                <div style="font-size:0.82rem;color:var(--text-muted);">Confirmation delivered by email to ${matchedOrder.email}.</div>
              </div>
            </div>
          </div>

          <div class="summary-row"><span>Applicant Email</span><strong>${matchedOrder.email}</strong></div>
          <div class="summary-row"><span>Travelers</span><strong>${matchedOrder.travelersCount}</strong></div>
          <div class="summary-row"><span>Planned Arrival Date</span><strong>${matchedOrder.arrivalDate}</strong></div>
          <div class="summary-row"><span>Total Paid</span><strong>${formatMoney(matchedOrder.grandTotalUSD)} (Government ${formatMoney(matchedOrder.govTotalUSD)} + service ${formatMoney(matchedOrder.serviceTotalUSD)})</strong></div>
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
        out.innerHTML = `<div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-border);color:var(--navy);"><strong>Ticket ${data.ticketId} Created:</strong> ${data.message}</div>`;
        out.style.display = 'block';
        form.reset();
      } catch (err) {
        out.innerHTML = `<div class="card" style="background:var(--emerald-tint);border-color:var(--emerald-border);">Thank you, ${name}. Your inquiry has been logged for <strong>support@onepassvisa.com</strong>. We will reply to <strong>${email}</strong> within 4 business hours.</div>`;
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
    initSearchableComboboxes();
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
