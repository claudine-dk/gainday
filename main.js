/* ═══════════════════════════════════════════════════════════════════
   GAIN DAY · The Lighthouse Church
   ═══════════════════════════════════════════════════════════════════ */

/* Set this to the pledge endpoint (ChurchFunnels, Google Form, or your own
   handler). Until it is set, the form validates but does not submit. */
const FORM_ENDPOINT = null;

const PLEDGE_MONTHS = 24;

/* A single pledge above the whole campaign goal is a typo, not a gift.
   Anything genuinely that large is a conversation, not a web form. */
const CAMPAIGN_GOAL = 5000000;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ── scroll reveals ──────────────────────────────────────────────── */
(() => {
  const targets = $$([
    '.shead', '.lede', '.creed__item', '.play', '.trial', '.stamp',
    '.box', '.dmg li', '.alarm', '.cost li', '.build li', '.vision__side',
    '.scoreboard', '.roi', '.card', '.tiers > li', '.ppp li', '.cardform',
    '.road li', '.qa details', '.final__h', '.final__tag', '.final .btn',
    '.final .kicker', '.slate'
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

/* ── pledge form ─────────────────────────────────────────────────── */
(() => {
  const form = $('#pledgeForm');
  if (!form) return;

  const status = $('#formStatus');
  const submit = $('#submitBtn');
  const amount = $('#f-amount');
  const hint = $('#f-amount-hint');
  const tier = $('#f-tier');
  const nf = new Intl.NumberFormat('en-US');

  const digits = (v) => v.replace(/[^\d]/g, '');

  const showMonthly = () => {
    const n = Number(digits(amount.value));
    if (n > CAMPAIGN_GOAL) {
      hint.innerHTML = 'That is more than the whole campaign goal.';
      return;
    }
    hint.innerHTML = n > 0
      ? `That is about <b>$${nf.format(Math.round(n / PLEDGE_MONTHS))}</b> a month for ${PLEDGE_MONTHS} months.`
      : `That is about <b>$0</b> a month.`;
  };

  amount.addEventListener('input', () => {
    const raw = digits(amount.value);
    amount.value = raw ? nf.format(Number(raw)) : '';
    showMonthly();
  });

  /* one rule per field, so submit and live-recovery share the same source */
  const rules = {
    'f-name':   (v) => v.trim().length >= 2 ? '' : 'Please enter your full name.',
    'f-email':  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    'f-tier':   (v) => v ? '' : 'Please choose a partner tier.',
    'f-amount': (v) => {
      const n = Number(digits(v));
      if (!(n > 0)) return 'Please enter your total pledge amount.';
      if (n > CAMPAIGN_GOAL) return 'That is above the whole campaign goal. Please contact our team to arrange a gift this size.';
      return '';
    }
  };

  const setErr = (field, msg) => {
    const slot = form.querySelector(`.err[data-for="${field.id}"]`);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (slot) slot.textContent = msg || '';
  };

  const validate = () => {
    let firstBad = null, bad = 0;
    for (const id of Object.keys(rules)) {
      const f = document.getElementById(id);
      const msg = rules[id](f.value);
      setErr(f, msg);
      if (msg) { bad += 1; if (!firstBad) firstBad = f; }
    }
    return { firstBad, bad };
  };

  /* once a field has errored, let it clear itself as soon as it is right */
  Object.keys(rules).forEach((id) => {
    const f = document.getElementById(id);
    const recheck = () => {
      if (f.getAttribute('aria-invalid') !== 'true') return;
      const msg = rules[id](f.value);
      if (!msg) setErr(f, '');
    };
    f.addEventListener('input', recheck);
    f.addEventListener('change', recheck);
    f.addEventListener('blur', () => {
      if (f.getAttribute('aria-invalid') === 'true') setErr(f, rules[id](f.value));
    });
  });

  /* a tier row in section 10 preselects itself here */
  document.addEventListener('click', (e) => {
    const row = e.target.closest('.tier[data-tier]');
    if (!row) return;
    const want = row.dataset.tier;
    const opt = [...tier.options].find((o) => o.value === want || o.text === want);
    if (!opt) return;
    tier.value = opt.value;
    setErr(tier, '');
    if (reduced) return;
    tier.classList.remove('is-preset');
    void tier.offsetWidth;
    tier.classList.add('is-preset');
  });

  const setBusy = (on) => {
    submit.disabled = on;
    form.setAttribute('aria-busy', String(on));
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.classList.remove('is-ok');

    /* One polite summary. The per-field detail rides on aria-describedby and is
       announced when focus lands, which avoids four assertive regions colliding. */
    const { firstBad, bad } = validate();
    if (firstBad) {
      status.textContent = bad === 1
        ? 'One field needs your attention.'
        : `${bad} fields need your attention.`;
      firstBad.focus();
      return;
    }

    const payload = {
      name: $('#f-name').value.trim(),
      email: $('#f-email').value.trim(),
      phone: $('#f-phone').value.trim(),
      tier: tier.value,
      amount: Number(digits(amount.value)),
      months: PLEDGE_MONTHS
    };

    if (!FORM_ENDPOINT) {
      status.textContent = 'This form is not connected yet. Your pledge was not submitted.';
      console.warn(
        'GAIN Day: no pledge endpoint configured. Set FORM_ENDPOINT in main.js.\nPayload would have been:',
        payload
      );
      return;
    }

    setBusy(true);
    status.textContent = 'Sending your commitment…';
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      showMonthly();
      Object.keys(rules).forEach((id) => setErr(document.getElementById(id), ''));
      status.classList.add('is-ok');
      status.textContent = 'You are in the GAIN. Thank you.';
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again, or call the church office.';
      console.error('GAIN Day pledge submit failed:', err);
    } finally {
      setBusy(false);
    }
  });

  showMonthly();
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
