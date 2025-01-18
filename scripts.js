// scripts.js

// ======= MOBILE NAVIGATION =======
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// ======= DYNAMIC YEAR IN FOOTER =======
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/*
  You can add more JavaScript for interactivity:
  - Smooth scrolling to sections
  - Additional animations
  - Form handling (if using Netlify or a form service)
*/