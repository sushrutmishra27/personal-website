/* ============================================================
   TIME-AWARE STATUS  —  uses MY (host's) local time, not visitor's.
   Change HOST_TZ to your timezone (IANA name).
   ============================================================ */
const HOST_TZ = 'Asia/Kolkata';   // <-- your home timezone

function hostTime() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: HOST_TZ, weekday: 'short', hour: 'numeric', hour12: false
  }).formatToParts(new Date());
  const hour = (+parts.find(p => p.type === 'hour').value) % 24;
  const dayMap = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  const day = dayMap[parts.find(p => p.type === 'weekday').value];
  return { hour, day };
}

// Day/time-aware headline (host's local time) — different on weekends and at different times
function getHeadline({ hour: h, day }) {
  const weekend = (day === 0 || day === 6);
  if (h >= 23 || h < 6)   return "It's late, but I'm scrolling for ideas. Shhh!";
  if (weekend)            return "It's the weekend, recharging for today.";
  if (h < 9)              return "Just getting started, coffee first.";
  if (h >= 13 && h < 14)  return "Out for lunch, back soon.";
  if (h >= 18)            return "Winding down, maybe writing.";
  return "Heads down, building right now.";
}

function renderStatus() {
  const headline = document.getElementById('headline');
  if (!headline) return;
  headline.textContent = getHeadline(hostTime());
}
renderStatus();
setInterval(renderStatus, 60 * 1000);

/* ---- theme toggle (light / dark / auto) — all monochrome ---- */
const html = document.documentElement;
const toggle = document.getElementById('themeToggle');
const media = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(mode) {
  if (mode === 'auto') html.setAttribute('data-theme', media.matches ? 'dark' : 'light');
  else html.setAttribute('data-theme', mode);
  localStorage.setItem('theme-mode', mode);
  if (toggle) toggle.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.themeSet === mode));
}
if (toggle) toggle.addEventListener('click', e => { if (e.target.dataset.themeSet) applyTheme(e.target.dataset.themeSet); });
media.addEventListener('change', () => { if (localStorage.getItem('theme-mode') === 'auto') applyTheme('auto'); });
applyTheme(localStorage.getItem('theme-mode') || 'light');

/* ---- mobile menu ---- */
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  sidebar.querySelectorAll('.nav-item').forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));
}

/* ---- scroll reveal ---- */
document.querySelectorAll('section').forEach(s => s.classList.add('reveal'));
const rev = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } });
}, { threshold: 0.06 });
document.querySelectorAll('.reveal').forEach(s => rev.observe(s));

/* ---- contact modal: injected once, opened from nav Contact / key 9 ---- */
(function contactModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'contactModal';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Contact">
      <button class="modal-close" type="button" aria-label="Close">&times;</button>
      <div class="section-head"><h2>Contact</h2></div>
      <p class="contact-time js-localtime">My local time: loading…</p>
      <div class="contact-row">
        <div class="cr-body"><h3>Email</h3><p>Always happy to help.</p></div>
        <div class="cr-actions">
          <a class="cbtn" href="mailto:sushrutmishra27@gmail.com"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> Compose</a>
          <button class="cbtn" type="button" data-copy="sushrutmishra27@gmail.com"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg> <span class="clabel">Copy</span></button>
        </div>
      </div>
      <div class="contact-row">
        <div class="cr-body"><h3>Developer Turned Marketer</h3><p>My newsletter, 550+ subscribers, on marketing, content, and the dev-to-marketing life.</p></div>
        <div class="cr-actions">
          <a class="cbtn" href="https://sushrut27.substack.com/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg> Subscribe</a>
        </div>
      </div>
      <div class="contact-row">
        <div class="cr-body"><h3>Stay in touch</h3><p>I'm most responsive on LinkedIn.</p></div>
        <div class="cr-socials">
          <a href="https://x.com/SushrutKM" target="_blank" rel="noopener"><span class="sicon x"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 3l7 8.5L3.5 21H6l5.2-6.3L16 21h5l-7.4-9L20.5 3H18l-4.8 5.8L8.8 3z"/></svg></span> X</a>
          <a href="https://www.linkedin.com/in/sushrutkm/" target="_blank" rel="noopener"><span class="sicon li"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M4.5 3.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM3 8.2h3V20H3zM9 8.2h2.85v1.6h.04c.4-.74 1.45-1.52 2.98-1.52 3.2 0 3.78 2.06 3.78 4.74V20h-3v-5.2c0-1.24-.02-2.84-1.74-2.84-1.74 0-2 1.35-2 2.75V20H9z"/></svg></span> LinkedIn</a>
          <a href="https://github.com/sushrutmishra27" target="_blank" rel="noopener"><span class="sicon gh"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.2-.2-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.3 4.8-4.5 5 .3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg></span> GitHub</a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const open = () => { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); };
  const close = () => { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); };
  window.openContact = open;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('.modal-close').addEventListener('click', close);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // any nav item that points at the email opens the modal instead
  document.querySelectorAll('.nav-item').forEach(a => {
    if ((a.getAttribute('href') || '').startsWith('mailto:')) {
      a.addEventListener('click', e => { e.preventDefault(); open(); });
    }
  });
})();

/* ---- press number keys 1–9 to jump between pages (9 = open contact) ---- */
const navItems = [...document.querySelectorAll('.nav-item')];
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const item = navItems.find(n => n.querySelector('.num')?.textContent === '0' + e.key);
  if (!item) return;
  const href = item.getAttribute('href') || '';
  if (href.startsWith('mailto:')) { if (window.openContact) window.openContact(); }
  else window.location.href = href;
});

/* ---- contact: host local time + copy email (works on page + modal) ---- */
(function contactBits() {
  function fmtTime() {
    const s = new Intl.DateTimeFormat('en-US', { timeZone: HOST_TZ, hour: 'numeric', minute: '2-digit', hour12: true })
      .format(new Date());
    const txt = 'My local time: ' + s.replace(' ', '').toLowerCase();
    document.querySelectorAll('.js-localtime').forEach(el => el.textContent = txt);
  }
  fmtTime();
  setInterval(fmtTime, 30 * 1000);

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const val = btn.getAttribute('data-copy');
      if (navigator.clipboard) navigator.clipboard.writeText(val);
      const label = btn.querySelector('.clabel');
      if (label) { const old = label.textContent; label.textContent = 'Copied'; setTimeout(() => label.textContent = old, 1500); }
    });
  });
})();

/* ---- GitHub contribution-graph graphic (projects page) ---- */
(function buildGitHubGraph() {
  const el = document.getElementById('ghGraph');
  if (!el) return;
  const cols = 19, rows = 7, cell = 12, gap = 4, step = cell + gap, W = 320, H = 180;
  const gridW = cols * step - gap, gridH = rows * step - gap;
  const ox = (W - gridW) / 2, oy = (H - gridH) / 2;
  const shades = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']; // GitHub dark palette
  let cells = '';
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // deterministic pseudo-random intensity, weighted toward fewer commits
      const n = Math.abs(Math.sin((c + 1) * 12.9898 + (r + 1) * 78.233) * 43758.5453);
      const f = n - Math.floor(n);
      let lvl = 0;
      if (f > 0.50) lvl = 1;
      if (f > 0.70) lvl = 2;
      if (f > 0.85) lvl = 3;
      if (f > 0.94) lvl = 4;
      const x = (ox + c * step).toFixed(1), y = (oy + r * step).toFixed(1);
      cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${shades[lvl]}"/>`;
    }
  }
  el.innerHTML = `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#0d1117"/>${cells}</svg>`;
})();
