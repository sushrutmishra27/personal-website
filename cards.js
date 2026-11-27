/* ============================================================
   Isometric dot-matrix card scenes — dark stage, green signal.
   Pure canvas, continuous motion. No dependencies.
   ============================================================ */
(function () {
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GREEN = [53, 224, 138];

  // ordered 4x4 Bayer matrix -> halftone density
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function bayer(i, j) { return (BAYER[((i & 3) << 2) + (j & 3)] + 0.5) / 16; }

  // isometric projection. o = {cx, cy, u}
  function iso(o, x, y, z) {
    return [o.cx + (x - y) * o.u, o.cy + (x + y) * o.u * 0.5 - z * o.u];
  }

  function grey(v) { return 'rgba(' + v + ',' + (v + 5) + ',' + (v + 9) + ',1)'; }
  function greenA(a) { return 'rgba(' + GREEN[0] + ',' + GREEN[1] + ',' + GREEN[2] + ',' + a + ')'; }

  /* Draw one dithered isometric box.
     origin grid (ox,oy), footprint w x d, height h.
     cfg: {step, dot, scanZ (for green sweep), greenAll, light} */
  function ditherBox(ctx, o, ox, oy, w, d, h, t, cfg) {
    cfg = cfg || {};
    var step = cfg.step || 0.34, dot = cfg.dot || 1.7;
    var scanZ = cfg.scanZ == null ? -999 : cfg.scanZ;
    var band = cfg.band || 0.7;
    var i, j, a, b, p, bright, tw, near, g, v;

    function pt(x, y, z, base, ia, ib, faceV) {
      tw = 0.86 + 0.14 * Math.sin(t * 0.0026 + ia * 1.9 + ib * 2.7 + (cfg.ph || 0));
      bright = base * tw;
      if (bright < bayer(ia, ib)) return;
      p = iso(o, x, y, z);
      near = Math.abs(z - scanZ);
      if (cfg.greenAll || near < band) {
        g = cfg.greenAll ? 0.85 : (1 - near / band);
        ctx.fillStyle = greenA(0.45 + 0.55 * g);
      } else {
        ctx.fillStyle = grey(faceV);
      }
      ctx.fillRect(p[0] - dot / 2, p[1] - dot / 2, dot, dot);
    }

    // right face (x = ox+w) — darkest
    for (a = 0; a <= d + 1e-6; a += step) for (b = 0; b <= h + 1e-6; b += step) {
      i = Math.round(a / step); j = Math.round(b / step);
      pt(ox + w, oy + a, b, 0.52, i, j, 148);
    }
    // left face (y = oy+d) — mid
    for (a = 0; a <= w + 1e-6; a += step) for (b = 0; b <= h + 1e-6; b += step) {
      i = Math.round(a / step); j = Math.round(b / step);
      pt(ox + a, oy + d, b, 0.74, i, j, 198);
    }
    // top face (z = h) — brightest
    for (a = 0; a <= w + 1e-6; a += step) for (b = 0; b <= d + 1e-6; b += step) {
      i = Math.round(a / step); j = Math.round(b / step);
      pt(ox + a, oy + a * 0 + b, h, 1.0, i, j, 238);
    }
  }

  /* A flat dithered "ground node" (diamond pad) at grid (ox,oy), radius r. */
  function ditherPad(ctx, o, ox, oy, r, t, active, ph) {
    var step = 0.34, dot = 1.6, a, b, i, j, p, d2, base, tw;
    for (a = -r; a <= r + 1e-6; a += step) for (b = -r; b <= r + 1e-6; b += step) {
      d2 = Math.abs(a) + Math.abs(b);
      if (d2 > r) continue;
      i = Math.round(a / step); j = Math.round(b / step);
      tw = 0.78 + 0.22 * Math.sin(t * 0.003 + i * 2.1 + j * 1.7 + (ph || 0));
      base = (1 - d2 / r * 0.5) * tw;
      if (base < bayer(i, j)) continue;
      p = iso(o, ox + a, oy + b, 0);
      if (active && d2 < r * 0.5) ctx.fillStyle = greenA(0.55 + 0.45 * Math.sin(t * 0.004 + ph));
      else ctx.fillStyle = grey(150 + Math.round(70 * (1 - d2 / r)));
      ctx.fillRect(p[0] - dot / 2, p[1] - dot / 2, dot, dot);
    }
  }

  /* connector line in screen space with a traveling green pulse */
  function wire(ctx, p0, p1, t, phase, speed) {
    ctx.strokeStyle = greenA(0.22); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    var k = (((t * (speed || 0.0006)) + phase) % 1 + 1) % 1;
    var px = p0[0] + (p1[0] - p0[0]) * k, py = p0[1] + (p1[1] - p0[1]) * k;
    var r = 7, grd = ctx.createRadialGradient(px, py, 0, px, py, r);
    grd.addColorStop(0, greenA(0.95)); grd.addColorStop(1, greenA(0));
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill();
  }

  /* ---------------- SCENES ---------------- */
  var scenes = {};

  // Bito: two dithered towers, base agent vs AI Architect (taller, green scan)
  scenes.bito = function (ctx, t, W, H) {
    var u = H / 16;
    var oA = { cx: W * 0.355, cy: H * 0.84 + Math.sin(t * 0.0016) * 2.2, u: u };
    ditherBox(ctx, oA, 0, 0, 2.3, 2.3, 3.5, t, { ph: 0 });
    var hB = 5.0, oB = { cx: W * 0.655, cy: H * 0.84 + Math.sin(t * 0.0016 + 1.1) * 2.2, u: u };
    var scanZ = (((t * 0.00020) % 1) + 1) % 1 * (hB + 1.4);
    ditherBox(ctx, oB, 0, 0, 2.3, 2.3, hB, t, { ph: 1.3, scanZ: scanZ, band: 0.9 });
  };

  // Devable: central query node -> 4 channel pads, pulsing wires
  scenes.devable = function (ctx, t, W, H) {
    var u = H / 15;
    var cen = { cx: W * 0.5, cy: H * 0.40 + Math.sin(t * 0.0018) * 2, u: u };
    var pads = [
      { x: W * 0.16, ph: 0.0 }, { x: W * 0.385, ph: 0.25 },
      { x: W * 0.615, ph: 0.5 }, { x: W * 0.84, ph: 0.75 }
    ];
    var cp = iso(cen, 0.7, 0.7, 1.3);
    pads.forEach(function (pd, idx) {
      var o = { cx: pd.x, cy: H * 0.66 + Math.sin(t * 0.0022 + idx) * 1.6, u: u };
      wire(ctx, cp, iso(o, 0, 0, 0.2), t, pd.ph, 0.0007);
    });
    // center node (small box)
    ditherBox(ctx, cen, 0, 0, 1.4, 1.4, 1.3, t, { step: 0.32, dot: 1.6, greenAll: false, ph: 2 });
    pads.forEach(function (pd, idx) {
      var o = { cx: pd.x, cy: H * 0.66 + Math.sin(t * 0.0022 + idx) * 1.6, u: u };
      var active = (Math.floor(t * 0.0007) % 4) === idx;
      ditherPad(ctx, o, 0, 0, 2.5, t, active, idx);
    });
  };

  // Building in public: rising skyline of dithered towers + climbing green signal
  scenes.impressions = function (ctx, t, W, H) {
    var u = H / 17, n = 6;
    var base = H * 0.86, tops = [];
    var heights = [1.4, 2.1, 2.0, 3.0, 4.1, 5.4];
    for (var k = 0; k < n; k++) {
      var o = { cx: W * (0.20 + k * 0.12), cy: base + Math.sin(t * 0.0015 + k * 0.6) * 1.8, u: u };
      var h = heights[k] * (0.96 + 0.04 * Math.sin(t * 0.002 + k));
      var isLast = k === n - 1;
      ditherBox(ctx, o, 0, 0, 1.2, 1.2, h, t, { step: 0.34, dot: 1.6, greenAll: isLast, ph: k });
      tops.push(iso(o, 0.6, 0.6, h));
    }
    // climbing green line across tops with a running pulse
    ctx.strokeStyle = greenA(0.5); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tops[0][0], tops[0][1]);
    for (var m = 1; m < tops.length; m++) ctx.lineTo(tops[m][0], tops[m][1]);
    ctx.stroke();
    var seg = (t * 0.0009) % (tops.length - 1), si = Math.floor(seg), f = seg - si;
    var pa = tops[si], pb = tops[si + 1] || tops[si];
    var px = pa[0] + (pb[0] - pa[0]) * f, py = pa[1] + (pb[1] - pa[1]) * f;
    var grd = ctx.createRadialGradient(px, py, 0, px, py, 8);
    grd.addColorStop(0, greenA(1)); grd.addColorStop(1, greenA(0));
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, 8, 0, 6.2832); ctx.fill();
  };

  // Virtu3D: a dithered product monolith with a green scan, orbiting spark
  scenes.virtu = function (ctx, t, W, H) {
    var u = H / 13;
    var o = { cx: W * 0.5, cy: H * 0.85 + Math.sin(t * 0.0016) * 2.6, u: u };
    var h = 4.6, scanZ = (((t * 0.00022) % 1) + 1) % 1 * (h + 1.3);
    ditherBox(ctx, o, 0, 0, 2.9, 2.9, h, t, { scanZ: scanZ, band: 0.85 });
    // orbiting spark around the top
    var ang = t * 0.0014, top = iso(o, 1.3, 1.3, h);
    var sx = top[0] + Math.cos(ang) * u * 2.4, sy = top[1] + Math.sin(ang) * u * 1.2 - u * 0.6;
    var grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6);
    grd.addColorStop(0, greenA(0.95)); grd.addColorStop(1, greenA(0));
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(sx, sy, 6, 0, 6.2832); ctx.fill();
  };

  // Chirag: ascending dithered towers, last ones green (follower growth loop)
  scenes.chirag = function (ctx, t, W, H) {
    var u = H / 17, n = 6, base = H * 0.86;
    var grow = 0.5 + 0.5 * Math.sin(t * 0.0009 - 1.2); // 0..1 loop
    for (var k = 0; k < n; k++) {
      var o = { cx: W * (0.18 + k * 0.125), cy: base + Math.sin(t * 0.0016 + k * 0.5) * 1.4, u: u };
      var target = 1.1 + k * 0.85;
      var h = target * (0.7 + 0.3 * Math.min(1, grow * (n) - k)); // builds left->right
      if (h < 0.5) h = 0.5;
      var gr = k >= n - 2;
      ditherBox(ctx, o, 0, 0, 1.15, 1.15, h, t, { step: 0.34, dot: 1.6, greenAll: gr, ph: k });
    }
  };

  // Jake: ascending dithered staircase with a green pulse climbing it
  scenes.jake = function (ctx, t, W, H) {
    var u = H / 16, n = 5, base = H * 0.84;
    var tops = [];
    for (var k = 0; k < n; k++) {
      var o = { cx: W * (0.24 + k * 0.13), cy: base + Math.sin(t * 0.0015 + k * 0.7) * 1.3, u: u };
      var h = 0.9 + k * 1.05;
      var lit = (Math.floor(t * 0.0016) % n) === k;
      ditherBox(ctx, o, 0, 0, 1.15, 1.15, h, t, { step: 0.34, dot: 1.6, greenAll: lit, ph: k });
      tops.push(iso(o, 0.58, 0.58, h));
    }
    // arrow signal rising along the steps
    var seg = (t * 0.0011) % (n - 1), si = Math.floor(seg), f = seg - si;
    var pa = tops[si], pb = tops[si + 1] || tops[si];
    var px = pa[0] + (pb[0] - pa[0]) * f, py = pa[1] + (pb[1] - pa[1]) * f;
    var grd = ctx.createRadialGradient(px, py, 0, px, py, 9);
    grd.addColorStop(0, greenA(1)); grd.addColorStop(1, greenA(0));
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, 9, 0, 6.2832); ctx.fill();
  };

  /* ---------------- RUNTIME ---------------- */
  function setup(el) {
    var name = el.getAttribute('data-scene');
    var scene = scenes[name];
    if (!scene) return;
    var canvas = el.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var active = false, raf = 0;

    function resize() {
      var r = el.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function frame(ts) {
      ctx.clearRect(0, 0, W, H);
      scene(ctx, ts, W, H);
      if (active) raf = requestAnimationFrame(frame);
    }
    function start() { if (!active) { active = true; raf = requestAnimationFrame(frame); } }
    function stop() { active = false; cancelAnimationFrame(raf); }

    resize();
    window.addEventListener('resize', function () { resize(); if (!active) frame(performance.now()); });

    if (REDUCE) { frame(1600); return; } // single representative static frame

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.05 });
    io.observe(el);
  }

  function init() {
    document.querySelectorAll('.wc-media.scene[data-scene]').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
