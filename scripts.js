// scripts.js

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ======= THEME TOGGLE =======
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'theme';

const getTheme = () => {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
};

const applyTheme = (mode) => {
  root.classList.toggle('dark', mode === 'dark');
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    themeToggle.setAttribute('title', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
};

const setTheme = (mode) => {
  applyTheme(mode);
  try { localStorage.setItem(THEME_KEY, mode); } catch {}
};

applyTheme(getTheme() || 'dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(root.classList.contains('dark') ? 'light' : 'dark');
  });
}

// ======= SMOOTH ANCHOR SCROLL =======
const easeInOutQuart = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

const smoothScrollTo = (targetEl) => {
  if (reduceMotion.matches) {
    targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
    return;
  }

  const startY = window.scrollY;
  const scrollOffset = parseFloat(getComputedStyle(targetEl).scrollMarginTop) || 0;
  const targetY = targetEl.getBoundingClientRect().top + startY - scrollOffset;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) return;

  const duration = Math.min(700, Math.max(350, Math.abs(distance) * 0.45));
  const start = performance.now();
  let cancelled = false;

  const cancel = () => { cancelled = true; };
  window.addEventListener('wheel', cancel, { passive: true, once: true });
  window.addEventListener('touchmove', cancel, { passive: true, once: true });

  const step = (now) => {
    if (cancelled) return;
    const progress = Math.min((now - start) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuart(progress));
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (hash.length <= 1) return;
    const targetEl = document.querySelector(hash);
    if (!targetEl) return;
    event.preventDefault();
    smoothScrollTo(targetEl);
    history.replaceState(null, '', hash);
  });
});

// ======= SCROLL REVEAL =======
const revealEls = document.querySelectorAll('[data-reveal]');

if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  // Reduced motion or no IO support: show everything immediately.
  revealEls.forEach(el => el.classList.add('revealed'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
}

// ======= STAT COUNTERS =======
const counters = document.querySelectorAll('[data-count]');

const runCounter = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    // easeOutExpo for a snappy-but-settled feel
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if (counters.length) {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    counters.forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  } else {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(el => {
      el.textContent = '0' + (el.dataset.suffix || '');
      counterObserver.observe(el);
    });
  }
}

// ======= TERMINAL TYPING =======
const terminal = document.querySelector('.terminal-card');
const typedEl = terminal?.querySelector('.js-typed');

if (terminal && typedEl) {
  if (reduceMotion.matches) {
    terminal.classList.add('typed');
  } else {
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');

    const fullText = typedEl.textContent;

    const startTyping = () => {
      typedEl.textContent = '';
      terminal.classList.add('typing');
      typedEl.after(caret);

      let i = 0;
      const STEP_MS = 38;
      const timer = setInterval(() => {
        i += 1;
        typedEl.textContent = fullText.slice(0, i);
        if (i >= fullText.length) {
          clearInterval(timer);
          terminal.classList.add('typed');
          setTimeout(() => terminal.classList.remove('typing'), 1400);
        }
      }, STEP_MS);
    };

    // Kick off after the headline has settled
    setTimeout(startTyping, 650);
  }
}

// ======= MOBILE MENU =======
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', (!expanded).toString());
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ======= HEADER SCROLL STATE =======
const header = document.querySelector('.site-header');

if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ======= DYNAMIC YEAR =======
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ======= ACTIVE NAV HIGHLIGHT =======
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.primary-nav a, .mobile-menu a');

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(section => observer.observe(section));
}
