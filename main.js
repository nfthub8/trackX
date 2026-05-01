/* ============================================
   TRACKX — MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- CUSTOM CURSOR ----
  const cursor = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursor && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll('a, button, .nft-card, .faq-q').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform += ' scale(1.5)';
        cursorRing.style.width = '54px';
        cursorRing.style.height = '54px';
        cursorRing.style.borderColor = 'rgba(232,0,30,0.8)';
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
        cursorRing.style.borderColor = 'var(--gold)';
      });
    });
  }

  // ---- NAV SCROLL ----
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ---- SPEED STREAKS GENERATOR ----
  const streaksContainer = document.querySelector('.streaks-container');
  if (streaksContainer) {
    const numStreaks = 60;
    for (let i = 0; i < numStreaks; i++) {
      const streak = document.createElement('div');
      streak.className = 'streak';
      const topPct = Math.random() * 100;
      const duration = 0.3 + Math.random() * 0.8;
      const delay = Math.random() * 2;
      const width = 80 + Math.random() * 300;
      const opacity = 0.1 + Math.random() * 0.5;
      streak.style.cssText = `
        top: ${topPct}%;
        width: ${width}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${opacity};
      `;
      streaksContainer.appendChild(streak);
    }
  }

  // ---- ROAD LINES GENERATOR ----
  const roadLines = document.querySelector('.road-lines');
  if (roadLines) {
    for (let i = 0; i < 12; i++) {
      const line = document.createElement('div');
      line.className = 'road-line';
      const leftPct = 30 + (i / 12) * 40;
      const duration = 0.4 + Math.random() * 0.6;
      const delay = Math.random() * 1.5;
      line.style.cssText = `
        left: ${leftPct}%;
        width: ${2 + Math.random() * 2}px;
        height: ${60 + Math.random() * 80}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        bottom: 0;
      `;
      roadLines.appendChild(line);
    }
  }

  // ---- ASPHALT SPEED ----
  const asphaltOverlay = document.querySelector('.asphalt-overlay');
  if (asphaltOverlay) {
    let speed = 2;
    const speeds = [2, 3, 4, 3, 2, 1.5];
    let speedIdx = 0;

    const cycleSpeed = () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      speed = speeds[speedIdx];
      asphaltOverlay.style.animationDuration = speed + 's';
      setTimeout(cycleSpeed, 800 + Math.random() * 1200);
    };
    setTimeout(cycleSpeed, 1000);
  }

  // ---- SCROLL REVEAL ----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
  }

  // ---- FAQ ACCORDION ----
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ---- COUNTER ANIMATION ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const isDecimal = el.dataset.count.includes('.');
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          let start = 0;
          const duration = 1800;
          const startTime = performance.now();

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * eased;
            el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => countObserver.observe(el));
  }

  // ---- FORM HANDLING (form.html) ----
  const form = document.getElementById('whitelist-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'PROCESSING...';
      btn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        const success = document.querySelector('.form-success');
        if (success) {
          success.style.display = 'block';
          success.style.animation = 'fadeSlideUp 0.8s ease forwards';
        }
      }, 1800);
    });
  }

  // ---- PARALLAX ON HERO ----
  const carContainer = document.querySelector('.car-container');
  const carBlur = document.querySelector('.car-motion-blur');
  if (carContainer) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      carContainer.style.transform = `translateY(calc(-50% + ${scrollY * 0.15}px))`;
      if (carBlur) carBlur.style.transform = `translateY(calc(-50% + ${scrollY * 0.18}px))`;
    });
  }

  // ---- TICKER DUPLICATE (for seamless loop) ----
  const tickerInner = document.querySelector('.ticker-inner');
  if (tickerInner) {
    tickerInner.innerHTML += tickerInner.innerHTML;
  }

  // ---- MOBILE MENU TOGGLE ----
  window.toggleMenu = () => {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('open');
  };

  // ---- DYNAMIC BG FLASHES (speed light flares) ----
  const speedBg = document.querySelector('.speed-bg');
  if (speedBg) {
    const flash = () => {
      const flare = document.createElement('div');
      flare.style.cssText = `
        position: absolute;
        left: ${30 + Math.random() * 40}%;
        top: ${20 + Math.random() * 60}%;
        width: ${100 + Math.random() * 200}px;
        height: ${1 + Math.random() * 3}px;
        background: rgba(255,255,255,${0.03 + Math.random() * 0.08});
        transform: skewX(-${20 + Math.random() * 30}deg);
        border-radius: 1px;
        pointer-events: none;
        animation: flareAnim 0.3s ease forwards;
      `;
      speedBg.appendChild(flare);
      setTimeout(() => flare.remove(), 400);
      setTimeout(flash, 100 + Math.random() * 500);
    };

    // Add flash keyframe
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flareAnim {
        0% { opacity: 0; transform: skewX(-25deg) scaleX(0.5); }
        30% { opacity: 1; }
        100% { opacity: 0; transform: skewX(-25deg) scaleX(1.5); }
      }
    `;
    document.head.appendChild(style);
    setTimeout(flash, 500);
  }

  // ---- MINT FILL ANIMATION ----
  const mintFill = document.getElementById('mintFill');
  if (mintFill) {
    const mintObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => { mintFill.style.width = '0%'; }, 800);
      }
    }, { threshold: 0.5 });
    mintObserver.observe(mintFill);
  }

});