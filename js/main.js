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

  // Tools strip in the "Uses" card: same seamless-loop trick
  const usesTrack = document.getElementById('uses-track');
  if (usesTrack) usesTrack.innerHTML = usesTrack.innerHTML.repeat(2);

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

  // Testimonials carousel: centered cards, dots, autoplay with pause
  const ttrack = document.getElementById('ttrack');
  if (ttrack) {
    const cards = [...ttrack.children];
    const dotsBox = document.getElementById('tdots');
    const pauseBtn = document.getElementById('tpause');
    let current = 0, timer = null, paused = reduceMotion;

    const dots = cards.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button'; d.className = 'tdot'; d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `Testimonial ${i + 1}`);
      d.addEventListener('click', () => { go(i); restart(); });
      dotsBox.appendChild(d);
      return d;
    });

    const mark = i => {
      current = i;
      cards.forEach((c, j) => c.classList.toggle('active', j === i));
      dots.forEach((d, j) => d.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    };
    const go = i => {
      const c = cards[i];
      ttrack.scrollTo({ left: c.offsetLeft - (ttrack.clientWidth - c.offsetWidth) / 2 });
      mark(i);
    };

    // Keep the active card in sync when the visitor swipes or scrolls
    let raf = 0;
    ttrack.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = ttrack.scrollLeft + ttrack.clientWidth / 2;
        let best = 0, bestD = Infinity;
        cards.forEach((c, j) => {
          const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
          if (d < bestD) { bestD = d; best = j; }
        });
        if (best !== current) mark(best);
      });
    }, { passive: true });

    const restart = () => {
      clearInterval(timer);
      if (!paused) timer = setInterval(() => go((current + 1) % cards.length), 5000);
    };
    const setPaused = p => {
      paused = p;
      pauseBtn.classList.toggle('paused', p);
      pauseBtn.setAttribute('aria-label', p ? 'Play testimonials' : 'Pause testimonials');
      restart();
    };
    pauseBtn.addEventListener('click', () => setPaused(!paused));
    ttrack.addEventListener('pointerdown', () => setPaused(true));
    ttrack.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { go(Math.min(cards.length - 1, current + 1)); setPaused(true); }
      if (e.key === 'ArrowLeft') { go(Math.max(0, current - 1)); setPaused(true); }
    });

    // Start on the first card without the smooth-scroll animation
    ttrack.style.scrollBehavior = 'auto';
    go(0);
    ttrack.style.scrollBehavior = '';
    setPaused(paused);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
