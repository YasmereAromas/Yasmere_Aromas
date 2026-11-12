/* ==========================================================
   YASMÈRE AROMAS — camada imersiva (estilo "site de estúdio")
   abertura com contador + cortina · cursor customizado · selo
   giratório · faixas gigantes · números animados · cards 3D
   Para remover tudo: apague este arquivo e a linha <script src="intro.js">.
   ========================================================== */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem('yas-intro') === '1'; } catch (e) {}

  if (!reduce) root.classList.add('is-loading');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

  /* ---------- ABERTURA ---------- */
  const runIntro = () => {
    if (reduce) return;
    const box = el(`<div class="intro" aria-hidden="true"><div class="intro-inner">
      <img src="img/logo-yasmere.webp" alt="" width="84" height="84">
      <div class="intro-word"><span>Yasmère</span></div>
      <div class="intro-sub">aromas artesanais</div>
      <div class="intro-bar"><i></i></div></div><div class="intro-count">0</div></div>`);
    document.body.appendChild(box);
    const bar = $('.intro-bar i', box), num = $('.intro-count', box);
    const dur = seen ? 800 : 2300, t0 = performance.now();
    let loaded = document.readyState === 'complete';
    addEventListener('load', () => (loaded = true));

    const tick = (now) => {
      const t = now - t0, p = Math.min(1, t / dur);
      const e = 1 - Math.pow(1 - p, 3);
      bar.style.transform = 'scaleX(' + e + ')';
      num.textContent = Math.round(e * 100);
      if (p < 1 || (!loaded && t < 5000)) return requestAnimationFrame(tick);
      num.textContent = '100';
      setTimeout(() => {
        box.classList.add('out');
        root.classList.remove('is-loading');
        try { sessionStorage.setItem('yas-intro', '1'); } catch (e) {}
        setTimeout(() => box.remove(), 1300);
      }, 300);
    };
    requestAnimationFrame(tick);
  };

  const start = () => {
    runIntro();

    /* ---------- HERO: selo giratório + palavra gigante ---------- */
    const hero = $('.hero');
    if (hero) {
      hero.appendChild(el(`<a href="#colecao" class="hero-badge" aria-label="Ver coleção">
        <svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="yc" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
        <text><textPath href="#yc" textLength="480" lengthAdjust="spacing">FEITO À MÃO ✦ CERA VEGETAL ✦ BLUMENAU/SC ✦</textPath></text></svg>
        <span>↓</span></a>`));
      hero.appendChild(el('<div class="hero-bigword" aria-hidden="true">Yasmère</div>'));
    }

    /* ---------- faixa gigante + números ---------- */
    const statement = $('.statement');
    const firstColl = $('#colecao');
    const row = (txt, cls) => `<div class="mega-row ${cls}">${(txt + ' ✦ ').repeat(6)}</div>`;
    if (firstColl) {
      firstColl.after(el(`<section class="mega" aria-hidden="true">
        ${row('Cera ✦ Aroma ✦ Cuidado', 'solid')}${row('Feito à mão ✦ Yasmère ✦ Blumenau', 'outline')}</section>`));
    }
    if (statement) {
      statement.after(el(`<section class="stats" data-anim="fade"><div class="wrap stats-grid">
        <div class="stat"><b data-to="6">0</b><span>aromas autorais</span></div>
        <div class="stat"><b data-to="4">0</b><span>etapas feitas à mão</span></div>
        <div class="stat"><b>∞</b><span>momentos para guardar</span></div></div></section>`));
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      $$('b[data-to]', e.target).forEach((b) => {
        const to = +b.dataset.to, t0 = performance.now();
        const f = (n) => { const p = Math.min(1, (n - t0) / 1400); b.textContent = '0' + Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
        requestAnimationFrame(f);
      });
    }), { threshold: 0.4 });
    $$('.stats').forEach((s) => io.observe(s));

    /* ---------- numeração dos títulos + nº nos cards ---------- */
    $$('.section-head').forEach((h, i) => h.prepend(el(`<span class="kicker">Nº 0${i + 1}</span>`)));
    $$('.product-card').forEach((c, i) => c.appendChild(el(`<span class="card-n">0${i + 1}</span>`)));

    /* ---------- rolagem: faixas gigantes + palavra do hero ---------- */
    const rows = $$('.mega-row'), big = $('.hero-bigword');
    let tk = false;
    const onScroll = () => {
      if (tk) return; tk = true;
      requestAnimationFrame(() => {
        tk = false;
        const vh = innerHeight;
        rows.forEach((r, i) => {
          const b = r.getBoundingClientRect();
          const p = (b.top + b.height / 2 - vh / 2) / vh;
          r.style.transform = 'translate3d(' + (-p * 420 * (i % 2 ? -1 : 1) - (i % 2 ? 900 : 0)).toFixed(0) + 'px,0,0)';
        });
        if (big) big.style.transform = 'translate3d(' + (-scrollY * 0.25).toFixed(0) + 'px,0,0)';
      });
    };
    if (!reduce) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

    /* ---------- cards 3D ---------- */
    if (fine && !reduce) {
      $$('.product-card').forEach((c) => {
        c.addEventListener('mousemove', (e) => {
          const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          c.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg');
          c.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
          c.style.setProperty('--mx', (x * 100).toFixed(0) + '%');
          c.style.setProperty('--my', (y * 100).toFixed(0) + '%');
        });
        c.addEventListener('mouseleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
      });

      /* ---------- cursor customizado ---------- */
      const ring = el('<div class="cursor" aria-hidden="true"><span></span></div>');
      const dot = el('<div class="cursor-dot" aria-hidden="true"></div>');
      document.body.append(ring, dot);
      root.classList.add('has-cursor');
      let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
      addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; });
      (function loop() { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
      const label = $('span', ring);
      document.addEventListener('mouseover', (e) => {
        const t = e.target.closest('a, button, .btn, input, .product-card');
        ring.classList.toggle('is-link', !!t);
        const card = e.target.closest('.product-card');
        ring.classList.toggle('is-card', !!card);
        label.textContent = card ? 'Ver' : '';
      });
      document.addEventListener('mouseleave', () => ring.classList.add('is-hidden'));
      document.addEventListener('mouseenter', () => ring.classList.remove('is-hidden'));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
