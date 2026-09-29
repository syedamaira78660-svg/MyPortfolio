// Dotted globe for the "Flexible with timezones" card.
// Land dots: a 9,000-point Fibonacci sphere; LAND marks which points fall on land
// (built from the public-domain johan/world.geo.json outlines).
(() => {
  const canvas = document.getElementById('globe');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const N = 9000;
  const LAND = 'AAAAAAEJCElCYEISUBAQhMIEZwAwIQHATE4AZDMzCRmOSM9uZsp63tH+/qe397+5/b1vb3/vU1u+/t7+/re1Pb2p7d/vantzU5qf3NTM52clO7mpqczOWmZzE5OdnITc53cvMzkJ+czOXn5yM7OdnJzs52cvOzlp2c7OXnZys7ednKzk52cvOTlZyc7OXnJys7ednKzk5WduOzlZyc7OVnZysxMdnLzk5GYrOTkZyYxMXnLysxUcmIzlZ2crOTkZyo5ORmKyE5UcnIzlZiMnORkJyoxGRmKyk5EYjIzlZicjMTkJicxGVmIyExeYnKTF5iMrMRkJisxGUmLyEZWYjKTFZCMpMXlJis5GUmKyE5ScrKTlZSMpOVlJys5WUnKCkZScpKTlJSMpOUlIys5SUnKClZSUpKTFBSkpOUlIygpSUnKClJQUpKRFJSkoOUlKikpSUDKSlJQUpKFFZSkoCUlKwoJSUDCSlJQErKFBJSkoGUlKggJWUDCQlJQEpKFBASsoCEhKggJSUPCAlZQEJKFBASsoCEFKSgIWUJCAlZQEKKEBAQsoaEFKQgIUUJCAlBQEIKEhAQgoSEBKAgIUUNCAhAUEIKEhQQkISEBKSooUVJCAhIUEICUhQQgKSFBKSoIQFJCghAUUICkhQQgKCFBKSoIQFJCihAUEICkhQQAKCFBQCoIAFBKioAUEACgBQQAKCFFQCoIAFBKgoAUECKgFQQAKCFFQAooEVAKggAUEKKgFQQIqAFBQAoIEVEKioAUAKKgFQUIqAFBRAoCEVEKiogUBKCiFQEIKAFFRAoCEFACiowUBKCiBQEYKAlBRAoCEFADgoxUBKCiBQEYKAlBRAoCEVACiIQUBKCgBQEYKAFBQAoCUFACgIQUAKCgBQEIKAFBQAoCUFACgIQUQKCiBREoKAFAQAooUFACgIQUAKCiBRAoKAFEQAooUFECipQUQKIiBRQoKAFEQAogURECihAUQKIiBRQoCIFEQAogURECihBUQKIiBRAoiIFFACogURECiBREQKKCFRAoiIFFACogUQEKiBREQKKCFRAogIFEDiIgUQEKiBRAQKICERAogIFECiIgUQEKiBRAQKIDERAogIFECiAgUQEIiBRAQKIDEBAogIRECiAgUAGICBQAQCABEBAoAIQECgAgEACACAQAQAABABAIAEAAAgAgEACACAQAQAABABAIAEAAAgAgAACBAAAAIAABAAAAAEAAAAAgAACBAAAAIAABABAAAEAAAAAAAACAAAAAIAAAAAAQAEAAAAAQAAAAAAAAIAAAAAgAAEAAAAAQAAAAAAAAIAAAAAgAAAAAAAAQAAAAAAAAAAAAAAgAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const bytes = Uint8Array.from(atob(LAND), c => c.charCodeAt(0));
  const rad = Math.PI / 180;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dots = [];
  for (let i = 0; i < N; i++) {
    if (!((bytes[i >> 3] >> (7 - (i & 7))) & 1)) continue;
    const y = 1 - (i + 0.5) * 2 / N;
    const lat = Math.asin(y);
    let lon = (i * golden) % (2 * Math.PI);
    if (lon > Math.PI) lon -= 2 * Math.PI;
    dots.push([lat, lon]);
  }

  const home = { name: 'Karachi', lat: 24.86, lon: 67.0 };
  const cities = [
    { name: 'San Francisco', lat: 37.77, lon: -122.42 },
    { name: 'New York', lat: 40.71, lon: -74.0 },
    { name: 'London', lat: 51.51, lon: -0.13 },
    { name: 'Dubai', lat: 25.2, lon: 55.27 },
    { name: 'Singapore', lat: 1.35, lon: 103.82 }
  ];

  const toVec = (lat, lon) => [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
  const fromVec = v => [Math.asin(Math.max(-1, Math.min(1, v[2]))), Math.atan2(v[1], v[0])];

  // Great-circle points from home to each city, lifted off the surface in the middle
  const arcs = cities.map(c => {
    const a = toVec(home.lat * rad, home.lon * rad), b = toVec(c.lat * rad, c.lon * rad);
    const omega = Math.acos(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
    const pts = [];
    for (let s = 0; s <= 64; s++) {
      const t = s / 64;
      const k1 = Math.sin((1 - t) * omega) / Math.sin(omega), k2 = Math.sin(t * omega) / Math.sin(omega);
      const [lat, lon] = fromVec([a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]);
      pts.push([lat, lon, 1 + Math.min(0.1, 0.06 * omega) * Math.sin(Math.PI * t)]);
    }
    return pts;
  });

  const tilt = 18 * rad;
  let lon0 = 30 * rad;
  let w = 0, h = 0, dpr = 1, R = 0, cx = 0, cy = 0;

  function project(lat, lon, lift = 1) {
    const dl = lon - lon0;
    const cl = Math.cos(lat), sl = Math.sin(lat);
    const x = cl * Math.sin(dl);
    const y = Math.cos(tilt) * sl - Math.sin(tilt) * cl * Math.cos(dl);
    const z = Math.sin(tilt) * sl + Math.cos(tilt) * cl * Math.cos(dl);
    return { x: cx + R * lift * x, y: cy - R * lift * y, z, d: lift * Math.hypot(x, y) };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(w * 0.44, 230);
    cx = w / 2; cy = 64 + R;
    draw(performance.now());
  }

  function label(p, text, isHome) {
    ctx.font = '500 10px "JetBrains Mono", monospace';
    const tw = ctx.measureText(text).width;
    const bw = tw + 12, bh = 18, bx = p.x - bw / 2;
    const by = isHome ? p.y + 9 : p.y - bh - 9; // home label sits below its pin so it clears Dubai
    ctx.fillStyle = isHome ? '#f0b44c' : '#f5f1ea';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 3) : ctx.rect(bx, by, bw, bh);
    if (isHome) { ctx.moveTo(p.x - 4, by); ctx.lineTo(p.x, by - 5); ctx.lineTo(p.x + 4, by); }
    else { ctx.moveTo(p.x - 4, by + bh); ctx.lineTo(p.x, by + bh + 5); ctx.lineTo(p.x + 4, by + bh); }
    ctx.fill();
    ctx.fillStyle = '#1c1915';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + 6, by + bh / 2 + 0.5);
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);

    // Sphere body + soft rim glow
    const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, 'rgba(255,245,230,0.06)');
    body.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.shadowColor = 'rgba(255,245,230,0.55)'; ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(255,245,230,0.75)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // Land dots, fading toward the edge
    for (const [lat, lon] of dots) {
      const p = project(lat, lon);
      if (p.z <= 0.02) continue;
      ctx.fillStyle = 'rgba(245,241,234,' + (0.2 + 0.7 * p.z).toFixed(2) + ')';
      const s = 0.9 + 0.8 * p.z;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }

    // Arcs from Karachi, with a travelling spark
    ctx.lineWidth = 1.4;
    arcs.forEach((pts, i) => {
      const proj = pts.map(([lat, lon, lift]) => project(lat, lon, lift));
      const vis = q => q.z > 0 || q.d > 1;
      ctx.strokeStyle = 'rgba(240,180,76,0.85)';
      ctx.beginPath();
      let pen = false;
      for (const q of proj) {
        if (vis(q)) { pen ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); pen = true; } else pen = false;
      }
      ctx.stroke();
      if (!reduceMotion) {
        const t = ((now / 2600) + i * 0.21) % 1;
        const q = proj[Math.floor(t * (proj.length - 1))];
        if (vis(q)) {
          ctx.fillStyle = '#f7a8c8';
          ctx.beginPath(); ctx.arc(q.x, q.y, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      }
    });

    // Pins and labels (back-facing ones hidden)
    const pins = [...cities.map(c => ({ ...c, home: false })), { ...home, home: true }];
    for (const c of pins) {
      const p = project(c.lat * rad, c.lon * rad);
      if (p.z < 0.12) continue;
      ctx.fillStyle = c.home ? '#f0b44c' : '#f5f1ea';
      ctx.beginPath(); ctx.arc(p.x, p.y, c.home ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
      label(p, c.name.toUpperCase(), c.home);
    }
  }

  // Spin slowly, drag to turn; pause while off screen
  let visible = true, dragging = false, lastX = 0, last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last); last = now;
    if (visible) {
      if (!dragging) lon0 -= dt * 0.00012;
      draw(now);
    }
    requestAnimationFrame(frame);
  }
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    lon0 -= (e.clientX - lastX) / R; lastX = e.clientX;
    if (reduceMotion) draw(performance.now());
  });
  const stop = () => { dragging = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  new ResizeObserver(resize).observe(canvas);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  }
  if (document.fonts) document.fonts.ready.then(() => draw(performance.now()));
  if (!reduceMotion) requestAnimationFrame(frame);
})();
