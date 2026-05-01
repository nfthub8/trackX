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

  // ---- PREMIUM SCROLL-DRIVEN REALISTIC F1 HERO CAR ----
  // SVG is used here instead of the old blocky geometry.
  // It stays transparent, lightweight, and looks much closer to a real F1 car.
  const f1Car = document.querySelector('.f1-realistic-car');
  const f1Stage = document.querySelector('.f1-hero-stage');
  const f1Glow = document.querySelector('.f1-hero-glow');
  const f1Shadow = document.querySelector('.f1-hero-shadow');
  const f1Lines = document.querySelector('.f1-motion-lines');
  const f1Wheels = document.querySelectorAll('.wheel');

  if (f1Car && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Initial premium angle on load
    gsap.set(f1Car, {
      xPercent: 0,
      yPercent: -1,
      scale: 0.98,
      rotateY: -7,
      rotateX: 1.5,
      rotateZ: -0.25,
      transformPerspective: 1200,
      transformOrigin: '58% 52%'
    });

    // Smooth reveal after page loads
    gsap.fromTo(f1Car,
      { opacity: 0, x: 55, scale: 0.96, filter: 'drop-shadow(0 0 0 rgba(232,0,30,0))' },
      { opacity: 1, x: 0, scale: 0.98, duration: 1.05, ease: 'power3.out' }
    );

    // Apple/web3-style scroll scrub:
    // car glides inward, rotates subtly, zooms slightly, and lighting breathes.
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=950',
        scrub: 0.85
      }
    })
    .to(f1Car, {
      xPercent: -10,
      yPercent: -2.5,
      scale: 1.06,
      rotateY: 5,
      rotateX: 2.5,
      rotateZ: 0.25,
      ease: 'none'
    }, 0)
    .to(f1Glow, {
      opacity: 0.95,
      scale: 1.16,
      ease: 'none'
    }, 0)
    .to(f1Shadow, {
      opacity: 0.58,
      scaleX: 0.92,
      xPercent: -8,
      ease: 'none'
    }, 0)
    .to(f1Lines, {
      opacity: 0.82,
      xPercent: -18,
      scaleX: 1.18,
      ease: 'none'
    }, 0);

    // Very small wheel movement only. The main effect is the full-car glide, not tires popping up.
    gsap.to(f1Wheels, {
      rotate: 55,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=950',
        scrub: 0.7
      }
    });

    // Tiny idle motion so it does not feel dead/static.
    gsap.to(f1Car, {
      y: -5,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
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