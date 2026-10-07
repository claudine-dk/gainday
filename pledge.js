/* ═══════════════════════════════════════════════════════════════════
   GAIN pledge form (gainjourney.org/pledge)

   Posts the same JSON the original tlhc.org/gain-form posted, to the same
   TLHC endpoint, via the same-origin rewrite in vercel.json:
     /api/gain-day-pledge -> https://www.tlhc.org/api/gain-day-pledge
   The TLHC server sends the emails to gaincommitments@tlhc.org, so nothing
   about email delivery lives in this repo. Payload keys must stay exactly:
   fullName, spouseName, email, phone, pledgeType, pledgeAmount,
   firstGiftDate, leadGiftAmount, notes, committed.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  const form = document.getElementById('pledge');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const err = $('pledge-error');
  const btn = $('pledge-submit');

  const COPY = {
    monthly: {
      label: 'Our monthly pledge amount (USD)',
      hint: 'Over the next 2 years, above our tithes and offerings, our family is committing this amount per month. (Enter a number, e.g. 10000)'
    },
    'two-year-total': {
      label: 'Our 2-year total pledge amount (USD)',
      hint: 'Over the next 2 years, above our tithes and offerings, our family is committing to this total amount. Gifts may not be on a fixed monthly schedule. (Enter a number, e.g. 10000)'
    }
  };

  const type = () => form.querySelector('input[name="pledgeType"]:checked').value;

  form.addEventListener('change', (e) => {
    if (e.target.name !== 'pledgeType') return;
    $('pledgeAmount-l').textContent = COPY[type()].label;
    $('pledgeAmount-h').textContent = COPY[type()].hint;
  });

  const show = (msg, focusEl) => {
    err.textContent = msg;
    err.hidden = false;
    if (focusEl) focusEl.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;

    if (!$('committed').checked) {
      return show('Please check the commitment box to continue.', $('committed'));
    }
    const bad = Array.from(form.querySelectorAll('[required]'))
      .find((el) => el.type !== 'checkbox' && !el.checkValidity());
    if (bad) {
      bad.reportValidity();
      return;
    }

    const v = (id) => $(id).value.trim();
    const body = {
      fullName: v('fullName'),
      spouseName: v('spouseName'),
      email: v('email'),
      phone: v('phone'),
      pledgeType: type(),
      pledgeAmount: v('pledgeAmount'),
      firstGiftDate: v('firstGiftDate'),
      leadGiftAmount: v('leadGiftAmount'),
      notes: v('notes'),
      committed: true
    };

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch('/api/gain-day-pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        let m = 'Please try again.';
        try { m = (await res.json()).error || m; } catch (_) {}
        return show('Something went wrong. ' + m);
      }
      form.hidden = true;
      $('pledge-intro').hidden = true;
      const t = $('pledge-thanks');
      t.hidden = false;
      t.focus();
      window.scrollTo({ top: 0 });
    } catch (_) {
      show('An error occurred. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();
