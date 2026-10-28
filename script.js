document.addEventListener('DOMContentLoaded', () => {

  /* ---------- menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // fecha o menu ao clicar em um link (mobile)
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- header com sombra ao rolar ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 12) {
      header.style.boxShadow = '0 10px 24px -18px rgba(52,32,26,0.4)';
    } else {
      header.style.boxShadow = 'none';
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- newsletter (validação e confirmação, sem backend) ---------- */
  const newsForm = document.getElementById('newsForm');
  const newsEmail = document.getElementById('newsEmail');
  const newsMsg = document.getElementById('newsMsg');

  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = newsEmail.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!isValid) {
        newsMsg.textContent = 'Digite um e-mail válido.';
        newsMsg.style.color = '#E7B0A0';
        newsEmail.focus();
        return;
      }

      newsMsg.textContent = 'Pronto! Você vai receber nossas novidades.';
      newsMsg.style.color = '';
      newsForm.reset();
    });
  }

});
