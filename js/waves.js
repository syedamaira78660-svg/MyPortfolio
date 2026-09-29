// Hero background: bundles of thin glowing lines that drift like silk ribbons,
// plus the surname swapping between solid and outline.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Surname: solid with glow <-> outline
  const swap = document.getElementById('name-swap');
  if (swap && !reduceMotion) setInterval(() => swap.classList.toggle('outline'), 3200);

  const canvas = document.getElementById('hero-waves');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, visible = true;

  // Two ribbons, each a bundle of lines that share a path but fan out
  const ribbons = [
    { lines: 46, spread: 230, y: 0.78, amp: 0.26, freq: 1.5, speed: 0.00016, phase: 0, tilt: -0.55 },
    { lines: 34, spread: 170, y: 0.18, amp: 0.2, freq: 1.2, speed: -0.00012, phase: 2.1, tilt: 0.35 }
  ];

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgb(240,180,76)');   // amber
    grad.addColorStop(1, 'rgb(240,140,190)');  // pink
    ctx.strokeStyle = grad;
    const steps = Math.max(40, Math.round(w / 14));

    for (const rb of ribbons) {
      const time = t * rb.speed;
      for (let i = 0; i < rb.lines; i++) {
        const k = i / (rb.lines - 1) - 0.5;          // -0.5 .. 0.5 across the bundle
        const core = 1 - Math.abs(k) * 2;            // brightest in the middle
        ctx.globalAlpha = 0.1 + 0.75 * core * core;
        ctx.lineWidth = 0.7 + 0.9 * core;
        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const x = u * w;
          // Shared path, with each line twisting slightly differently so the bundle pinches and flares
          const wave = Math.sin(u * Math.PI * rb.freq + time + rb.phase)
                     + 0.45 * Math.sin(u * Math.PI * rb.freq * 2.3 - time * 1.4 + rb.phase);
          const twist = Math.sin(u * Math.PI * 2 + time * 0.8 + rb.phase) * 0.6 + 0.9;
          const y = h * rb.y + (u - 0.5) * h * rb.tilt + wave * h * rb.amp * 0.5
                  + k * rb.spread * twist;
          s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(t) {
    if (visible) draw(t);
    requestAnimationFrame(frame);
  }

  new ResizeObserver(resize).observe(canvas);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  }
  if (!reduceMotion) requestAnimationFrame(frame);
})();
