/**
 * SunPeak Solar - Main Application Logic
 * Mobile Navigation, Scroll Reveals, Accessible FAQ, Energy Flow, Form WhatsApp Routing
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initStickyHeader();
  initMobileActionBar();
  initScrollReveals();
  initEnergyFlow();
  initFaqAccordion();
  initLeadForm();
  initCurrentYear();
});

/* -------------------------------------------------------------
 * 1. Mobile Menu & Navigation
 * ----------------------------------------------------------- */
function initNavigation() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const navLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  if (!menuToggle || !mobileMenu) return;

  function openMenu() {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.classList.add('is-active');
    mobileMenu.classList.add('is-open');
    mobileMenu.removeAttribute('aria-hidden');
    if (menuBackdrop) {
      menuBackdrop.removeAttribute('hidden');
      menuBackdrop.classList.add('is-active');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('is-active');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (menuBackdrop) {
      menuBackdrop.setAttribute('hidden', '');
      menuBackdrop.classList.remove('is-active');
    }
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu();
    else openMenu();
  });

  if (menuBackdrop) {
    menuBackdrop.addEventListener('click', closeMenu);
  }

  const menuClose = document.getElementById('menu-close');
  if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/* -------------------------------------------------------------
 * 2. Sticky Header Elevation
 * ----------------------------------------------------------- */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* -------------------------------------------------------------
 * 3. Mobile Bottom Sticky Action Bar
 * ----------------------------------------------------------- */
function initMobileActionBar() {
  const bar = document.getElementById('mobile-action-bar');
  const footer = document.querySelector('.site-footer');
  if (!bar) return;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const heroSection = document.getElementById('hero');
    const heroHeight = heroSection ? heroSection.offsetHeight : 450;

    // Show after hero
    let shouldShow = scrollY > heroHeight - 100;

    // Hide near footer to avoid overlapping Krisha Tech demo CTA
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top < window.innerHeight - 20) {
        shouldShow = false;
      }
    }

    if (shouldShow) {
      bar.classList.add('is-visible');
    } else {
      bar.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* -------------------------------------------------------------
 * 4. IntersectionObserver Scroll Reveals
 * ----------------------------------------------------------- */
function initScrollReveals() {
  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
      el.classList.add('is-revealed');
    });
    return;
  }

  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  });

  revealElements.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------
 * 5. Energy Flow Interactive Visual (Sun -> Panel -> Inverter -> Home -> Grid)
 * ----------------------------------------------------------- */
function initEnergyFlow() {
  const energyFlowSection = document.getElementById('how-it-works');
  const nodes = document.querySelectorAll('[data-flow-node]');
  const descCards = document.querySelectorAll('[data-flow-desc]');
  
  if (!energyFlowSection || !nodes.length) return;

  // Activate flow line animation on scroll into view
  const flowVisual = document.querySelector('.flow-diagram');
  if (flowVisual) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          flowVisual.classList.add('flow-is-active');
        }
      });
    }, { threshold: 0.25 });
    observer.observe(flowVisual);
  }

  // Interactive node selector
  nodes.forEach((node) => {
    node.addEventListener('click', () => {
      const targetId = node.getAttribute('data-flow-node');

      // Update node active states
      nodes.forEach((n) => {
        n.classList.remove('is-selected');
        n.setAttribute('aria-selected', 'false');
      });
      node.classList.add('is-selected');
      node.setAttribute('aria-selected', 'true');

      // Update description cards
      descCards.forEach((card) => {
        if (card.getAttribute('data-flow-desc') === targetId) {
          card.classList.add('is-active');
          card.removeAttribute('hidden');
        } else {
          card.classList.remove('is-active');
          card.setAttribute('hidden', '');
        }
      });
    });
  });
}

/* -------------------------------------------------------------
 * 6. Accessible FAQ Accordion
 * ----------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!button || !answer) return;

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      // Close all other items for a clean single-open accordion experience
      faqItems.forEach((otherItem) => {
        const otherBtn = otherItem.querySelector('.faq-question');
        const otherAns = otherItem.querySelector('.faq-answer');
        if (otherBtn && otherAns && otherItem !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAns.style.maxHeight = null;
          otherItem.classList.remove('is-open');
        }
      });

      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
        item.classList.remove('is-open');
      } else {
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        item.classList.add('is-open');
      }
    });
  });
}

/* -------------------------------------------------------------
 * 7. Consultation Lead Form WhatsApp Routing
 * ----------------------------------------------------------- */
function initLeadForm() {
  const form = document.getElementById('survey-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    const propertyInput = document.getElementById('form-property');
    const locationInput = document.getElementById('form-location');
    const billInput = document.getElementById('form-bill');
    const messageInput = document.getElementById('form-message');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const property = propertyInput ? propertyInput.options[propertyInput.selectedIndex].text : '';
    const location = locationInput ? locationInput.value.trim() : '';
    const bill = billInput ? billInput.options[billInput.selectedIndex].text : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !phone) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    let text = `Hello SunPeak Solar,\n` +
      `I would like to request a free site survey & solar quotation.\n\n` +
      `• Name: ${name}\n` +
      `• Mobile: ${phone}\n` +
      `• Property Type: ${property}\n` +
      `• Location / City: ${location || 'Sangli / Maharashtra'}\n` +
      `• Approx Monthly Bill: ${bill}\n`;

    if (message) {
      text += `• Note: ${message}\n`;
    }

    text += `\nPlease guide me on the next steps.`;

    const whatsappUrl = `https://wa.me/917083330914?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}

/* -------------------------------------------------------------
 * 8. Current Year
 * ----------------------------------------------------------- */
function initCurrentYear() {
  const yrEl = document.getElementById('current-year');
  if (yrEl) {
    yrEl.textContent = new Date().getFullYear();
  }
}
