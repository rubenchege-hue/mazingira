/* ════════════════════════════════════════════════════════════
   Mazingira — Shared Animation Module
   All ESG & Green Finance files import this.
   ════════════════════════════════════════════════════════════ */

// ── COUNTER ANIMATION ─────────────────────────────────────
function animateCounter(el, target, duration) {
  if (!duration) duration = 800;
  el.dataset.animated = 'true';
  var start = 0;
  var startTime = performance.now();
  var suffix = el.textContent.includes('%') ? '%' : (el.textContent.match(/[^0-9.,\s]+/) || [''])[0];
  function step(timestamp) {
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(start + (target - start) * eased);
    el.textContent = current + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + suffix;
    }
  }
  requestAnimationFrame(step);
}

// ── BUTTON RIPPLE EFFECT ──────────────────────────────────
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.btn, .act-btn, .filter-btn');
  if (!btn) return;
  var rect = btn.getBoundingClientRect();
  var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
  var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
  btn.style.setProperty('--rx', x + '%');
  btn.style.setProperty('--ry', y + '%');
});

// ── SCROLL-TRIGGERED REVEALS ──────────────────────────────
function initRevealObserver() {
  var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');
  if (!els.length) return;
  if (window.revealObserver) window.revealObserver.disconnect();
  window.revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        window.revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function(el) { window.revealObserver.observe(el); });
}

// Init reveals on page load
setTimeout(initRevealObserver, 400);
