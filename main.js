(function () {
  // ---------- Mobile navigation ----------
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setOpen(false);
    });
  }

  // ---------- Contact form ----------
  var form = document.querySelector('[data-enquiry]');
  if (!form) return;
  var sent = document.querySelector('[data-sent]');
  var again = document.querySelector('[data-again]');
  var error = form.querySelector('[data-error]');
  var hidden = form.querySelector('input[name="challenges"]');
  var chips = form.querySelectorAll('.choice button');

  var syncChips = function () {
    var picked = [];
    chips.forEach(function (b) { if (b.getAttribute('aria-pressed') === 'true') picked.push(b.textContent.trim()); });
    hidden.value = picked.join(', ');
  };
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      syncChips();
    });
  });

  var showSent = function () {
    form.hidden = true;
    sent.hidden = false;
    sent.querySelector('h2').focus();
  };
  var showError = function (msg) {
    error.textContent = msg;
    error.hidden = false;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    error.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    syncChips();

    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var email = (form.getAttribute('data-email') || '').trim();
    var data = new FormData(form);

    if (endpoint) {
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('bad status'); showSent(); form.reset(); chips.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); })
        .catch(function () { showError('Something went wrong. Please try again.'); })
        .then(function () { btn.disabled = false; });
      return;
    }

    if (email && email.indexOf('@') > 0) {
      var body = [
        'Name: ' + data.get('name'),
        'Company: ' + data.get('company'),
        'Email: ' + data.get('email'),
        'Website: ' + data.get('website'),
        'Challenges: ' + data.get('challenges'),
        '',
        data.get('message')
      ].join('\n');
      window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Business enquiry — ' + data.get('company')) + '&body=' + encodeURIComponent(body);
      showSent();
      return;
    }

    showError('Sorry — the form isn’t working right now. Please try again later.');
  });

  if (again) {
    again.addEventListener('click', function () {
      sent.hidden = true;
      form.hidden = false;
    });
  }
})();
