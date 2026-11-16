/* ==========================================================================
   TRUE MOMENT MEDIA — booking.js
   Booking + contact form validation, unique booking references,
   LocalStorage demo persistence, saved-enquiry viewer.

   IMPORTANT: LocalStorage is a FRONTEND DEMONSTRATION ONLY. Nothing is
   sent to a server. For real bookings, connect these forms to a secure
   backend, database or email service (see README.md).
   ========================================================================== */
'use strict';

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const toast = msg => { if (window.TMM && window.TMM.toast) window.TMM.toast(msg); };

  const KEY_BOOKINGS = 'tmm_bookings';
  const KEY_CONTACT = 'tmm_contact_messages';

  /* ---------- Safe LocalStorage wrapper (private mode / quota safe) ---------- */
  const storage = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
      catch (err) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (err) { return false; }
    },
    remove(key) { try { localStorage.removeItem(key); } catch (err) { /* ignore */ } }
  };

  /* ---------- Validators ---------- */
  const validators = {
    required: v => v.trim().length > 0,
    name: v => v.trim().length >= 2,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: v => /^\+?[0-9]{7,15}$/.test(v.replace(/[\s\-().]/g, '')),
    date: v => {
      if (!v) return false;
      const d = new Date(v + 'T00:00:00');
      if (Number.isNaN(d.getTime())) return false;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return d >= today;
    }
  };

  function setError(field, message) {
    const wrap = field.closest('.form-field');
    const err = wrap ? wrap.querySelector('.field-error') : null;
    if (wrap) wrap.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    if (err) err.textContent = message;
  }
  function clearError(field) {
    const wrap = field.closest('.form-field');
    const err = wrap ? wrap.querySelector('.field-error') : null;
    if (wrap) wrap.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    if (err) err.textContent = '';
  }
  function validateField(field, rules) {
    for (const [rule, message] of rules) {
      if (!validators[rule](field.value)) { setError(field, message); return false; }
    }
    clearError(field);
    return true;
  }
  function attachLiveValidation(fields) {
    Object.values(fields).forEach(({ el, rules }) => {
      el.addEventListener('blur', () => validateField(el, rules));
      const revalidate = () => {
        if (el.closest('.form-field').classList.contains('has-error')) validateField(el, rules);
      };
      el.addEventListener('input', revalidate);
      el.addEventListener('change', revalidate);
    });
  }
  function validateAll(fields) {
    let firstInvalid = null;
    let ok = true;
    Object.values(fields).forEach(({ el, rules }) => {
      const valid = validateField(el, rules);
      if (!valid && !firstInvalid) firstInvalid = el;
      ok = ok && valid;
    });
    return { ok, firstInvalid };
  }

  /* ---------- Unique booking reference: TMM-YYYYMMDD-XXXX ---------- */
  function generateRef(existingRefs) {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
    let ref;
    do {
      const bytes = new Uint8Array(4);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
      else for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
      const suffix = Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
      ref = `TMM-${ymd}-${suffix}`;
    } while (existingRefs.has(ref));
    return ref;
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    try {
      return d.toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (err) {
      return iso;
    }
  }

  /* ==================================================================
     BOOKING FORM
  ================================================================== */
  const bookingForm = $('#bookingForm');
  if (bookingForm) {
    const fields = {
      fullName:      { el: $('#fullName'),      rules: [['name', 'Please enter your full name (at least 2 characters).']] },
      phone:         { el: $('#phone'),         rules: [['required', 'Please enter your phone number.'], ['phone', 'Enter a valid phone number, e.g. +234 801 234 5678.']] },
      email:         { el: $('#email'),         rules: [['required', 'Please enter your email address.'], ['email', 'Enter a valid email address, e.g. you@example.com.']] },
      eventType:     { el: $('#eventType'),     rules: [['required', 'Please select the type of event or project.']] },
      eventDate:     { el: $('#eventDate'),     rules: [['required', 'Please choose your event date.'], ['date', 'Choose a valid date — today or a future date.']] },
      eventLocation: { el: $('#eventLocation'), rules: [['required', 'Please tell us the event location.'], ['name', 'Please enter a valid location (at least 2 characters).']] }
    };

    /* Date input: no past dates, cap at 5 years ahead */
    const dateEl = $('#eventDate');
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    dateEl.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    dateEl.max = `${today.getFullYear() + 5}-12-31`;

    attachLiveValidation(fields);

    const successBox = $('#bookingSuccess');
    const submitBtn = $('#bookingSubmit');

    bookingForm.addEventListener('submit', e => {
      e.preventDefault();

      /* Honeypot: silently ignore bot submissions */
      if ($('#company').value.trim() !== '') return;

      const { ok, firstInvalid } = validateAll(fields);
      if (!ok) {
        toast('Please fix the highlighted fields and try again.');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'SUBMITTING…';

      const bookings = storage.get(KEY_BOOKINGS, []);
      const ref = generateRef(new Set(bookings.map(b => b.ref)));
      const record = {
        ref,
        fullName: $('#fullName').value.trim(),
        phone: $('#phone').value.trim(),
        email: $('#email').value.trim(),
        eventType: $('#eventType').value,
        package: $('#package').value || 'To be advised',
        eventDate: $('#eventDate').value,
        eventLocation: $('#eventLocation').value.trim(),
        message: $('#message').value.trim(),
        createdAt: new Date().toISOString()
      };
      bookings.push(record);
      const saved = storage.set(KEY_BOOKINGS, bookings);

      /* Render confirmation */
      $('#successName').textContent = record.fullName;
      $('#bookingRef').textContent = ref;
      const summary = $('#successSummary');
      summary.innerHTML = '';
      [['Event', record.eventType], ['Date', formatDate(record.eventDate)],
       ['Location', record.eventLocation], ['Package', record.package]].forEach(([label, value]) => {
        const dt = document.createElement('dt'); dt.textContent = label;
        const dd = document.createElement('dd'); dd.textContent = value;
        summary.append(dt, dd);
      });

      bookingForm.hidden = true;
      successBox.hidden = false;
      updateSavedCount();
      toast(saved ? `Booking received! Reference: ${ref}` : 'Booking received (could not persist — storage unavailable).');
      if (!saved) $('.demo-note-small', successBox).textContent =
        'Demo note: your browser blocked LocalStorage, so this request was not saved. Connect a backend for real bookings.';

      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT BOOKING REQUEST';
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    $('#bookAnother').addEventListener('click', () => {
      bookingForm.reset();
      Object.values(fields).forEach(({ el }) => clearError(el));
      successBox.hidden = true;
      bookingForm.hidden = false;
      $('#fullName').focus();
    });
  }

  /* ---------- Saved demo enquiries viewer ---------- */
  const viewSaved = $('#viewSaved');
  const savedPanel = $('#savedPanel');
  const savedList = $('#savedList');
  const savedCount = $('#savedCount');
  const clearSaved = $('#clearSaved');

  const getBookings = () => storage.get(KEY_BOOKINGS, []);
  function updateSavedCount() { if (savedCount) savedCount.textContent = String(getBookings().length); }

  function renderSaved() {
    if (!savedList) return;
    const list = getBookings();
    savedList.innerHTML = '';
    if (!list.length) {
      const li = document.createElement('li');
      li.className = 'saved-empty';
      li.textContent = 'No demo enquiries saved yet.';
      savedList.appendChild(li);
      return;
    }
    list.slice().reverse().forEach(b => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = b.ref;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(` ${b.fullName} · ${b.eventType} · ${formatDate(b.eventDate)}`));
      savedList.appendChild(li);
    });
  }

  if (viewSaved && savedPanel) {
    viewSaved.addEventListener('click', () => {
      const open = viewSaved.getAttribute('aria-expanded') === 'true';
      viewSaved.setAttribute('aria-expanded', String(!open));
      savedPanel.hidden = open;
      if (!open) renderSaved();
    });
  }
  if (clearSaved) {
    clearSaved.addEventListener('click', () => {
      if (window.confirm('Clear all demo booking data stored in this browser?')) {
        storage.remove(KEY_BOOKINGS);
        updateSavedCount();
        renderSaved();
        toast('Demo booking data cleared.');
      }
    });
  }
  updateSavedCount();

  /* ==================================================================
     CONTACT FORM
  ================================================================== */
  const contactForm = $('#contactForm');
  if (contactForm) {
    const fields = {
      contactName:    { el: $('#contactName'),    rules: [['name', 'Please enter your name.']] },
      contactEmail:   { el: $('#contactEmail'),   rules: [['required', 'Please enter your email address.'], ['email', 'Enter a valid email address.']] },
      contactSubject: { el: $('#contactSubject'), rules: [['required', 'Please enter a subject.']] },
      contactMessage: { el: $('#contactMessage'), rules: [['required', 'Please enter your message.']] }
    };
    attachLiveValidation(fields);
    const status = $('#contactStatus');

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const { ok, firstInvalid } = validateAll(fields);
      if (!ok) {
        status.textContent = 'Please complete the highlighted fields.';
        status.classList.add('is-error');
        toast('Please fix the highlighted fields.');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const messages = storage.get(KEY_CONTACT, []);
      messages.push({
        name: $('#contactName').value.trim(),
        email: $('#contactEmail').value.trim(),
        subject: $('#contactSubject').value.trim(),
        message: $('#contactMessage').value.trim(),
        createdAt: new Date().toISOString()
      });
      storage.set(KEY_CONTACT, messages);

      status.textContent = `Thank you, ${$('#contactName').value.trim()}! Your message has been saved (demo). We'll be in touch.`;
      status.classList.remove('is-error');
      contactForm.reset();
      Object.values(fields).forEach(({ el }) => clearError(el));
      toast('Message sent (demo — stored in your browser).');
    });
  }
})();
