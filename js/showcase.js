/* ══════════════════════════════════════════════════════════
   room2service — "Live Demo" scroll-cinema showcase
   Lenis + GSAP ScrollTrigger. Reskinned from a photography-driven
   reveal pattern to an all-DOM, UI-mockup-driven one (no video/image
   assets required — every "plate" below is a live dashboard mockup).
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var hasGSAP = typeof window.gsap !== 'undefined';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });
  }
  var EASE = 'power3.out';

  /* ── 1 · SMOOTH SCROLL (Lenis → ScrollTrigger) ── */
  var lenis = null;
  function initLenis() {
    if (typeof window.Lenis === 'undefined' || REDUCED) return;
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ── 2 · CUSTOM CURSOR ── */
  function initCursor() {
    var dot = $('#scCursorDot'), ring = $('#scCursorRing'), label = $('#scCursorLabel');
    if (!dot || !ring) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var dx = mx, dy = my, rx = mx, ry = my, shown = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = '1'; ring.style.opacity = '1'; }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      dot.style.opacity = '0'; ring.style.opacity = '0'; shown = false;
    });

    (function loop() {
      dx += (mx - dx) * 0.36; dy += (my - dy) * 0.36;
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();

    var targets = 'a, button, [data-cursor]';
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest(targets) : null;
      if (!t) return;
      ring.classList.add('is-active');
      label.textContent = t.getAttribute('data-cursor') || '';
    });
    document.addEventListener('mouseout', function (e) {
      var t = e.target.closest ? e.target.closest(targets) : null;
      if (!t) return;
      if (e.relatedTarget && t.contains(e.relatedTarget)) return;
      ring.classList.remove('is-active');
      label.textContent = '';
    });
  }

  /* ── 3 · PRELOADER (no image/video assets to wait on — timed ramp) ── */
  var STATUS = [
    'SYNCING FRONT DESK',
    'WARMING KITCHEN DISPLAY',
    'LOADING LIVE OCCUPANCY',
    'OPENING THE DASHBOARD'
  ];

  function preload() {
    var numEl = $('#scPreCount'), fillEl = $('#scPreFill'), statusEl = $('#scPreStatus');
    var shown = 0, start = Date.now(), MIN_MS = 900;

    function paint() {
      var elapsed = Date.now() - start;
      var real = Math.min(1, elapsed / MIN_MS);
      shown += (real - shown) * 0.22;
      var pct = Math.min(99, Math.round(shown * 100));
      if (numEl) numEl.textContent = pct;
      if (fillEl) fillEl.style.width = pct + '%';
      if (statusEl) {
        var s = STATUS[Math.min(STATUS.length - 1, Math.floor(shown * STATUS.length))];
        if (statusEl.textContent !== s) statusEl.textContent = s;
      }
      if (elapsed < MIN_MS || pct < 99) { schedule(paint); }
      else {
        if (numEl) numEl.textContent = '100';
        if (fillEl) fillEl.style.width = '100%';
        finish();
      }
    }
    schedule(paint);
    setTimeout(function () { start = -9e9; }, 4000); // safety valve
  }

  var booted = false;
  function finish() {
    if (booted) return;
    booted = true;
    var pre = $('#scPreloader');

    splitHeadline();
    var hero = hasGSAP ? heroIntro() : null; // built paused so there's no flash

    var go = function () {
      if (pre) pre.setAttribute('hidden', '');
      buildScroll();
      if (hasGSAP) ScrollTrigger.refresh();
      if (hero) hero.play();
    };

    if (!hasGSAP || REDUCED) {
      if (pre) pre.style.display = 'none';
      go();
      return;
    }

    var slats = $$('.sc-pre-shutter i');
    gsap.timeline()
      .to('.sc-pre-inner', { opacity: 0, y: -16, duration: 0.28, ease: 'power2.in' })
      .set(pre, { background: 'transparent' })
      .set(slats, { scaleY: 1, transformOrigin: 'bottom' })
      .to(slats, { scaleY: 0, transformOrigin: 'top', duration: 0.58, ease: 'power4.inOut', stagger: 0.05 }, '>-0.02')
      .add(go, '<0.12');
  }

  /* ── 4 · HERO INTRO ── */
  var splitDone = false;
  function splitHeadline() {
    if (splitDone) return;
    splitDone = true;
    if (typeof window.SplitType === 'undefined') return;
    $$('[data-split]').forEach(function (el) {
      try {
        var s = new SplitType(el, { types: 'chars', tagName: 'span' });
        s.chars.forEach(function (c) { c.classList.add('sc-hchar'); });
      } catch (e) { /* noop */ }
    });
  }

  function heroIntro() {
    if (!hasGSAP) return null;
    var chars = $$('.sc-display--hero .sc-hchar');
    var tl = gsap.timeline({ defaults: { ease: EASE }, paused: true });

    if (REDUCED) {
      gsap.set(chars.length ? chars : '.sc-display--hero .sc-line', { yPercent: 0, opacity: 1 });
      gsap.set(['.sc-reveal-copy .sc-kicker', '.sc-reveal-copy .sc-lede', '.sc-edge-stat', '.sc-trio span', '.sc-scroll-cue'], { opacity: 1, y: 0 });
      return tl;
    }

    if (chars.length) {
      tl.from(chars, { yPercent: 118, duration: 1, stagger: 0.016 }, 0);
    } else {
      tl.from('.sc-display--hero .sc-line', { yPercent: 110, duration: 1, stagger: 0.08 }, 0);
    }
    tl.from('.sc-reveal-copy .sc-kicker', { opacity: 0, y: 14, duration: 0.7 }, 0.15)
      .from('.sc-reveal-copy .sc-lede', { opacity: 0, y: 16, duration: 0.8 }, 0.48)
      .from('.sc-edge-stat', { opacity: 0, y: 12, duration: 0.7, stagger: 0.09 }, 0.32)
      .from('.sc-trio span', { opacity: 0, x: 16, duration: 0.6, stagger: 0.08 }, 0.5)
      .from('.sc-scroll-cue', { opacity: 0, duration: 0.6 }, 0.85);
    return tl;
  }

  /* ── 5 · SCROLL CHOREOGRAPHY ── */
  function buildScroll() {
    initConfigurator();
    initIdle();
    buildOutroLetters();

    if (!hasGSAP) { runCounters(true); return; }

    gsap.to('#scHudFill', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.4 }
    });

    runCounters(REDUCED);

    var mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: reduce)', function () {
      gsap.set('.sc-veil', { opacity: 0 });
      gsap.set('.sc-gcard', { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set('.sc-ops-word', { xPercent: 0, opacity: 1 });
      gsap.set('.sc-outro-letters .sc-ch', { yPercent: 0, opacity: 1 });
      gsap.set('.sc-slab', { opacity: 1, y: 0 });
    });

    /* ══ DESKTOP / TABLET — pinned scrub ══ */
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', function () {
      var kills = [];

      /* 01 · boot reveal — veil lifts off the dashboard mockup */
      var revealTL = gsap.timeline({
        scrollTrigger: {
          trigger: '#scReveal', start: 'top top', end: '+=220%',
          pin: '#scRevealStage', pinSpacing: true, scrub: 1
        }
      });
      revealTL
        .to('.sc-veil', { yPercent: -104, scale: 1.08, opacity: 0, filter: 'blur(10px)', ease: 'power1.in', duration: 0.62 }, 0.06)
        .to('.sc-display--hero .sc-hchar', { yPercent: -110, opacity: 0, stagger: { each: 0.006, from: 'start' }, ease: 'power2.in', duration: 0.22 }, 0.66)
        .to(['.sc-reveal-copy .sc-kicker', '.sc-reveal-copy .sc-lede'], { opacity: 0, y: -18, duration: 0.16 }, 0.66)
        .to('.sc-scroll-cue', { opacity: 0, duration: 0.1 }, 0.04)
        .fromTo('.sc-trio span', { color: 'rgba(255,255,255,.4)' }, { color: '#c9a24b', stagger: 0.1, duration: 0.2, ease: 'none' }, 0.5)
        .to('#scReveal', { opacity: 0.15, duration: 0.14, ease: 'none' }, 0.86);
      kills.push(revealTL);

      /* 03 · live ops — giant occluded wordmark + floating cards */
      var opsTL = gsap.timeline({
        scrollTrigger: { trigger: '#scOps', start: 'top top', end: '+=260%', pin: '#scOpsStage', pinSpacing: true, scrub: 1 }
      });
      opsTL
        .fromTo('.sc-ops-word', { xPercent: 18, opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'none' }, 0.02)
        .to('.sc-ops-word', { xPercent: -18, ease: 'none', duration: 0.92 }, 0.04)
        .fromTo('.sc-gcard', { yPercent: 40, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
          { yPercent: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', stagger: 0.07, duration: 0.2, ease: 'power2.out' }, 0.5)
        .fromTo('.sc-ops-caption', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.12)
        .to('.sc-grid-field', { xPercent: -12, yPercent: -8, ease: 'none', duration: 1 }, 0);
      kills.push(opsTL);

      /* 04 · horizontal module gallery */
      var track = $('#scGalleryTrack');
      if (track) {
        var shift = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 24); };
        var galleryTL = gsap.to(track, {
          x: function () { return -shift(); }, ease: 'none',
          scrollTrigger: {
            trigger: '#scGallery', start: 'top top',
            end: function () { return '+=' + (shift() + window.innerHeight * 0.6); },
            pin: '#scGalleryPin', pinSpacing: true, scrub: 1, invalidateOnRefresh: true,
            onUpdate: function (self) { gsap.set('#scGalleryRailFill', { scaleX: 0.08 + self.progress * 0.92 }); }
          }
        });
        kills.push(galleryTL);
      }

      /* 06 · outro */
      var outroTL = gsap.timeline({
        scrollTrigger: { trigger: '#scOutro', start: 'top top', end: '+=180%', pin: '#scOutroPin', pinSpacing: true, scrub: 1 }
      });
      outroTL
        .fromTo('.sc-outro-bg', { yPercent: 10, scale: 1.08 }, { yPercent: -6, scale: 1, ease: 'none', duration: 1 }, 0)
        .fromTo('.sc-outro-letters .sc-ch', { yPercent: 108, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.32, ease: 'power3.out' }, 0.05)
        .fromTo('.sc-outro-kicker', { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.1)
        .fromTo('.sc-outro-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.22 }, 0.6);
      kills.push(outroTL);

      /* section entrances */
      var reveals = [
        ['#scSpecs .sc-sec-head > *', '#scSpecs'],
        ['#scConfig .sc-config-head > *', '#scConfig'],
        ['#scConfig .sc-config-stage', '#scConfig'],
        ['#scConfig .sc-sw', '.sc-swatches'],
        ['.sc-reserve-wrap > *', '#scReserve']
      ];
      reveals.forEach(function (pair) {
        var els = $$(pair[0]);
        if (!els.length) return;
        var t = gsap.from(els, {
          opacity: 0, y: 30, duration: 0.85, stagger: 0.07, ease: EASE,
          scrollTrigger: { trigger: pair[1], start: 'top 78%', once: true }
        });
        kills.push(t);
      });

      gsap.from('.sc-spec', {
        opacity: 0, y: 36, duration: 0.85, stagger: 0.09, ease: EASE,
        scrollTrigger: { trigger: '.sc-spec-row', start: 'top 82%', once: true }
      });

      return function () {
        kills.forEach(function (t) { if (t && t.scrollTrigger) t.scrollTrigger.kill(); if (t) t.kill(); });
      };
    });

    /* ══ MOBILE — pins collapse to plain reveals ══ */
    mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
      var kills = [];

      var t1 = gsap.timeline({ scrollTrigger: { trigger: '#scReveal', start: 'top top', end: 'bottom top', scrub: 0.8 } });
      t1.to('.sc-veil', { yPercent: -90, opacity: 0, ease: 'power1.in', duration: 0.7 }, 0);
      kills.push(t1);

      var t3 = gsap.from('.sc-gcard', {
        opacity: 0, y: 22, stagger: 0.08, duration: 0.7, ease: EASE,
        scrollTrigger: { trigger: '#scOps', start: 'top 30%', once: true }
      });
      kills.push(t3);

      gsap.set('#scGalleryTrack', { clearProps: 'transform' });
      var t4 = gsap.from('.sc-slab', {
        opacity: 0, y: 32, duration: 0.8, stagger: 0.1, ease: EASE,
        scrollTrigger: { trigger: '#scGallery', start: 'top 80%', once: true }
      });
      kills.push(t4);

      var t5 = gsap.from('.sc-outro-letters .sc-ch', {
        yPercent: 100, opacity: 0, stagger: 0.035, duration: 0.7, ease: EASE,
        scrollTrigger: { trigger: '#scOutro', start: 'top 70%', once: true }
      });
      kills.push(t5);
      gsap.set(['.sc-outro-kicker', '.sc-outro-sub'], { opacity: 1 });

      [['#scSpecs .sc-sec-head > *', '#scSpecs'], ['.sc-spec', '.sc-spec-row'],
       ['#scConfig .sc-config-head > *', '#scConfig'], ['.sc-reserve-wrap > *', '#scReserve']
      ].forEach(function (pair) {
        var els = $$(pair[0]);
        if (!els.length) return;
        kills.push(gsap.from(els, {
          opacity: 0, y: 24, duration: 0.8, stagger: 0.07, ease: EASE,
          scrollTrigger: { trigger: pair[1], start: 'top 85%', once: true }
        }));
      });

      return function () {
        kills.forEach(function (t) { if (t && t.scrollTrigger) t.scrollTrigger.kill(); if (t) t.kill(); });
      };
    });

    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.2 });
        else el.scrollIntoView();
      });
    });

    window.addEventListener('resize', debounce(function () { ScrollTrigger.refresh(); }, 220), { passive: true });
  }

  /* ── 6 · COUNT-UPS ── */
  var countersRun = false;
  function runCounters(instant) {
    if (countersRun) return;
    countersRun = true;
    $$('.sc-count').forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count')) || 0;
      var dec = parseInt(el.getAttribute('data-dec'), 10) || 0;
      var fmt = function (v) { return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US'); };
      if (instant || !hasGSAP) { el.textContent = fmt(to); return; }
      var obj = { v: 0 };
      gsap.to(obj, {
        v: to, duration: 2, ease: 'power2.out',
        onUpdate: function () { el.textContent = fmt(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ── 7 · CONFIGURATOR (wipe-swap of a DOM panel, no images needed) ── */
  function initConfigurator() {
    var view = $('#scConfigView');
    var swatches = $$('.sc-sw');
    if (!view || !swatches.length) return;
    var busy = false;

    function apply(btn) {
      if (busy || btn.classList.contains('is-active')) return;
      busy = true;

      swatches.forEach(function (s) { s.classList.remove('is-active'); s.removeAttribute('aria-current'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-current', 'true');

      var next = document.createElement('div');
      next.className = 'sc-config-panel-inner';
      next.innerHTML = btn.getAttribute('data-panel') || '';
      next.style.clipPath = 'inset(0% 0% 0% 100%)';
      next.style.position = 'absolute';
      next.style.inset = '0';
      view.appendChild(next);

      var swap = function () {
        var old = $('.sc-config-panel-inner.is-live', view);
        next.classList.add('is-live');
        next.style.position = '';
        next.style.inset = '';
        if (old && old !== next) old.remove();
        busy = false;
      };

      $('#scConfigName').textContent = btn.getAttribute('data-name');
      $('#scConfigDesc').textContent = btn.getAttribute('data-desc');
      $('#scConfigCode').textContent = btn.getAttribute('data-code');
      $('#scConfigStatA').textContent = btn.getAttribute('data-stat-a');
      $('#scConfigStatB').textContent = btn.getAttribute('data-stat-b');

      if (!hasGSAP || REDUCED) {
        next.style.clipPath = 'inset(0% 0% 0% 0%)';
        swap();
        return;
      }
      gsap.timeline({ onComplete: swap })
        .fromTo(next, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: EASE }, 0)
        .fromTo('#scConfigCode', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }, 0.2)
        .fromTo('#scConfigName', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 }, 0.12);
    }

    swatches.forEach(function (btn) { btn.addEventListener('click', function () { apply(btn); }); });
    swatches[0].setAttribute('aria-current', 'true');
  }

  /* ── 8 · OUTRO LETTERS ── */
  function buildOutroLetters() {
    var host = $('#scOutroLetters');
    if (!host) return;
    var word = host.textContent.trim();
    host.textContent = '';
    word.split('').forEach(function (ch) {
      var wrap = document.createElement('span');
      wrap.style.overflow = 'hidden';
      wrap.style.display = 'inline-block';
      wrap.style.paddingBottom = '.06em';
      var inner = document.createElement('span');
      inner.className = 'sc-ch';
      inner.textContent = ch === ' ' ? ' ' : ch;
      wrap.appendChild(inner);
      host.appendChild(wrap);
    });
  }

  /* ── 9 · LIVE-SYNC toggle ── */
  function initIdle() {
    var btn = $('#scIdleToggle'), state = $('#scIdleState');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!on));
      if (state) state.textContent = on ? 'OFF' : 'ON';
    });
  }

  /* ── util ── */
  function schedule(fn) {
    if (document.visibilityState === 'hidden') setTimeout(fn, 32);
    else requestAnimationFrame(fn);
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms);
    };
  }

  /* ── boot ── */
  initLenis();
  initCursor();
  preload();

  window.addEventListener('load', function () { if (hasGSAP) ScrollTrigger.refresh(); });
})();
