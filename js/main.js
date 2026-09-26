(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Scroll progress bar
  const bar = document.getElementById('progress');
  const onScroll = () => {
    const p = root.scrollTop / Math.max(1, root.scrollHeight - root.clientHeight);
    bar.style.transform = `scaleX(${p})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hero glow follows the cursor
  const hero = document.getElementById('hero');
  const glow = document.getElementById('hero-glow');
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    glow.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px)`;
  });

  // Rotating role word
  const words = ['senior full-stack engineer.', 'Java & Spring engineer.', 'React developer.', 'Azure & microservices engineer.', 'AI-assisted developer.'];
  let roleWord = document.getElementById('role-word');
  let idx = 0;
  if (!reduceMotion) {
    setInterval(() => {
      idx = (idx + 1) % words.length;
      // Swap in a fresh node so the wordIn animation replays
      const next = roleWord.cloneNode(false);
      next.textContent = words[idx];
      roleWord.replaceWith(next);
      roleWord = next;
    }, 2600);
  }

  // Ticker: repeat the items so the -50% marquee loop is seamless
  const track = document.getElementById('ticker-track');
  const items = track.innerHTML;
  track.innerHTML = items.repeat(4);

  // Contact form
  const form = document.getElementById('contact-form');
  const sent = document.getElementById('sent');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      button.disabled = true;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (!res.ok) throw new Error(res.statusText);
      } catch {
        button.disabled = false;
        alert("Sorry, your message couldn't be sent. Please reach out on LinkedIn instead.");
        return;
      }
      button.disabled = false;
    }
    form.reset();
    form.hidden = true;
    sent.hidden = false;
  });
  document.getElementById('send-another').addEventListener('click', () => {
    sent.hidden = true;
    form.hidden = false;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
