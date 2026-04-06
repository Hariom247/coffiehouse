/**
 * Coffi House — Main Script
 * ══════════════════════════════════════════════════
 * Modules:
 *  1. Mobile navigation (slide-out menu + ESC key)
 *  2. Scroll-sensitive header + back-to-top
 *  3. Active nav-link highlighting (IntersectionObserver)
 *  4. Scroll-reveal animations (IntersectionObserver)
 *  5. Swiper testimonial carousel
 *  6. Contact form feedback
 *  7. ORDER MODAL — WhatsApp order submission
 *  8. REVIEW MODAL — Star rating + testimonial submission
 *  9. Bottom navigation active state
 * 10. Quantity stepper
 * 11. Delivery address toggle
 * ══════════════════════════════════════════════════
 *
 * ╔══════════════════════════════════════════════╗
 * ║  HOW TO CONNECT TO A BACKEND LATER          ║
 * ║  Replace the submitOrder() body with a      ║
 * ║  fetch('/api/orders', { method:'POST',… })  ║
 * ║  and replace submitTestimonial() body with  ║
 * ║  a Supabase or GAS endpoint call.           ║
 * ╚══════════════════════════════════════════════╝
 */

/* ── CONFIG — edit these to match your shop ───────── */
const SHOP_CONFIG = {
  /** Your WhatsApp number (international format, no +) */
  whatsappNumber: "11234567890",

  /** Shop name shown in the WhatsApp message */
  shopName: "Coffi House",

  /** Rating labels for the star widget */
  ratingLabels: {
    1: "😞 Poor",
    2: "😐 Fair",
    3: "🙂 Good",
    4: "😊 Great",
    5: "🤩 Excellent!",
  },
};

/* ══════════════════════════════════════════════════
   DOM READY
══════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* ─────────────────────────────────────────────
     ELEMENT REFERENCES
  ───────────────────────────────────────────── */
  const header          = document.getElementById("site-header");
  const navOverlay      = document.getElementById("nav-overlay");
  const menuOpenBtn     = document.getElementById("menu-open-button");
  const menuCloseBtn    = document.getElementById("menu-close-button");
  const navLinks        = document.querySelectorAll(".nav-menu .nav-link");
  const backToTopBtn    = document.getElementById("back-to-top");
  const sections        = document.querySelectorAll("main section[id]");
  const revealEls       = document.querySelectorAll(".reveal-left, .reveal-right, .reveal-up");
  const contactForm     = document.getElementById("contact-form");
  const formSuccess     = document.getElementById("form-success");

  /* ══════════════════════════════════════════════
     1. MOBILE NAVIGATION
  ══════════════════════════════════════════════ */

  const openMenu = () => {
    document.body.classList.add("show-mobile-menu");
    menuOpenBtn.setAttribute("aria-expanded", "true");
    navOverlay.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    document.body.classList.remove("show-mobile-menu");
    menuOpenBtn.setAttribute("aria-expanded", "false");
    navOverlay.setAttribute("aria-hidden", "true");
  };

  menuOpenBtn.addEventListener("click", openMenu);
  menuCloseBtn.addEventListener("click", closeMenu);
  navOverlay.addEventListener("click", closeMenu);

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeAllModals();
    }
  });

  /* ══════════════════════════════════════════════
     2. SCROLL HEADER + BACK-TO-TOP
  ══════════════════════════════════════════════ */

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 60);
    if (backToTopBtn) backToTopBtn.classList.toggle("visible", y > 400);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ══════════════════════════════════════════════
     3. ACTIVE NAV LINK
  ══════════════════════════════════════════════ */

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) =>
            link.classList.toggle("active", link.dataset.section === id)
          );
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  // Home active on initial load
  const homeLink = document.querySelector('[data-section="home"]');
  if (homeLink) homeLink.classList.add("active");

  window.addEventListener("scroll", () => {
    if (window.scrollY < 200) {
      navLinks.forEach((l) => l.classList.toggle("active", l.dataset.section === "home"));
    }
  }, { passive: true });

  /* ══════════════════════════════════════════════
     4. SCROLL-REVEAL ANIMATIONS
  ══════════════════════════════════════════════ */

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ══════════════════════════════════════════════
     5. SWIPER CAROUSEL
  ══════════════════════════════════════════════ */

  new Swiper(".slider-container", {
    loop: true,
    grabCursor: true,
    spaceBetween: 24,
    speed: 600,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      0:    { slidesPerView: 1 },
      640:  { slidesPerView: 1, spaceBetween: 16 },
      768:  { slidesPerView: 2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
    },
    a11y: {
      prevSlideMessage: "Previous testimonial",
      nextSlideMessage: "Next testimonial",
    },
  });

  /* ══════════════════════════════════════════════
     6. CONTACT FORM
  ══════════════════════════════════════════════ */

  if (contactForm && formSuccess) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = document.getElementById("submit-btn");
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

      setTimeout(() => {
        formSuccess.removeAttribute("hidden");
        contactForm.reset();
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        setTimeout(() => formSuccess.setAttribute("hidden", ""), 6000);
      }, 1400);
    });
  }

  /* ══════════════════════════════════════════════
     7. ORDER MODAL
  ══════════════════════════════════════════════ */

  const orderModalBackdrop = document.getElementById("order-modal-backdrop");
  const orderForm          = document.getElementById("order-form");
  const orderItemSelect    = document.getElementById("order-item");

  /** Open the order modal, optionally pre-select an item */
  function openOrderModal(preselectedItem = "") {
    if (preselectedItem && orderItemSelect) {
      // Try to find the matching option
      const opt = [...orderItemSelect.options].find(
        (o) => o.value === preselectedItem || o.text === preselectedItem
      );
      if (opt) orderItemSelect.value = opt.value;
    }
    openModal(orderModalBackdrop);
  }

  function closeOrderModal() {
    closeModal(orderModalBackdrop);
  }

  // All buttons that open the order modal
  const orderTriggers = [
    document.getElementById("hero-order-btn"),
    document.getElementById("nav-order-btn-mobile"),
    document.getElementById("nav-order-btn-desktop"),
    // bottom-order-btn removed (bottom nav removed)
  ];

  orderTriggers.forEach((btn) => {
    if (btn) btn.addEventListener("click", () => openOrderModal());
  });

  // Menu card "Order" chips
  document.querySelectorAll(".menu-order-chip").forEach((chip) => {
    chip.addEventListener("click", () => openOrderModal(chip.dataset.item || ""));
  });

  document.getElementById("order-modal-close")?.addEventListener("click", closeOrderModal);

  // Close on backdrop click
  orderModalBackdrop?.addEventListener("click", (e) => {
    if (e.target === orderModalBackdrop) closeOrderModal();
  });

  /* ── Delivery type toggle: show/hide address ── */
  const deliveryRadios = document.querySelectorAll('input[name="order-type"]');
  const addressGroup   = document.getElementById("delivery-address-group");
  const addressField   = document.getElementById("order-address");

  deliveryRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const isDelivery = radio.value === "Delivery" && radio.checked;
      if (addressGroup) {
        addressGroup.hidden = !isDelivery;
        if (addressField) addressField.required = isDelivery;
      }
    });
  });

  /* ── Quantity stepper ── */
  const qtyInput = document.getElementById("order-qty");
  document.getElementById("qty-minus")?.addEventListener("click", () => {
    if (qtyInput && parseInt(qtyInput.value) > 1) {
      qtyInput.value = parseInt(qtyInput.value) - 1;
    }
  });
  document.getElementById("qty-plus")?.addEventListener("click", () => {
    if (qtyInput && parseInt(qtyInput.value) < 20) {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    }
  });

  /* ── Order form submission → WhatsApp ── */
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        item:     document.getElementById("order-item")?.value,
        quantity: document.getElementById("order-qty")?.value,
        name:     document.getElementById("order-name")?.value,
        phone:    document.getElementById("order-phone")?.value,
        type:     document.querySelector('input[name="order-type"]:checked')?.value,
        address:  document.getElementById("order-address")?.value || "—",
        notes:    document.getElementById("order-notes")?.value || "—",
      };

      // Validate required fields
      if (!data.item || !data.name || !data.phone) {
        showFieldError("Please fill in all required fields.");
        return;
      }

      submitOrder(data);
    });
  }

  /**
   * submitOrder(data)
   * ─────────────────────────────────────────────
   * Currently: formats data into a WhatsApp message and opens wa.me
   * Later: replace with fetch('/api/orders', { method: 'POST', body: JSON.stringify(data) })
   *        or: supabase.from('orders').insert([data])
   *
   * @param {Object} data - The order details
   */
  function submitOrder(data) {
    console.log("[Coffi House] New Order:", data);

    const msg = [
      `🛒 *New Order — ${SHOP_CONFIG.shopName}*`,
      ``,
      `📌 *Item:* ${data.item}`,
      `🔢 *Qty:* ${data.quantity}`,
      ``,
      `👤 *Name:* ${data.name}`,
      `📞 *Phone:* ${data.phone}`,
      `🏷️ *Type:* ${data.type}`,
      data.type === "Delivery" ? `📍 *Address:* ${data.address}` : null,
      ``,
      `📝 *Notes:* ${data.notes}`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const waUrl = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Reset & close modal
    orderForm.reset();
    closeOrderModal();
  }

  /* ══════════════════════════════════════════════
     8. REVIEW MODAL
  ══════════════════════════════════════════════ */

  const reviewModalBackdrop = document.getElementById("review-modal-backdrop");
  const reviewForm          = document.getElementById("review-form");
  const reviewSuccess       = document.getElementById("review-success");

  document.getElementById("open-review-btn")?.addEventListener("click", () => {
    openModal(reviewModalBackdrop);
  });
  document.getElementById("review-modal-close")?.addEventListener("click", () => {
    closeModal(reviewModalBackdrop);
  });
  reviewModalBackdrop?.addEventListener("click", (e) => {
    if (e.target === reviewModalBackdrop) closeModal(reviewModalBackdrop);
  });

  /* ── Interactive star rating labels ── */
  const starLabels = document.querySelectorAll(".star-label");
  const ratingHint = document.getElementById("rating-hint");

  starLabels.forEach((label) => {
    label.addEventListener("mouseenter", () => {
      const val = parseInt(label.previousElementSibling?.value || label.getAttribute("for").replace("star-", ""));
      if (ratingHint && SHOP_CONFIG.ratingLabels[val]) {
        ratingHint.textContent = SHOP_CONFIG.ratingLabels[val];
      }
    });
    label.addEventListener("mouseleave", () => {
      const checkedStar = document.querySelector(".star-radio:checked");
      if (ratingHint) {
        ratingHint.textContent = checkedStar
          ? SHOP_CONFIG.ratingLabels[checkedStar.value]
          : "Tap a star to rate";
      }
    });
    label.addEventListener("click", () => {
      const checkedStar = document.querySelector(".star-radio:checked");
      if (ratingHint && checkedStar) {
        ratingHint.textContent = SHOP_CONFIG.ratingLabels[checkedStar.value];
      }
    });
  });

  /* ── Review form submission ── */
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        name:      document.getElementById("review-name")?.value,
        rating:    document.querySelector(".star-radio:checked")?.value,
        review:    document.getElementById("review-text")?.value,
        timestamp: new Date().toISOString(),
      };

      if (!data.name || !data.rating || !data.review) {
        showFieldError("Please fill in all fields and select a rating.", reviewForm);
        return;
      }

      submitTestimonial(data);
    });
  }

  /**
   * submitTestimonial(data)
   * ─────────────────────────────────────────────
   * Currently: logs data to console (no backend yet)
   * Later: replace body with:
   *   supabase.from('testimonials').insert([data])
   *   OR fetch('YOUR_GAS_ENDPOINT', { method:'POST', body: JSON.stringify(data) })
   *
   * @param {Object} data - { name, rating, review, timestamp }
   */
  function submitTestimonial(data) {
    console.log("[Coffi House] New Testimonial:", data);

    // TODO: Connect to backend
    // Example (Supabase):
    // const { error } = await supabase.from('testimonials').insert([data]);
    //
    // Example (Google Apps Script POST):
    // await fetch('https://script.google.com/macros/s/YOUR_ID/exec', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });

    const submitBtn = document.getElementById("review-submit-btn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

    // Simulate async delay
    setTimeout(() => {
      if (reviewSuccess) reviewSuccess.removeAttribute("hidden");
      reviewForm.reset();
      if (ratingHint) ratingHint.textContent = "Tap a star to rate";
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';

      // Auto-close modal after 2s
      setTimeout(() => {
        closeModal(reviewModalBackdrop);
        if (reviewSuccess) reviewSuccess.setAttribute("hidden", "");
      }, 2000);
    }, 1200);
  }

  /* ══════════════════════════════════════════════
     9. BOTTOM NAV — Order bubble opens modal
  ══════════════════════════════════════════════ */
  // (bottom-order-btn was already added to orderTriggers above)

  /* ══════════════════════════════════════════════
     HELPERS — Modal open / close
  ══════════════════════════════════════════════ */

  function openModal(backdrop) {
    if (!backdrop) return;
    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // Focus first input inside modal
    setTimeout(() => {
      const firstInput = backdrop.querySelector("input, select, textarea");
      if (firstInput) firstInput.focus();
    }, 320);
  }

  function closeModal(backdrop) {
    if (!backdrop) return;
    backdrop.classList.remove("active");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function closeAllModals() {
    closeModal(orderModalBackdrop);
    closeModal(reviewModalBackdrop);
  }

  /**
   * showFieldError — simple inline validation feedback
   * @param {string} message
   * @param {HTMLElement} [form]
   */
  function showFieldError(message, form) {
    let errEl = (form || document).querySelector(".form-field-error");
    if (!errEl) {
      errEl = document.createElement("p");
      errEl.className = "form-field-error";
      errEl.style.cssText =
        "color:#e05252;font-size:0.85rem;margin-top:8px;display:flex;gap:6px;align-items:center;";
    }
    errEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    const submitBtn = (form || document).querySelector('[type="submit"]');
    if (submitBtn) submitBtn.insertAdjacentElement("afterend", errEl);

    setTimeout(() => errEl.remove(), 4000);
  }

}); // end DOMContentLoaded