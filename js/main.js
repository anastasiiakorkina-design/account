/**
 * ALLSQUARE — main.js
 * Pure vanilla JS, no dependencies
 */

'use strict';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

/* ══════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════ */
(function initLoader() {
  const screen = $('#loading-screen');
  if (!screen) return;

  document.body.classList.add('loading');

  // Wait for fonts + progress animation (~1.6s), then hide
  const hide = () => {
    screen.classList.add('hidden');
    document.body.classList.remove('loading');
    // Remove from DOM after transition
    screen.addEventListener('transitionend', () => screen.remove(), { once: true });
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 1600);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 1600), { once: true });
  }
})();

/* ══════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════ */
(function initNav() {
  const header = $('#site-header');
  const hamburger = $('#hamburger');
  const navLinks = $('#nav-links');
  if (!header) return;

  // Scroll-aware styling
  let ticking = false;
  const updateHeader = () => {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
    ticking = false;
  };

  on(window, 'scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();

  // Mobile menu
  if (hamburger && navLinks) {
    on(hamburger, 'click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    $$('.nav-link', navLinks).forEach(link => {
      on(link, 'click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    on(document, 'keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });

    // Close on outside click
    on(document, 'click', e => {
      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) &&
          !hamburger.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Active link highlighting on scroll
  const sections = $$('section[id], main[id]');
  const navLinkEls = $$('.nav-link');

  const highlightNav = () => {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (scrollMid >= top && scrollMid < bottom) {
        navLinkEls.forEach(l => l.classList.remove('active'));
        const match = navLinkEls.find(l => l.getAttribute('href') === `#${sec.id}`);
        if (match) match.classList.add('active');
      }
    });
  };

  on(window, 'scroll', highlightNav, { passive: true });
})();

/* ══════════════════════════════════════════════════
   SCROLL-REVEAL (IntersectionObserver)
══════════════════════════════════════════════════ */
(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = $$('.reveal');

  if (prefersReduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  items.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════
   ANIMATED COUNT-UP NUMBERS
══════════════════════════════════════════════════ */
(function initCountUp() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = $$('[data-target]');
  if (!counters.length) return;

  const ease = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  const animateCounter = el => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = prefersReduced ? 0 : 2000;
    const start = performance.now();

    const tick = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(ease(progress) * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════
   PARALLAX
══════════════════════════════════════════════════ */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const hero = $('.hero-section');
  if (!hero) return;

  let ticking = false;

  on(window, 'scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const shapes = $$('.shape', hero);
        shapes.forEach((shape, i) => {
          const speed = [0.04, 0.07, 0.05, 0.03, 0.06][i % 5];
          shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   TESTIMONIALS CAROUSEL
══════════════════════════════════════════════════ */
(function initCarousel() {
  const track = $('#testimonials-track');
  const prevBtn = $('#prev-testimonial');
  const nextBtn = $('#next-testimonial');
  const dots = $$('.dot');
  if (!track) return;

  const slides = $$('.testimonial-slide', track);
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  const goTo = idx => {
    current = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', String(i !== current));
    });
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  on(nextBtn, 'click', () => { next(); resetAuto(); });
  on(prevBtn, 'click', () => { prev(); resetAuto(); });

  dots.forEach(dot => {
    on(dot, 'click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      resetAuto();
    });
  });

  // Keyboard nav
  on(track.closest('[role="region"]'), 'keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  // Auto-slide
  const startAuto = () => {
    autoTimer = setInterval(next, 5000);
  };

  const resetAuto = () => {
    clearInterval(autoTimer);
    startAuto();
  };

  // Pause on hover / focus
  const carousel = $('#testimonials-carousel');
  on(carousel, 'mouseenter', () => clearInterval(autoTimer));
  on(carousel, 'mouseleave', startAuto);
  on(carousel, 'focusin', () => clearInterval(autoTimer));
  on(carousel, 'focusout', startAuto);

  // Touch swipe
  let touchStart = 0;
  on(track, 'touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
  on(track, 'touchend', e => {
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? next() : prev();
      resetAuto();
    }
  }, { passive: true });

  // Initialize
  goTo(0);
  startAuto();
})();

/* ══════════════════════════════════════════════════
   SERVICE SELECTOR & WHAT'S INCLUDED CALCULATOR
══════════════════════════════════════════════════ */
(function initDonation() {
  const amountBtns = $$('.amount-btn');
  const customWrap = $('#custom-amount-wrap');
  const customInput = $('#custom-amount-input');
  const impactAmount = $('#impact-amount');
  const impactDesc = $('#impact-description');
  const impactIcon = $('#impact-description')?.closest('.impact-result')?.querySelector('.impact-icon');
  const donateBtn = $('#donate-btn');
  const donateTypeTabs = $$('.donate-tab');

  if (!amountBtns.length) return;

  const serviceLabels = { 10: 'Bookkeeping', 25: 'Accountancy', 50: 'Xero Setup', 100: 'Payroll' };

  const impacts = {
    10: { icon: '📒', desc: 'Accurate, up-to-date bookkeeping, bank reconciliations, and monthly management reports so you always know where your finances stand' },
    25: { icon: '📊', desc: 'Year-end accounts, corporation tax returns, Companies House filing, and strategic financial advice tailored to your business' },
    50: { icon: '☁️', desc: 'Full Xero setup, data migration, team training, and ongoing Xero support so you can manage your finances from anywhere, on any device' },
    100: { icon: '👥', desc: 'Monthly payroll processing, RTI submissions, PAYE management, payslips, and year-end P60s — all handled accurately and on time' },
    default: { icon: '✨', desc: 'A fully bespoke package combining all the services your business needs — bookkeeping, accountancy, VAT, payroll, and advisory support' }
  };

  let selectedAmount = 25;

  const updateImpact = amount => {
    const data = impacts[amount] || impacts.default;
    const label = serviceLabels[amount] || 'All Services';
    if (impactAmount) impactAmount.textContent = label;
    if (impactDesc) impactDesc.textContent = data.desc;
    if (impactIcon) impactIcon.textContent = data.icon;
  };

  amountBtns.forEach(btn => {
    on(btn, 'click', () => {
      amountBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');

      const val = btn.dataset.amount;
      if (val === 'custom') {
        customWrap.hidden = false;
        customInput.focus();
        selectedAmount = null;
        updateImpact(null);
      } else {
        customWrap.hidden = true;
        selectedAmount = parseInt(val, 10);
        updateImpact(selectedAmount);
      }
    });
  });

  // Service type tabs (Small Business / Charity)
  donateTypeTabs.forEach(tab => {
    on(tab, 'click', () => {
      donateTypeTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    });
  });

  // Initialize
  updateImpact(25);
})();

/* ══════════════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════════════ */
(function initFAQ() {
  const items = $$('[data-faq]');

  items.forEach(item => {
    const btn = $('.faq-question', item);
    const answerId = btn?.getAttribute('aria-controls');
    const answer = answerId ? document.getElementById(answerId) : null;
    if (!btn || !answer) return;

    on(btn, 'click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others in same column
      const column = item.closest('.faq-column');
      if (column) {
        $$('[data-faq]', column).forEach(other => {
          if (other !== item) {
            const otherBtn = $('.faq-question', other);
            const otherId = otherBtn?.getAttribute('aria-controls');
            const otherAnswer = otherId ? document.getElementById(otherId) : null;
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherAnswer) otherAnswer.hidden = true;
          }
        });
      }

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();

/* ══════════════════════════════════════════════════
   CONTACT FORM VALIDATION
══════════════════════════════════════════════════ */
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const success = $('#form-success');
  const submitBtn = $('#contact-submit');

  const rules = {
    'contact-name':    { required: true, minLen: 2, errorEl: 'name-error',    msg: 'Please enter your full name (at least 2 characters).' },
    'contact-email':   { required: true, email: true, errorEl: 'email-error', msg: 'Please enter a valid email address.' },
    'contact-subject': { required: true, errorEl: 'subject-error',            msg: 'Please select a subject.' },
    'contact-message': { required: true, minLen: 10, errorEl: 'message-error', msg: 'Please enter a message (at least 10 characters).' }
  };

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const showError = (id, msg) => {
    const el = document.getElementById(id);
    const field = document.getElementById(id.replace('-error', '').replace('name', 'contact-name').replace('email', 'contact-email').replace('subject', 'contact-subject').replace('message', 'contact-message'));
    if (el) el.textContent = msg;
    if (field) field.classList.toggle('error', !!msg);
  };

  const clearErrors = () => {
    Object.values(rules).forEach(r => {
      const el = document.getElementById(r.errorEl);
      if (el) el.textContent = '';
    });
    $$('.error', form).forEach(el => el.classList.remove('error'));
    const consentErr = $('#consent-error');
    if (consentErr) consentErr.textContent = '';
  };

  const validate = () => {
    let valid = true;
    clearErrors();

    Object.entries(rules).forEach(([fieldId, rule]) => {
      const field = document.getElementById(fieldId);
      if (!field) return;
      const val = field.value.trim();

      if (rule.required && !val) {
        showError(rule.errorEl, rule.msg);
        field.classList.add('error');
        valid = false;
      } else if (rule.email && val && !isEmail(val)) {
        showError(rule.errorEl, rule.msg);
        field.classList.add('error');
        valid = false;
      } else if (rule.minLen && val.length < rule.minLen) {
        showError(rule.errorEl, rule.msg);
        field.classList.add('error');
        valid = false;
      }
    });

    const consent = form.querySelector('[name="consent"]');
    if (consent && !consent.checked) {
      const el = $('#consent-error');
      if (el) el.textContent = 'Please agree to our privacy policy to continue.';
      valid = false;
    }

    return valid;
  };

  // Inline validation on blur
  Object.entries(rules).forEach(([fieldId, rule]) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    on(field, 'blur', () => {
      const val = field.value.trim();
      let err = '';
      if (rule.required && !val) err = rule.msg;
      else if (rule.email && val && !isEmail(val)) err = rule.msg;
      else if (rule.minLen && val && val.length < rule.minLen) err = rule.msg;
      showError(rule.errorEl, err);
      field.classList.toggle('error', !!err);
    });
    on(field, 'input', () => {
      if (field.classList.contains('error')) {
        showError(rule.errorEl, '');
        field.classList.remove('error');
      }
    });
  });

  on(form, 'submit', e => {
    e.preventDefault();
    if (!validate()) {
      // Focus first error field
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate sending
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Sending…';

    setTimeout(() => {
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
    }, 1200);
  });
})();

/* ══════════════════════════════════════════════════
   NEWSLETTER FORM
══════════════════════════════════════════════════ */
(function initNewsletter() {
  const forms = [
    { form: '#newsletter-form', success: '#newsletter-success', emailId: 'newsletter-email' },
    { form: '.footer-newsletter-form', success: null, emailId: 'footer-email' }
  ];

  forms.forEach(({ form: formSel, success: successSel, emailId }) => {
    const form = $(formSel);
    if (!form) return;

    on(form, 'submit', e => {
      e.preventDefault();
      const input = document.getElementById(emailId) || form.querySelector('input[type="email"]');
      const email = input?.value.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isEmail) {
        if (input) {
          input.style.borderColor = 'var(--color-error)';
          input.focus();
          setTimeout(() => { input.style.borderColor = ''; }, 2000);
        }
        return;
      }

      // Simulate submit
      if (successSel) {
        const successEl = $(successSel);
        const group = form.querySelector('.newsletter-input-group');
        if (group) group.hidden = true;
        if (successEl) successEl.hidden = false;
      } else {
        // Footer form
        const btn = form.querySelector('button');
        if (btn) {
          btn.textContent = '✓';
          btn.style.background = 'var(--color-accent)';
        }
        if (input) {
          input.value = '';
          input.placeholder = 'Subscribed!';
        }
      }
    });
  });
})();

/* ══════════════════════════════════════════════════
   GALLERY LIGHTBOX
══════════════════════════════════════════════════ */
(function initGallery() {
  const lightbox = $('#lightbox');
  const closeBtn = $('#lightbox-close');
  const caption = $('#lightbox-caption');
  const lightboxPlaceholder = lightbox?.querySelector('.lightbox-placeholder');
  const items = $$('.gallery-item');

  if (!lightbox) return;

  const open = (item) => {
    const label = item.querySelector('.gallery-label')?.textContent || '';
    const gpClass = Array.from(item.querySelector('[class*="gp-"]')?.classList || [])
      .find(c => c.startsWith('gp-'));

    if (lightboxPlaceholder && gpClass) {
      lightboxPlaceholder.className = `lightbox-placeholder ${gpClass}`;
    }
    if (caption) caption.textContent = label;

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    // Focus trap
    closeBtn?.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  };

  items.forEach(item => {
    on(item, 'click', () => open(item));
    on(item, 'keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(item);
      }
    });
  });

  on(closeBtn, 'click', close);
  on(lightbox, 'click', e => {
    if (e.target === lightbox) close();
  });
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && !lightbox.hidden) close();
  });
})();

/* ══════════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  let ticking = false;
  on(window, 'scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.hidden = window.scrollY < 600;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════════════
   VIDEO PLAY BUTTON
══════════════════════════════════════════════════ */
(function initVideo() {
  const placeholder = $('.video-placeholder');
  if (!placeholder) return;

  on(placeholder, 'click', () => {
    // In a real implementation, load and play the video
    placeholder.innerHTML = `
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
                  background:linear-gradient(135deg,#0F172A,#1E3A5F);border-radius:inherit;">
        <div style="text-align:center;color:rgba(255,255,255,.7);padding:2rem;">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin:0 auto 1rem;display:block;opacity:.4">
            <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
            <path d="M24 20l24 12L24 44V20z" fill="currentColor"/>
          </svg>
          <p style="font-size:1rem;font-weight:500;">Video player would load here</p>
          <p style="font-size:.875rem;opacity:.6;margin-top:.25rem;">Connect a video URL in production</p>
        </div>
      </div>
    `;
  });

  on(placeholder.querySelector('.play-button'), 'keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      placeholder.click();
    }
  });
})();

/* ══════════════════════════════════════════════════
   SMOOTH SCROLL (enhanced)
══════════════════════════════════════════════════ */
(function initSmoothScroll() {
  on(document, 'click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href').slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });

    // Update focus for accessibility
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  });
})();

/* ══════════════════════════════════════════════════
   MICRO-INTERACTIONS
══════════════════════════════════════════════════ */
(function initMicroInteractions() {
  // Ripple on primary buttons
  $$('.btn-primary').forEach(btn => {
    on(btn, 'click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      Object.assign(ripple.style, {
        position: 'absolute',
        width: size + 'px',
        height: size + 'px',
        left: x + 'px',
        top: y + 'px',
        background: 'rgba(255,255,255,.3)',
        borderRadius: '50%',
        transform: 'scale(0)',
        animation: 'ripple .6s ease-out forwards',
        pointerEvents: 'none'
      });

      if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `@keyframes ripple { to { transform: scale(1); opacity: 0; } }`;
        document.head.appendChild(style);
      }

      this.style.position = 'relative';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });

  // Card tilt on mouse move (desktop only)
  if (!window.matchMedia('(max-width: 768px)').matches) {
    $$('.program-card, .stat-card, .involved-card').forEach(card => {
      on(card, 'mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
      });

      on(card, 'mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
})();

/* ══════════════════════════════════════════════════
   TIMELINE SCROLL ANIMATION
══════════════════════════════════════════════════ */
(function initTimeline() {
  const items = $$('.timeline-item');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const dot = entry.target.querySelector('.timeline-dot');
          if (dot) {
            dot.style.animation = `timelinePop .5s ${i * 60}ms cubic-bezier(.34,1.56,.64,1) both`;
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  // Add animation keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes timelinePop {
      from { transform: scale(0) rotate(-30deg); opacity: 0; }
      to   { transform: scale(1) rotate(0deg); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  items.forEach(item => observer.observe(item));
})();

/* ══════════════════════════════════════════════════
   LAZY LOADING IMAGES (future-ready)
══════════════════════════════════════════════════ */
(function initLazyLoad() {
  if (!('IntersectionObserver' in window)) return;

  const lazyImages = $$('img[loading="lazy"], img[data-src]');

  const imageObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    },
    { rootMargin: '200px 0px' }
  );

  lazyImages.forEach(img => imageObserver.observe(img));
})();

/* ══════════════════════════════════════════════════
   KEYBOARD ACCESSIBILITY ENHANCEMENTS
══════════════════════════════════════════════════ */
(function initKeyboardNav() {
  // Add visible focus styles for keyboard users only
  let usingKeyboard = false;

  on(document, 'keydown', e => {
    if (e.key === 'Tab') {
      usingKeyboard = true;
      document.body.classList.add('using-keyboard');
    }
  });

  on(document, 'mousedown', () => {
    usingKeyboard = false;
    document.body.classList.remove('using-keyboard');
  });

  // Ensure gallery items are keyboard accessible
  $$('.gallery-item').forEach(item => {
    if (!item.getAttribute('tabindex')) {
      item.setAttribute('tabindex', '0');
    }
  });

  // Program cards keyboard support
  $$('.program-card').forEach(card => {
    on(card, 'keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = card.querySelector('.program-link');
        if (link) link.click();
      }
    });
  });
})();

/* ══════════════════════════════════════════════════
   INIT COMPLETE
══════════════════════════════════════════════════ */
console.log(
  '%cALLSQUARE%c — Creating Opportunity. Building Stronger Communities.',
  'color:#2563EB;font-weight:800;font-size:1.2rem;',
  'color:#64748B;font-size:.875rem;'
);
