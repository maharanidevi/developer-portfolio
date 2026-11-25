/* Portfolio interactions: vanilla JS, no dependencies */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Page loader, then start hero animation
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#loader').classList.add('done');
      document.body.classList.add('ready');
    }, reduce ? 0 : 700);
  });

  // Typing effect for the role line
  const roles = ['Next.js & React', 'React Native apps', 'Django & REST APIs', 'SQL databases'];
  const typed = $('#typed');
  if (reduce) typed.textContent = roles[0];
  else {
    let r = 0, c = 0, del = false;
    (function tick() {
      const word = roles[r];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
      if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 40 : 80);
    })();
  }

  // Scroll reveal with small stagger between siblings
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const sibs = [...e.target.parentElement.children].filter((n) => n.classList.contains('reveal'));
        e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 5) * 80 + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  // Nav: solid background, active pill, mobile menu
  const nav = $('#nav'), menu = $('#menu'), pill = $('#pill'), burger = $('#burger');
  const links = $$('a', menu);
  const movePill = (a) => {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.left = a.offsetLeft + 'px';
    pill.style.width = a.offsetWidth + 'px';
  };
  const sections = links.map((a) => $(a.getAttribute('href')));
  function onScroll() {
    nav.classList.toggle('solid', scrollY > 40);
    $('#top').classList.toggle('show', scrollY > 600);
    let current = null;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = links[i]; });
    links.forEach((a) => a.classList.toggle('active', a === current));
    movePill(current);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  links.forEach((a) => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));
  $('#top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  // Desktop cursor + magnetic buttons
  const cursor = $('#cursor');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    addEventListener('mousemove', (e) => { cursor.style.transform = `translate(${e.clientX - 7}px, ${e.clientY - 7}px)`; });
    $$('a, button, .proj').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
    $$('.magnetic').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  // Contact form validation (opens the visitor's email app; no backend needed)
  const form = $('#form'), status = $('#status');
  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Enter your name (2+ characters).'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.'),
    message: (v) => (v.trim().length >= 10 ? '' : 'Write at least 10 characters.'),
  };
  const check = (f) => {
    const msg = rules[f.name](f.value);
    f.classList.toggle('bad', !!msg);
    f.parentElement.querySelector('small').textContent = msg;
    return !msg;
  };
  $$('input, textarea', form).forEach((f) => f.addEventListener('blur', () => check(f)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = $$('input, textarea', form).map(check).every(Boolean);
    if (!ok) { status.textContent = 'Fix the highlighted fields and send again.'; return; }
    const d = Object.fromEntries(new FormData(form));
    const body = encodeURIComponent(`${d.message}\n\nFrom: ${d.name} (${d.email})`);
    location.href = `mailto:devisivasankar250@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + d.name)}&body=${body}`;
    status.textContent = 'Opening your email app with the message ready to send.';
    form.reset();
  });

  // Scroll progress, hero parallax, timeline line
  const bar = $('#progress'), giant = $('#giant'), tl = $('.timeline');
  function onScrollFx() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (!reduce && scrollY < innerHeight) giant.style.transform = `translateY(${scrollY * 0.28}px)`;
    const r = tl.getBoundingClientRect();
    tl.style.setProperty('--prog', Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height)));
  }
  addEventListener('scroll', onScrollFx, { passive: true });
  onScrollFx();

  // Hero mouse parallax (desktop)
  const hero = $('#home');
  if (!reduce && matchMedia('(hover:hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      hero.style.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
      hero.style.setProperty('--py', (e.clientY / innerHeight - 0.5).toFixed(3));
    });
  }

  // Count-up numbers in the hero stats
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    setTimeout(() => {
      const t0 = performance.now();
      (function step(t) {
        const k = Math.min(1, (t - t0) / 1200);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }, 1300);
  });

  // 3D tilt + spotlight on cards
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.card, .proj').forEach((el) => {
      el.addEventListener('mouseenter', () => { el.style.transitionDelay = '0ms'; el.classList.add('tilting'); });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; el.classList.remove('tilting'); });
    });
  }

  $('#year').textContent = new Date().getFullYear();
})();
