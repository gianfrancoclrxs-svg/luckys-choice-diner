// ============================================
// Lucky's Choice Diner (K3B) — site behavior
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Nav: hero blends into a solid bar on scroll ---
  const nav = document.getElementById('nav');
  const SCROLL_THRESHOLD = 60;

  const updateNavState = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu after tapping a link
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // --- Feedback ---
  // The feedback "form" is just a link out to a Google Form now — nothing to wire up here.

  // --- Menu category filter ---
  const menuFilters = document.getElementById('menuFilters');
  const menuCategories = document.querySelectorAll('.menu__category');

  if (menuFilters) {
    menuFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.menu__filter');
      if (!btn) return;

      menuFilters.querySelectorAll('.menu__filter').forEach((f) => {
        f.classList.remove('is-active');
        f.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      menuCategories.forEach((cat) => {
        cat.style.display = (filter === 'all' || cat.dataset.category === filter) ? '' : 'none';
      });
    });
  }

  // --- Dish showcase: tap-to-flip on touch devices (no hover to rely on) ---
  const dishCards = document.querySelectorAll('.dish-card');
  const noHover = window.matchMedia('(hover: none)').matches;

  if (noHover && dishCards.length) {
    dishCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (!card.classList.contains('is-flipped')) {
          e.preventDefault();
          dishCards.forEach((c) => { if (c !== card) c.classList.remove('is-flipped'); });
          card.classList.add('is-flipped');
        }
        // already flipped: let the tap through and follow the link to #menu
      });
    });

    // Tapping anywhere outside the showcase un-flips the open card
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dish-card')) {
        dishCards.forEach((c) => c.classList.remove('is-flipped'));
      }
    });
  }

  // --- Promos carousel ---
  const promoTrack = document.getElementById('promoTrack');
  if (promoTrack) {
    const promoCards = [...promoTrack.children];
    const promoDots = document.getElementById('promoDots');
    let promoIndex = 0;
    let promoPaused = false;
    let promoVisible = true;

    const cardLeft = (n) => promoCards[n].offsetLeft - promoCards[0].offsetLeft;

    const setActive = (i) => {
      promoIndex = i;
      [...promoDots.children].forEach((d, n) => d.classList.toggle('is-active', n === i));
    };

    const goToPromo = (i) => {
      const n = (i + promoCards.length) % promoCards.length;
      promoTrack.scrollTo({ left: cardLeft(n), behavior: 'smooth' });
      setActive(n);
    };

    promoCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'promos__dot';
      dot.setAttribute('aria-label', 'Go to deal ' + (i + 1));
      dot.addEventListener('click', () => goToPromo(i));
      promoDots.appendChild(dot);
    });

    promoTrack.addEventListener('scroll', () => {
      let nearest = 0, best = Infinity;
      promoCards.forEach((_, n) => {
        const d = Math.abs(cardLeft(n) - promoTrack.scrollLeft);
        if (d < best) { best = d; nearest = n; }
      });
      if (nearest !== promoIndex) setActive(nearest);
    }, { passive: true });

    document.getElementById('promoPrev').addEventListener('click', () => goToPromo(promoIndex - 1));
    document.getElementById('promoNext').addEventListener('click', () => goToPromo(promoIndex + 1));

    ['mouseenter', 'focusin', 'touchstart'].forEach((ev) =>
      promoTrack.addEventListener(ev, () => { promoPaused = true; }, { passive: true }));
    ['mouseleave', 'focusout'].forEach((ev) =>
      promoTrack.addEventListener(ev, () => { promoPaused = false; }, { passive: true }));
    // After a touch, resume autoplay only after a pause so it doesn't fight the swipe
    promoTrack.addEventListener('touchend', () => {
      setTimeout(() => { promoPaused = false; }, 6000);
    }, { passive: true });

    // Only autoplay while the carousel is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        promoVisible = entries[0].isIntersecting;
      }, { threshold: 0.3 }).observe(promoTrack);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(() => {
        if (!promoPaused && promoVisible) goToPromo(promoIndex + 1);
      }, 5000);
    }

    window.addEventListener('resize', () => {
      promoTrack.scrollLeft = cardLeft(promoIndex);
    });

    setActive(0);
  }

  // --- Footer year ---
  document.getElementById('year').textContent = new Date().getFullYear();

  // --- Back to top floating button ---
  const backToTop = document.getElementById('backToTop');
  const BACK_TO_TOP_THRESHOLD = 400;

  const updateBackToTopVisibility = () => {
    backToTop.classList.toggle('is-visible', window.scrollY > BACK_TO_TOP_THRESHOLD);
  };

  updateBackToTopVisibility();
  window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});