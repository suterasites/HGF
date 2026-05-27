(function () {
  'use strict';

  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('quoteForm');
  const formStatus = document.getElementById('formStatus');

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Hide header on scroll-down, show on scroll-up */
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > 80 && y > lastY) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  /* Mobile nav toggle */
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    header.querySelectorAll('.nav a').forEach(a => {
      a.addEventListener('click', () => {
        header.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Services horizontal scroller */
  const track = document.getElementById('servicesTrack');
  const progress = document.getElementById('servicesProgress');
  if (track) {
    const ctrls = Array.from(document.querySelectorAll('.svc-ctrl'));
    const cards = () => Array.from(track.querySelectorAll('.svc-card'));

    const currentIndex = () => {
      const list = cards();
      if (!list.length) return 0;
      const left = track.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      list.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - left);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    };

    const scrollToIndex = (i) => {
      const list = cards();
      const target = list[Math.min(list.length - 1, Math.max(0, i))];
      if (!target) return;
      track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    };

    const updateProgress = () => {
      if (!progress) return;
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
      progress.style.width = (ratio * 100).toFixed(2) + '%';
      ctrls.forEach(c => {
        const dir = c.dataset.dir;
        if (dir === 'prev') c.disabled = track.scrollLeft <= 2;
        if (dir === 'next') c.disabled = track.scrollLeft >= max - 2;
      });
    };

    ctrls.forEach(c => {
      c.addEventListener('click', (e) => {
        e.preventDefault();
        const dir = c.dataset.dir === 'next' ? 1 : -1;
        scrollToIndex(currentIndex() + dir);
      });
    });

    track.addEventListener('scroll', () => requestAnimationFrame(updateProgress), { passive: true });
    window.addEventListener('resize', updateProgress);
    requestAnimationFrame(updateProgress);

    /* Click-and-drag scrolling on desktop */
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('mousedown', (e) => {
      isDown = true;
      moved = false;
      startX = e.pageX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    const endDrag = () => {
      if (isDown) {
        isDown = false;
        track.classList.remove('is-dragging');
      }
    };
    track.addEventListener('mouseup', endDrag);
    track.addEventListener('mouseleave', endDrag);
    track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    /* Keyboard navigation */
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollToIndex(currentIndex() + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollToIndex(currentIndex() - 1); }
    });
  }

  /* Reveal on scroll */
  const targets = document.querySelectorAll('.section-header, .services-header, .svc-card, .gallery__item, .area-col, .about-grid__copy, .about-grid__media, .rating-block, .quote-grid__copy, .quote-form');
  targets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('is-visible'));
  }

  /* Mock form submission */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const suburb = form.suburb.value.trim();
      if (!name || !phone || !suburb) {
        formStatus.textContent = 'Please fill in your name, phone and suburb so we can call you back.';
        formStatus.classList.add('is-visible');
        formStatus.style.background = 'rgba(180, 70, 40, .12)';
        formStatus.style.color = '#B44628';
        return;
      }
      formStatus.textContent = 'Thanks ' + name.split(' ')[0] + ' - we will give you a call back within one business day.';
      formStatus.style.background = '';
      formStatus.style.color = '';
      formStatus.classList.add('is-visible');
      form.reset();
    });
  }
})();
