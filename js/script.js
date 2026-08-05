document.addEventListener('DOMContentLoaded', function () {

  // FAQ accordion toggle
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Services page module tabs
  var tabs = document.querySelectorAll('.module-tab');
  var panels = document.querySelectorAll('.module-panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-module');
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      panels.forEach(function (panel) {
        panel.classList.toggle('d-none', panel.getAttribute('data-module') !== target);
      });
    });
  });

  // Pricing help chips (contact page "what can we help with")
  document.querySelectorAll('.help-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.help-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
    });
  });

  // Sticky header shadow on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var toggleHeaderScrolled = function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    toggleHeaderScrolled();
    window.addEventListener('scroll', toggleHeaderScrolled);
  }

  // Scroll reveal animations (works on desktop and mobile)
  var revealSelectors = [
    '.module-card', '.price-card', '.recognition-card', '.team-card',
    '.timeline-card', '.value-card', '.contact-form-card', '.demo-form-card',
    '.stat-block', '.testimonial-section .quote', '.text-center.mb-5'
  ];
  var revealGroups = revealSelectors.map(function (sel) {
    return document.querySelectorAll(sel);
  });
  revealGroups.forEach(function (group) {
    group.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
    });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

});
