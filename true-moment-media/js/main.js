/* ==========================================================================
   TRUE MOMENT MEDIA — main.js
   Vanilla JavaScript: navigation, smooth scroll, portfolio filter, video
   modal, testimonial slider, reveal animations, back-to-top, active nav,
   WhatsApp/contact config, booking shortcuts, dynamic year, toasts.
   No frameworks, no dependencies.
   ========================================================================== */
'use strict';

/* ------------------------------------------------------------------
   SITE CONFIGURATION — edit these values before launch.
   Phone/email/socials below are PLACEHOLDERS, not real contact details.
------------------------------------------------------------------ */
const TMM_CONFIG = {
  brandName: 'TrueMoment Media',
  location: 'Lagos, Nigeria',
  phone: '+2348000000000',            // international format, no spaces
  phoneDisplay: '+234 800 000 0000',  // how it appears on the page
  whatsapp: '2348000000000',          // digits only, with country code
  email: 'hello@truemomentmedia.example',
  whatsappMessage: 'Hello TrueMoment Media! I would like to enquire about videography services for my event.',
  socials: {
    instagram: 'https://www.instagram.com/',  // replace with your profile URL
    tiktok: 'https://www.tiktok.com/',        // replace with your profile URL
    youtube: 'https://www.youtube.com/'       // replace with your channel URL
  }
};

/* ---------- Tiny helpers ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Toast notification (shared with booking.js via window.TMM) */
function toast(message) {
  const container = $('#toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 380);
  }, 4000);
}

function scrollToSection(selector) {
  const target = $(selector);
  if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

/* Expose a small shared API for booking.js */
window.TMM = { config: TMM_CONFIG, toast, scrollToSection };

/* ------------------------------------------------------------------
   1. Apply configurable contact details + WhatsApp links
------------------------------------------------------------------ */
function initConfigBindings() {
  $$('[data-bind="phone"]').forEach(el => {
    el.textContent = TMM_CONFIG.phoneDisplay;
    el.setAttribute('href', 'tel:' + TMM_CONFIG.phone);
  });
  $$('[data-bind="email"]').forEach(el => {
    el.textContent = TMM_CONFIG.email;
    el.setAttribute('href', 'mailto:' + TMM_CONFIG.email);
  });
  $$('[data-social]').forEach(el => {
    const url = TMM_CONFIG.socials[el.dataset.social];
    if (url) el.setAttribute('href', url);
  });
  const waLink = 'https://wa.me/' + TMM_CONFIG.whatsapp + '?text=' + encodeURIComponent(TMM_CONFIG.whatsappMessage);
  $$('[data-whatsapp]').forEach(el => el.setAttribute('href', waLink));
}

/* ------------------------------------------------------------------
   2. Responsive mobile navigation
------------------------------------------------------------------ */
function initNavigation() {
  const toggle = $('#navToggle');
  const nav = $('#siteNav');
  if (!toggle || !nav) return;

  const setNav = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open && window.innerWidth <= 900);
  };

  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('.nav-link, .nav-cta', nav).forEach(link => link.addEventListener('click', () => setNav(false)));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setNav(false); });
}

/* ------------------------------------------------------------------
   3. Header state, active nav highlighting, back-to-top visibility
------------------------------------------------------------------ */
function initScrollState() {
  const header = $('#siteHeader');
  const backToTop = $('#backToTop');
  const navLinks = $$('.nav-link');
  const sections = navLinks
    .map(link => $(link.getAttribute('href')))
    .filter(Boolean);

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);

    let current = sections.length ? sections[0].id : null;
    for (const section of sections) {
      if (y >= section.offsetTop - 160) current = section.id;
    }
    navLinks.forEach(link =>
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current)
    );
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();

  if (backToTop) {
    backToTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
    );
  }
}

/* ------------------------------------------------------------------
   4. "Discover Our Story" expand/collapse
------------------------------------------------------------------ */
function initStoryToggle() {
  const btn = $('#storyToggle');
  const panel = $('#storyMore');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
    $('.story-toggle-label', btn).textContent = open ? 'Discover Our Story' : 'Show Less';
  });
}

/* ------------------------------------------------------------------
   5. Service / package buttons → prefill booking form + scroll to it
------------------------------------------------------------------ */
function initBookingShortcuts() {
  $$('[data-book-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      const select = $('#eventType');
      if (select) {
        select.value = btn.dataset.bookService;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const message = $('#message');
      const serviceName = btn.dataset.serviceName || btn.dataset.bookService;
      if (message && !message.value.trim()) {
        message.value = `Hello TrueMoment Media, I would like to enquire about your ${serviceName} service.`;
      }
      scrollToSection('#booking');
      toast(`${serviceName} selected — please complete the booking form.`);
    });
  });

  $$('[data-book-package]').forEach(btn => {
    btn.addEventListener('click', () => {
      const select = $('#package');
      if (select) {
        select.value = btn.dataset.bookPackage;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      scrollToSection('#booking');
      toast(`${btn.dataset.bookPackage} Package selected — please complete the booking form.`);
    });
  });
}

/* ------------------------------------------------------------------
   6. Portfolio category filtering
------------------------------------------------------------------ */
function initPortfolioFilter() {
  const buttons = $$('.filter-btn');
  const items = $$('.portfolio-item');
  const count = $('#portfolioCount');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      const filter = btn.dataset.filter;
      let shown = 0;
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('is-hidden', show ? false : true);
        if (show) {
          shown++;
          item.classList.remove('filter-animate');
          void item.offsetWidth; /* restart the entrance animation */
          item.classList.add('filter-animate');
        }
      });
      if (count) count.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}.`;
    });
  });
}

/* ------------------------------------------------------------------
   7. Video modal / lightbox (keyboard accessible, focus trapped)
------------------------------------------------------------------ */
function initVideoModal() {
  const modal = $('#videoModal');
  if (!modal) return;
  const video = $('#modalVideo');
  const title = $('#modalTitle');
  const category = $('#modalCat');
  const closeBtn = $('#modalClose');
  const errorMsg = $('#modalVideoError');
  let lastFocused = null;

  const open = item => {
    lastFocused = document.activeElement;
    title.textContent = item.dataset.title || 'Project';
    category.textContent = item.dataset.categoryLabel || '';
    errorMsg.hidden = true;
    video.src = item.dataset.video || '';
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    closeBtn.focus();
    video.play().catch(() => { /* autoplay may be blocked; controls remain */ });
  };

  const close = () => {
    if (modal.hidden) return;
    video.pause();
    video.removeAttribute('src');
    video.load();
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
  };

  $$('.portfolio-open').forEach(btn =>
    btn.addEventListener('click', () => open(btn.closest('.portfolio-item')))
  );
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target.hasAttribute('data-close-modal')) close(); });
  video.addEventListener('error', () => { errorMsg.hidden = false; });

  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      const focusables = $$('button, video, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ------------------------------------------------------------------
   8. Testimonial slider (autoplay, dots, arrows, swipe, keyboard)
------------------------------------------------------------------ */
function initTestimonialSlider() {
  const slider = $('#testimonialSlider');
  if (!slider) return;
  const track = $('#testimonialTrack');
  const slides = $$('.testimonial-slide', slider);
  const dotsWrap = $('#sliderDots');
  const prevBtn = $('#prevTestimonial');
  const nextBtn = $('#nextTestimonial');
  const total = slides.length;
  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => { go(i); restart(); });
    dotsWrap.appendChild(dot);
  });
  const dots = $$('.slider-dot', dotsWrap);

  function go(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === index);
      d.setAttribute('aria-selected', String(k === index));
    });
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== index)));
  }
  const next = () => go(index + 1);
  const prev = () => go(index - 1);
  const start = () => { if (!reducedMotion && !timer) timer = setInterval(next, 7000); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const restart = () => { stop(); start(); };

  nextBtn.addEventListener('click', () => { next(); restart(); });
  prevBtn.addEventListener('click', () => { prev(); restart(); });
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  /* Touch / pointer swipe */
  const viewport = $('.testimonial-viewport', slider);
  let startX = null;
  viewport.addEventListener('pointerdown', e => { startX = e.clientX; });
  viewport.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); restart(); }
    startX = null;
  });

  go(0);
  start();
}

/* ------------------------------------------------------------------
   9. Scroll-triggered reveal animations
------------------------------------------------------------------ */
function initReveal() {
  const elements = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => observer.observe(el));
}

/* ------------------------------------------------------------------
   10. Dynamic copyright year
------------------------------------------------------------------ */
function initYear() {
  const el = $('#year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* ------------------------------------------------------------------
   Boot everything once the DOM is ready (scripts are deferred)
------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  initConfigBindings();
  initNavigation();
  initScrollState();
  initStoryToggle();
  initBookingShortcuts();
  initPortfolioFilter();
  initVideoModal();
  initTestimonialSlider();
  initReveal();
  initYear();
});
