/* ==========================================================
   YASMÈRE AROMAS — animações minimalistas de rolagem
   - revelar elementos conforme a pessoa rola a página
   - frase de abertura que "acende" palavra por palavra
   - cabeçalho que encolhe + barra de progresso
   - leve parallax no vídeo do topo
   Respeita "reduzir movimento" do sistema.
   ========================================================== */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const start = () => {
    const $  = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    /* ---------- 0. hero: moldura, título palavra por palavra, faixa de aromas ---------- */
    const heroEl = $('.hero');
    const h1 = $('.hero h1');
    if (heroEl && h1) {
      const frame = document.createElement('div');
      frame.className = 'hero-frame';
      frame.setAttribute('aria-hidden', 'true');
      heroEl.appendChild(frame);

      const eb = document.createElement('p');
      eb.className = 'hero-eyebrow';
      eb.textContent = 'Velas aromáticas artesanais · Blumenau/SC';
      h1.parentNode.insertBefore(eb, h1);

      h1.removeAttribute('data-reveal');
      const label = h1.textContent.replace(/\s+/g, ' ').trim();
      h1.setAttribute('aria-label', label);
      h1.textContent = '';
      label.split(' ').forEach((w, i) => {
        const mask = document.createElement('span');
        mask.className = 'w';
        mask.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.style.setProperty('--i', i);
        inner.textContent = w;
        if (/^momento$/i.test(w)) inner.classList.add('em');
        mask.appendChild(inner);
        h1.appendChild(mask);
        h1.appendChild(document.createTextNode(' '));
      });

      const nomes = ['Bergamota fresca', 'Figo em flor', 'Jardim de Yasmim', 'Doces Lembranças', 'Lavanda', 'Doce encontro'];
      const faixa = nomes.map((n) => '<span>' + n + '</span>').join('');
      const mq = document.createElement('div');
      mq.className = 'marquee';
      mq.setAttribute('aria-hidden', 'true');
      mq.innerHTML = '<div class="marquee-track">' + faixa + faixa + faixa + faixa + '</div>';
      heroEl.after(mq);
    }

    /* ---------- 1. marca o que deve aparecer ao rolar ---------- */
    const tag = (sel, type = 'up', stagger) => {
      $$(sel).forEach((el) => {
        el.setAttribute('data-anim', type);
        if (stagger) el.dataset.stagger = stagger;
      });
    };

    tag('.statement .wrap', 'fade');
    tag('.section-head', 'up');
    tag('.product-card', 'up', 120);
    tag('.collection + .collection .product-grid', 'fade');
    tag('.collection + .collection .hero-cta', 'up', 100);
    tag('.feature', 'up', 160);
    tag('.process-steps', 'line');
    tag('.process-steps li', 'up', 170);
    tag('.care-box', 'scale');
    tag('.cta-inner h2', 'up');
    tag('.cta-final .hero-cta', 'up');
    tag('.footer-grid > *', 'up', 110);

    /* ícones "se desenham": usa pathLength=1 para tracejar qualquer forma */
    $$('.feature-icon').forEach((svg) => {
      $$('path, circle, line, polyline, rect, ellipse', svg).forEach((shape) => {
        shape.setAttribute('pathLength', '1');
        shape.classList.add('dr');
      });
    });

    /* ---------- 2. observador: revela e escalona ---------- */
    const reveal = (el, k) => {
      const step = Number(el.dataset.stagger) || 100;
      const delay = k * step;
      el.style.transitionDelay = delay + 'ms';
      el.classList.add('is-in');

      // limpa depois, para não atrapalhar hovers (ex.: levantar o card)
      if (el.dataset.anim !== 'line') {
        setTimeout(() => {
          el.style.transitionDelay = '';
          el.removeAttribute('data-anim');
          el.classList.remove('is-in');
        }, delay + 1400);
      }
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        let k = 0;
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach((e) => {
            reveal(e.target, k++);
            io.unobserve(e.target);
          });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      $$('[data-anim]').forEach((el) => io.observe(el));
    } else {
      $$('[data-anim]').forEach((el) => el.classList.add('is-in'));
    }

    /* ---------- 3. frase de abertura palavra por palavra ---------- */
    const statement = $('.statement-text');
    let words = [];

    if (statement) {
      const wrap = (node) => {
        if (node.nodeType === 3) {
          const frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
            } else {
              const span = document.createElement('span');
              span.className = 'word';
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          node.replaceWith(frag);
        } else if (node.nodeType === 1 && node.tagName !== 'BR') {
          Array.from(node.childNodes).forEach(wrap);
        }
      };
      Array.from(statement.childNodes).forEach(wrap);
      words = $$('.word', statement);
    }

    /* ---------- 4. rolagem: tudo num único requestAnimationFrame ---------- */
    const header   = $('#siteHeader');
    const video    = $('.hero-video');
    const hero     = $('.hero');
    const whats    = $('.whatsapp-float');
    const navLinks = $$('.main-nav a');
    const spy = navLinks
      .map((a) => ({ a, sec: $(a.getAttribute('href')) }))
      .filter((x) => x.sec);

    let bar = null;
    if (header) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      bar.setAttribute('aria-hidden', 'true');
      header.appendChild(bar);
    }

    let ticking = false;

    const update = () => {
      ticking = false;
      const y  = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;

      if (header) header.classList.toggle('is-scrolled', y > 40);
      if (bar && max > 0) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
      if (whats) whats.classList.toggle('is-visible', y > 480);

      // parallax suave do vídeo (só enquanto o topo está visível)
      if (video && hero && !reduce && y < hero.offsetHeight) {
        video.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      }

      // frase de abertura: acende conforme passa pela tela
      if (words.length) {
        const r = statement.getBoundingClientRect();
        const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.42)));
        const lit = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < lit));
      }

      // menu: destaca a seção atual
      let current = null;
      spy.forEach(({ a, sec }) => {
        if (sec.getBoundingClientRect().top <= vh * 0.35) current = a;
      });
      navLinks.forEach((a) => a.classList.toggle('is-active', a === current));
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    /* ---------- 5. vídeo: respeita movimento reduzido ---------- */
    if (video && reduce) video.pause();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
