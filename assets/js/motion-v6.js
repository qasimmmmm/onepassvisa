/*
 * OnePassVisa Presentation Motion Layer (motion-v6.js)
 * Strictly presentation-only: reads DOM / ONEPASS_DATA and updates classes, styles, and decorative images.
 * Never accesses form values for mutation, storage, analytics, or network APIs.
 */
(function () {
  'use strict';

  const reducedMotion = Boolean(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  if (!reducedMotion) {
    document.documentElement.classList.add('has-motion');
  }

  // 1. Convert Unicode regional-indicator flag emojis inside .combo-flag and .dest-flag-badge into crisp SVG flags
  function extractIsoFromEmoji(text) {
    if (!text) return '';
    const cps = Array.from(text);
    for (let i = 0; i < cps.length - 1; i++) {
      const a = cps[i].codePointAt(0);
      const b = cps[i + 1].codePointAt(0);
      if (a >= 0x1f1e6 && a <= 0x1f1ff && b >= 0x1f1e6 && b <= 0x1f1ff) {
        return String.fromCharCode(97 + (a - 0x1f1e6), 97 + (b - 0x1f1e6));
      }
    }
    return '';
  }

  function upgradeFlagsIn(root) {
    if (!root || !root.querySelectorAll) return;
    const nodes = root.querySelectorAll('.combo-flag, .dest-flag-badge');
    nodes.forEach((node) => {
      if (node.querySelector('img')) return;
      const iso = extractIsoFromEmoji(node.textContent);
      if (!iso) return;
      node.innerHTML = `<img src="assets/images/flags/${iso}.svg" alt="" width="20" height="15" class="flag-svg" />`;
    });
  }

  function initFlagObserver() {
    upgradeFlagsIn(document);
    const targets = [
      document.getElementById('destinationsGrid'),
      document.getElementById('comboNationalityList'),
      document.getElementById('comboDestinationList'),
      document.getElementById('comboNationalityLabel'),
      document.getElementById('comboDestinationLabel'),
      document.getElementById('stage4ReviewSummary'),
      document.getElementById('checkerResultDrawer')
    ].filter(Boolean);

    if (!targets.length || typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && m.target) {
          upgradeFlagsIn(m.target);
        }
      }
    });
    targets.forEach((el) => mo.observe(el, { childList: true, subtree: true }));
  }

  // 2. Condensing sticky header (transforms & opacity only — zero layout shift)
  function initCondensingHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let ticking = false;
    function syncHeader() {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
      ticking = false;
    }
    syncHeader();
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(syncHeader);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // 3. Homepage hero signature moment: cross-fade destination photo on checker selection
  function initHeroPhotoSwap() {
    const swapImg = document.querySelector('.hero-photo-swap');
    const captionEl = document.querySelector('.hero-photo-caption-text');
    const pillEl = document.querySelector('.hero-photo-doc-pill');
    const destSelect = document.getElementById('checkerDestination');
    const destLabel = document.getElementById('comboDestinationLabel');
    if (!swapImg || !destSelect) return;

    let activeDestId = '';
    let requestToken = 0;

    function updateBadgeText(el, nextText) {
      if (!el || el.textContent === nextText) return;
      if (reducedMotion) {
        el.textContent = nextText;
        return;
      }
      el.classList.add('is-updating');
      window.setTimeout(() => {
        el.textContent = nextText;
        el.classList.remove('is-updating');
      }, 140);
    }

    function syncHeroDestination() {
      const id = destSelect.value || '';
      if (id === activeDestId) return;
      activeDestId = id;
      const token = ++requestToken;

      const data = window.ONEPASS_DATA;
      const dest = data && Array.isArray(data.destinations)
        ? data.destinations.find((d) => d.id === id)
        : null;

      if (!dest || dest.id === 'vietnam') {
        swapImg.classList.remove('is-active');
        updateBadgeText(captionEl, 'Ha Long Bay, Vietnam');
        updateBadgeText(pillEl, 'Tourist eVisa');
        return;
      }

      const nextCaption = dest.name;
      const nextPill = dest.shortDocName || dest.categoryBadge || 'Travel document';
      updateBadgeText(captionEl, nextCaption);
      updateBadgeText(pillEl, nextPill);

      const preload = new Image();
      preload.decoding = 'async';
      preload.onload = () => {
        if (token !== requestToken) return;
        if (dest.imageSmall) {
          swapImg.srcset = `${dest.imageSmall} 480w, ${dest.image} 800w`;
        }
        swapImg.src = dest.image;
        window.requestAnimationFrame(() => {
          if (token === requestToken) swapImg.classList.add('is-active');
        });
      };
      preload.src = dest.image;
    }

    destSelect.addEventListener('change', syncHeroDestination);
    if (destLabel && typeof MutationObserver !== 'undefined') {
      const labelObserver = new MutationObserver(syncHeroDestination);
      labelObserver.observe(destLabel, { childList: true, subtree: true });
    }
    syncHeroDestination();
  }

  // 4. Staggered scroll reveals & scroll-drawn process connector (entrances play once)
  function initScrollChoreography() {
    if (reducedMotion) return;

    const staggerGroups = document.querySelectorAll(
      '.dest-grid, .process-grid, .document-comparison, .principles-list, .detail-facts'
    );
    staggerGroups.forEach((group) => {
      Array.from(group.children).forEach((child, index) => {
        const capped = Math.min(index, 5);
        child.style.setProperty('--stagger', `${capped * 70}ms`);
      });
    });

    const revealTargets = document.querySelectorAll(
      '.reveal-on-scroll, .dest-card, .process-step, .fee-anatomy, .document-comparison-row, .principles-list > *, .detail-facts > div'
    );
    revealTargets.forEach((el) => el.classList.add('motion-reveal'));

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-revealed'));
      document.querySelectorAll('.process-track-wrap').forEach((w) => w.classList.add('is-drawn'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
    );

    revealTargets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94) {
        el.classList.add('is-revealed');
      } else {
        io.observe(el);
      }
    });

    // Scroll-drawn horizontal process connector
    const trackWrap = document.querySelector('.process-track-wrap');
    if (trackWrap) {
      const rect = trackWrap.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        trackWrap.classList.add('is-drawn');
      } else {
        const trackIo = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-drawn');
                trackIo.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.25 }
        );
        trackIo.observe(trackWrap);
      }
    }

    // Ensure dynamically filtered destination cards reveal cleanly
    const destGrid = document.getElementById('destinationsGrid');
    if (destGrid && typeof MutationObserver !== 'undefined') {
      const gridMo = new MutationObserver(() => {
        Array.from(destGrid.children).forEach((card, idx) => {
          card.style.setProperty('--stagger', `${Math.min(idx, 5) * 65}ms`);
          card.classList.add('motion-reveal');
          window.requestAnimationFrame(() => card.classList.add('is-revealed'));
        });
      });
      gridMo.observe(destGrid, { childList: true });
    }
  }

  // 5. Guided application stepper progress bar & tracking timeline cascade
  function initJourneyMotion() {
    const stepper = document.querySelector('.stage-stepper');
    const progressFill = document.querySelector('.stage-progress-fill');
    if (stepper && progressFill) {
      const syncStepProgress = () => {
        const activeBtn = stepper.querySelector('.stage-step-btn.active');
        const stageNum = activeBtn ? parseInt(activeBtn.getAttribute('data-stage-target') || '1', 10) : 1;
        const ratio = Math.max(0.25, Math.min(1, stageNum / 4));
        progressFill.style.transform = `scaleX(${ratio})`;
      };
      syncStepProgress();
      if (typeof MutationObserver !== 'undefined') {
        const stepMo = new MutationObserver(syncStepProgress);
        stepMo.observe(stepper, { attributes: true, subtree: true, attributeFilter: ['class'] });
      }
    }

    const trackOut = document.getElementById('trackResultContainer');
    if (trackOut && !reducedMotion && typeof MutationObserver !== 'undefined') {
      const styleTimeline = () => {
        const timeline = trackOut.querySelector('.status-timeline');
        if (!timeline || timeline.classList.contains('is-animated')) return;
        Array.from(timeline.querySelectorAll('.status-step')).forEach((step, idx) => {
          step.style.setProperty('--step-delay', `${idx * 70}ms`);
        });
        timeline.classList.add('is-animated');
      };
      styleTimeline();
      const trackMo = new MutationObserver(styleTimeline);
      trackMo.observe(trackOut, { childList: true });
    }
  }

  function boot() {
    initFlagObserver();
    initCondensingHeader();
    initHeroPhotoSwap();
    initScrollChoreography();
    initJourneyMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
