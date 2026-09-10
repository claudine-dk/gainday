/* ═══════════════════════════════════════════════════════════════════
   GAIN DAY · The Lighthouse Church

   The pledge form lives at tlhc.org/gain-form, external and already live.
   Every CTA on this page is a plain link there (target="_blank"); there is
   no local form and nothing here submits or validates anything.
   ═══════════════════════════════════════════════════════════════════ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ── scroll reveals ──────────────────────────────────────────────── */
(() => {
  const targets = $$([
    '.shead', '.lede', '.prose', '.play', '.trial', '.stamp',
    '.box', '.cost li', '.build li', '.vision__side', '.miniframes',
    '.scoreboard', '.card', '.leadquote', '.tiers > li', '.ppp li',
    '.commitcard', '.road li', '.qa details', '.final__h', '.final__body',
    '.final__tag', '.final .btn', '.final .kicker', '.slate',
    '.social-strip'
  ].join(','));

  targets.forEach((el) => el.classList.add('reveal'));

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  targets.forEach((el) => io.observe(el));
})();

/* ── number count-up ─────────────────────────────────────────────── */
(() => {
  const nf = new Intl.NumberFormat('en-US');
  const figs = $$('[data-count]');
  if (!figs.length) return;

  const render = (el, v) =>
    (el.textContent = (el.dataset.prefix || '') + nf.format(v) + (el.dataset.suffix || ''));

  if (reduced || !('IntersectionObserver' in window)) return;

  figs.forEach((el) => render(el, 0));

  const run = (el) => {
    const end = Number(el.dataset.count);
    const dur = 1100 + Math.min(600, String(end).length * 90);
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      render(el, Math.round(end * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      run(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  figs.forEach((el) => io.observe(el));
})();

/* ── nav state, drive bar, sticky ask ────────────────────────────── */
(() => {
  const nav = $('#nav');
  const bar = $('.drive__bar');
  const sticky = $('#sticky');
  const hero = $('#hero');
  const final = $('#final');

  /* Geometry is cached, not re-read per frame. scrollHeight / offsetHeight /
     getBoundingClientRect all force synchronous layout, and reading them after
     writing in the same frame costs a full reflow on every scroll tick. */
  let maxScroll = 0, heroTrigger = 0, endTrigger = Infinity, vh = 0;

  const measure = () => {
    vh = window.innerHeight;
    maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    heroTrigger = (hero ? hero.offsetHeight : 600) * 0.85;
    endTrigger = final ? final.offsetTop - vh * 0.85 : Infinity;
  };

  let ticking = false;
  const paint = () => {
    ticking = false;
    const y = window.scrollY;                       // cheap, no layout

    nav.classList.toggle('is-stuck', y > 40);
    if (bar) bar.style.transform = `scaleX(${maxScroll ? Math.min(1, y / maxScroll) : 0})`;

    if (sticky) {
      /* .is-up drives visibility in CSS, which also removes it from the
         tab order once it has slid away. */
      sticky.classList.toggle('is-up', y > heroTrigger && y < endTrigger);
    }
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', () => { measure(); request(); }, { passive: true });

  /* reveals, font swaps and the count-ups all change document height */
  if ('ResizeObserver' in window) {
    let rafId = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { measure(); paint(); });
    }).observe(document.body);
  }
  if (document.fonts) document.fonts.ready.then(() => { measure(); paint(); });

  measure();
  paint();
})();

/* ── mobile drawer ───────────────────────────────────────────────── */
(() => {
  const burger = $('#burger');
  const drawer = $('#drawer');
  if (!burger || !drawer) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.hidden = !open;
  };

  burger.addEventListener('click', () =>
    setOpen(burger.getAttribute('aria-expanded') !== 'true'));

  drawer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      burger.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) setOpen(false);
  });
})();

/* ── scoreboard meter ────────────────────────────────────────────── */
(() => {
  const sb = $('#scoreboard');
  if (!sb) return;
  if (reduced || !('IntersectionObserver' in window)) { sb.classList.add('is-in'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  io.observe(sb);
})();

/* ── anchor offset for the fixed nav ─────────────────────────────── */
(() => {
  const nav = $('#nav');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight || 0) - 8;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    history.pushState(null, '', id);
  });
})();
