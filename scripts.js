// scripts.js

// ======= THEME TOGGLE =======
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const THEME_STORAGE_KEY = 'theme';

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (err) {
    return null;
  }
};

const storeTheme = (mode) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (err) {
    // Ignore write failures (e.g., private mode)
  }
};

const applyTheme = (mode) => {
  const isDark = mode === 'dark';
  root.classList.toggle('dark', isDark);
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
    themeToggle.setAttribute('title', label);
    themeToggle.setAttribute('aria-label', label);
  }
};

const initialiseTheme = () => {
  const stored = getStoredTheme();
  const initial = stored || 'dark';
  applyTheme(initial);
  if (!stored) {
    storeTheme(initial);
  }
};

initialiseTheme();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

// ======= CURSOR-RESPONSIVE GLOW =======
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pageGlow = document.querySelector('.page-glow');
const glowState = {
  pointerActive: false,
  handlersAttached: false,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const GLOW_Y_OFFSET = 48;

const setGlowPosition = (x, y) => {
  root.style.setProperty('--cursor-x', `${x}px`);
  root.style.setProperty('--cursor-y', `${y}px`);
};

const primeGlowPosition = () => {
  const heroSection = document.getElementById('about');
  if (!heroSection) {
    setGlowPosition(window.innerWidth * 0.6, window.innerHeight * 0.28 + GLOW_Y_OFFSET);
    if (pageGlow) {
      pageGlow.style.opacity = '0.9';
    }
    return;
  }
  const rect = heroSection.getBoundingClientRect();
  const baselineX = rect.left + rect.width * 0.58;
  const baselineY = rect.top + rect.height * 0.32 + GLOW_Y_OFFSET;
  setGlowPosition(baselineX, baselineY);
  if (pageGlow) {
    pageGlow.style.opacity = '0.9';
  }
};

const handlePointerMove = (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') {
    return;
  }
  glowState.pointerActive = true;
  const x = clamp(event.clientX, 0, window.innerWidth);
  const y = clamp(event.clientY + GLOW_Y_OFFSET, 0, window.innerHeight + 200);
  setGlowPosition(x, y);
  if (pageGlow) {
    pageGlow.style.opacity = '1';
  }
};

const handlePointerLeave = () => {
  glowState.pointerActive = false;
  primeGlowPosition();
  if (pageGlow) {
    pageGlow.style.opacity = '0.82';
  }
};

const attachGlow = () => {
  if (!pageGlow || glowState.handlersAttached) {
    return;
  }
  glowState.handlersAttached = true;
  primeGlowPosition();
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerleave', handlePointerLeave);
  window.addEventListener('blur', handlePointerLeave);
};

const detachGlow = () => {
  if (!glowState.handlersAttached) {
    return;
  }
  glowState.handlersAttached = false;
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerleave', handlePointerLeave);
  window.removeEventListener('blur', handlePointerLeave);
};

if (pageGlow) {
  if (!prefersReducedMotion.matches) {
    attachGlow();
  } else {
    primeGlowPosition();
  }

  const handleMotionPreferenceChange = (event) => {
    if (event.matches) {
      detachGlow();
      primeGlowPosition();
    } else {
      attachGlow();
    }
  };

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', handleMotionPreferenceChange);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(handleMotionPreferenceChange);
  }
}

// ======= MOBILE NAVIGATION =======
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', (!isExpanded).toString());
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
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

// ======= DYNAMIC YEAR IN FOOTER =======
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/*
  Additional enhancements can live here:
  - Section intersection observers for active nav highlighting
  - Theme toggle syncing with system preference changes
  - Analytics or form handlers if needed
*/
