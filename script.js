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

/* ---- press number keys 1–9 to jump between pages ---- */
const navItems = [...document.querySelectorAll('.nav-item')];
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const item = navItems.find(n => n.querySelector('.num')?.textContent === '0' + e.key);
  if (item) window.location.href = item.getAttribute('href');
});
