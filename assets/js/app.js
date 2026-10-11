function getAppBase() {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);

  const knownPages = [
    "beranda",
    "index",
    "tentang-kami",
    "rumah-dijual",
    "blogs",
    "blog",
    "artikel",
    "mimpi-beli-rumah",
    "pajak-jual-beli-rumah",
    "tips-jual-rumah",
    "harga-pasaran-rumah-2026",
    "luxora",
    "verona",
    "melodia",
    "lapangan-padel",
    "lapangan-tenis",
    "mushola",
    "kontak",
    "contact",
  ];

  if (
    window.location.hostname === "grandontama.com" ||
    window.location.hostname === "www.grandontama.com"
  ) {
    return "/";
  }

  if (pathSegments.length === 0) {
    return "/";
  }

  if (knownPages.includes(pathSegments[0])) {
    return "/";
  }

  return `/${pathSegments[0]}/`;
}

const APP_BASE = getAppBase();

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayout();
  initServiceWorker();
  initGlobalAudio();
  initScrollTop();
  initSmoothScroll();
  initHeroPropertyCarousel();
  initFacilityCarousel();
  initVideoModal();
  initLocationSection();
  initRecaptchaContactForm();
  initTestimonialCarousel();
  initFaqAccordion();
  initAboutTabs();
  initAboutValueCards();
  initCounters();
  initPropertyReadMore();
  initPropertyAccordions();
  initDestinationFilter();
  initVisitModal();
  initShareModal();
  initRelatedPosts();
  initAosAnimations();
});

async function loadLayout() {
  await Promise.all([
    loadPartial("navbar", "navbar.html"),
    loadPartial("footer", "footer.html"),
  ]);

  fixHomeLinks();
  initNavbar();
}

async function loadPartial(id, url) {
  const target = document.getElementById(id);

  if (!target) return;

  const cleanUrl = url.replace(/^\/+/, "");

  const candidates = [`${APP_BASE}${cleanUrl}`, cleanUrl];

  for (const candidateUrl of candidates) {
    try {
      const response = await fetch(candidateUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      target.innerHTML = await response.text();
      return;
    } catch (error) {
      // lanjut coba candidate berikutnya
    }
  }

  console.error(`Gagal memuat ${url}`);
}

function fixHomeLinks() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) return;

    const isHomeLink =
      href === "/" ||
      href === "beranda" ||
      href === "beranda.html" ||
      href === "index" ||
      href === "index.html";

    if (isHomeLink) {
      link.setAttribute("href", APP_BASE);
    }
  });
}

function initNavbar() {
  const topBar = document.querySelector("[data-topbar]");
  const navbar = document.querySelector("[data-navbar]");
  const openButton = document.querySelector("[data-mobile-open]");
  const closeButton = document.querySelector("[data-mobile-close]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  const mobileOverlay = document.querySelector("[data-mobile-overlay]");

  initActiveNavlink();
  initMobileMenu();
  initHideTopbarOnScroll();

  function initMobileMenu() {
    function openMenu() {
      mobilePanel?.classList.remove("translate-x-full");
      mobileOverlay?.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
    }

    function closeMenu() {
      mobilePanel?.classList.add("translate-x-full");
      mobileOverlay?.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }

    openButton?.addEventListener("click", openMenu);
    closeButton?.addEventListener("click", closeMenu);
    mobileOverlay?.addEventListener("click", closeMenu);

    document.querySelectorAll("[data-mobile-panel] a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  function initHideTopbarOnScroll() {
    function updateNavbarPosition() {
      const currentScroll = window.scrollY;
      const pastTopbar = currentScroll > 80;

      if (pastTopbar) {
        topBar?.classList.add("-translate-y-full");

        navbar?.classList.remove("top-[56px]");
        navbar?.classList.add("top-0");
      } else {
        topBar?.classList.remove("-translate-y-full");

        navbar?.classList.remove("top-0");
        navbar?.classList.add("top-[56px]");
      }
    }

    updateNavbarPosition();

    window.addEventListener("scroll", updateNavbarPosition);
  }
}

function initActiveNavlink() {
  const currentPage = getCurrentPage();

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const page = link.dataset.page;

    if (page === currentPage) {
      link.dataset.active = "true";
      link.setAttribute("aria-current", "page");
    } else {
      link.dataset.active = "false";
      link.removeAttribute("aria-current");
    }
  });
}

function getCurrentPage() {
  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean);
  let fileName = segments.pop() || "beranda";

  // Jika URL berakhir dengan folder, contoh:
  // localhost/grand-revamp/
  // maka anggap sebagai beranda
  if (path.endsWith("/")) {
    fileName = "beranda";
  }

  let page = fileName.replace(".html", "");

  // Jika pakai index.html, tetap aktifkan Beranda
  if (page === "index") {
    page = "beranda";
  }

  // Mapping halaman detail properti agar nav "Rumah Dijual" tetap aktif
  const rumahDijualPages = ["rumah-dijual", "luxora", "verona", "melodia"];

  if (rumahDijualPages.includes(page)) {
    return "rumah-dijual";
  }

  // Mapping halaman artikel blog agar nav "Blog" tetap aktif
  const blogPages = [
    "blogs",
    "tips-jual-rumah",
    "harga-pasaran-rumah-2026",
    "mimpi-beli-rumah",
    "pajak-jual-beli-rumah",
    "pemasaran-properti",
    "tips-foto-rumah-dijual",
    "renovasi-sebelum-jual-rumah",
    "cara-jual-rumah-ke-bank",
  ];

  if (
    blogPages.includes(page) ||
    page.startsWith("blog") ||
    page.startsWith("artikel")
  ) {
    return "blogs";
  }

  return page || "beranda";
}

function initScrollTop() {
  const scrollButton = document.getElementById("scrollTopBtn");

  if (!scrollButton) return;

  function toggleScrollButton() {
    const showButton = window.scrollY > 300;

    scrollButton.classList.toggle("opacity-100", showButton);
    scrollButton.classList.toggle("opacity-0", !showButton);
    scrollButton.classList.toggle("pointer-events-auto", showButton);
    scrollButton.classList.toggle("pointer-events-none", !showButton);
  }

  toggleScrollButton();

  window.addEventListener("scroll", toggleScrollButton);

  scrollButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initHeroPropertyCarousel() {
  if (typeof window.jQuery === "undefined") return;

  const carousel = $(".hero-property-carousel");

  if (!carousel.length) return;

  if (window.innerWidth < 1024) {
    return;
  }

  carousel.owlCarousel({
    loop: true,
    margin: 20,
    nav: false,
    dots: false,
    autoplay: false,
    smartSpeed: 650,
    responsive: {
      1024: {
        items: 1.15,
        margin: 20,
        stagePadding: 0,
      },
      1280: {
        items: 1.55,
        margin: 20,
        stagePadding: 0,
      },
    },
  });

  $(".hero-carousel-next")
    .off("click")
    .on("click", function () {
      carousel.trigger("next.owl.carousel");
    });

  $(".hero-carousel-prev")
    .off("click")
    .on("click", function () {
      carousel.trigger("prev.owl.carousel");
    });
}

function initFacilityCarousel() {
  if (typeof window.jQuery === "undefined") return;

  const carousel = $(".facility-carousel");

  if (!carousel.length) return;

  if (carousel.hasClass("owl-loaded")) {
    carousel.trigger("destroy.owl.carousel");
    carousel.removeClass("owl-loaded owl-hidden");
    carousel.find(".owl-stage-outer").children().unwrap();
  }

  carousel.owlCarousel({
    loop: true,
    nav: false,
    dots: false,
    autoplay: false,
    smartSpeed: 650,
    stagePadding: 0,
    responsive: {
      0: {
        items: 1.08,
        margin: 16,
      },
      640: {
        items: 1.35,
        margin: 20,
      },
      1024: {
        items: 2.15,
        margin: 24,
      },
      1280: {
        items: 2.25,
        margin: 28,
      },
      1536: {
        items: 2.35,
        margin: 28,
      },
    },
  });
}

function initVideoModal() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");
  const openButtons = document.querySelectorAll("[data-video-open]");
  const closeButton = document.querySelector("[data-video-close]");

  if (!modal || !video || !openButtons.length) return;

  function openModal(src) {
    video.src = src;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    video.play().catch(() => {
      // Browser bisa menolak autoplay, user tetap bisa klik play manual.
    });
  }

  function closeModal() {
    video.pause();
    video.removeAttribute("src");
    video.load();

    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.dataset.videoSrc;
      if (!src) return;

      openModal(src);
    });
  });

  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function initLocationSection() {
  const slider = document.getElementById("locationImageSlider");
  const cards = document.querySelectorAll("[data-location-card]");
  const dotsWrapper = document.querySelector("[data-location-dots]");

  if (!slider || !cards.length) return;

  let images = [];
  let currentIndex = 0;
  let autoSlideTimer = null;

  function setActiveCard(activeCard) {
    cards.forEach((card) => {
      card.dataset.active = card === activeCard ? "true" : "false";
    });
  }

  function renderImages(newImages) {
    images = newImages;
    currentIndex = 0;

    slider.innerHTML = images
      .map((src, index) => {
        return `
          <img
            src="${src}"
            alt="Lokasi Grand Ontama ${index + 1}"
            class="sm:max-h-157 min-h-full w-full shrink-0 object-cover"
          />
        `;
      })
      .join("");

    renderDots();
    updateSlider();
    restartAutoSlide();
  }

  function renderDots() {
    if (!dotsWrapper) return;

    dotsWrapper.innerHTML = images
      .map((_, index) => {
        return `
          <button
            type="button"
            data-location-dot="${index}"
            class="h-2.5 w-2.5 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"
          }"
            aria-label="Gambar ${index + 1}"
          ></button>
        `;
      })
      .join("");

    dotsWrapper.querySelectorAll("[data-location-dot]").forEach((dot) => {
      dot.addEventListener("click", () => {
        currentIndex = Number(dot.dataset.locationDot);
        updateSlider();
        restartAutoSlide();
      });
    });
  }

  function updateDots() {
    if (!dotsWrapper) return;

    dotsWrapper
      .querySelectorAll("[data-location-dot]")
      .forEach((dot, index) => {
        dot.classList.toggle("bg-white", index === currentIndex);
        dot.classList.toggle("bg-white/50", index !== currentIndex);
      });
  }

  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  }

  function goToNextImage() {
    if (!images.length) return;

    currentIndex = (currentIndex + 1) % images.length;
    updateSlider();
  }

  function restartAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
    }

    if (images.length <= 1) return;

    autoSlideTimer = setInterval(goToNextImage, 3500);
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const imageList = card.dataset.locationImages;

      if (!imageList) return;

      const newImages = imageList.split("|").map((item) => item.trim());

      setActiveCard(card);
      renderImages(newImages);
    });
  });

  const firstCard = cards[0];

  if (firstCard) {
    setActiveCard(firstCard);

    const firstImages = firstCard.dataset.locationImages
      .split("|")
      .map((item) => item.trim());

    renderImages(firstImages);
  }
}

function initRecaptchaContactForm() {
  const form = document.querySelector(
    "#contactForm, form[action*='send-contact.php'], [data-contact-form]"
  );

  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = form.querySelector(
      "button[type='submit'], input[type='submit']"
    );

    const originalButtonText = submitButton ? submitButton.innerHTML : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = "Mengirim...";
    }

    try {
      const recaptchaInput = form.querySelector(
        "[name='g-recaptcha-response'], #recaptchaResponse"
      );

      const recaptchaScript = document.querySelector(
        "script[src*='recaptcha/api.js?render=']"
      );

      const siteKey = recaptchaScript
        ? new URL(recaptchaScript.src).searchParams.get("render")
        : null;

      if (typeof grecaptcha !== "undefined" && siteKey && recaptchaInput) {
        await new Promise((resolve) => grecaptcha.ready(resolve));

        const token = await grecaptcha.execute(siteKey, {
          action: "contact",
        });

        recaptchaInput.value = token;
      }

      const formData = new FormData(form);

      const response = await fetch(form.action || "mailer/send-contact.php", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch (error) {
        throw new Error("Respon server tidak valid.");
      }

      if (result.success) {
        showCustomAlert({
          type: "success",
          title: "Pesan Terkirim",
          message: result.message || "Terima kasih! Pesan Anda telah terkirim.",
          buttonText: "Oke",
        });

        form.reset();
      } else {
        showCustomAlert({
          type: "error",
          title: "Pesan Gagal",
          message: result.message || "Maaf, pesan gagal dikirim.",
          buttonText: "Coba Lagi",
        });
      }
    } catch (error) {
      showCustomAlert({
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        buttonText: "Tutup",
      });

      console.error(error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    }
  });
}

function showCustomAlert({
  type = "success",
  title = "Berhasil",
  message = "Pesan Anda telah terkirim.",
  buttonText = "Oke",
} = {}) {
  const oldAlert = document.querySelector("#custom-alert-overlay");
  if (oldAlert) oldAlert.remove();

  const isSuccess = type === "success";

  const iconClass = isSuccess
    ? "bi bi-check-lg"
    : "bi bi-x-lg";

  const iconWrapperClass = isSuccess
    ? "bg-brand/30 text-brand"
    : "bg-red-100 text-red-700";

  const buttonClass = isSuccess
    ? "bg-brand hover:bg-brand/65"
    : "bg-red-600 hover:bg-red-700";

  const overlay = document.createElement("div");
  overlay.id = "custom-alert-overlay";
  overlay.className =
    "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 opacity-0 transition-opacity duration-300";

  overlay.innerHTML = `
    <div
      id="custom-alert-box"
      class="w-full max-w-md scale-95 rounded-2xl bg-white p-4 text-center shadow-2xl transition-all duration-300"
    >
      <div class="mx-auto my-5 flex h-16 w-16 items-center justify-center rounded-full ${iconWrapperClass}">
        <i class="${iconClass} text-4xl leading-none"></i>
      </div>

      <h3 class=" text-2xl font-medium text-gray-900">
        ${title}
      </h3>

      <p class="mb-7 text-sm leading-relaxed text-gray-600">
        ${message}
      </p>

      <button
        type="button"
        id="custom-alert-close"
        class="mx-auto w-fit rounded-full ${buttonClass} px-6 py-3 font-semibold text-white transition"
      >
        ${buttonText}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const box = overlay.querySelector("#custom-alert-box");
  const closeButton = overlay.querySelector("#custom-alert-close");

  requestAnimationFrame(() => {
    overlay.classList.remove("opacity-0");
    overlay.classList.add("opacity-100");

    box.classList.remove("scale-95");
    box.classList.add("scale-100");
  });

  function closeAlert() {
    overlay.classList.remove("opacity-100");
    overlay.classList.add("opacity-0");

    box.classList.remove("scale-100");
    box.classList.add("scale-95");

    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = "";
    }, 300);
  }

  closeButton.addEventListener("click", closeAlert);

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeAlert();
    }
  });

  document.addEventListener(
    "keydown",
    function handleEsc(event) {
      if (event.key === "Escape") {
        closeAlert();
      }
    },
    { once: true }
  );
}

function initTestimonialCarousel() {
  if (typeof window.jQuery === "undefined") return;

  const carousel = $(".testimonial-carousel");

  if (!carousel.length) return;

  if (carousel.hasClass("owl-loaded")) {
    carousel.trigger("destroy.owl.carousel");
    carousel.removeClass("owl-loaded owl-hidden");
    carousel.find(".owl-stage-outer").children().unwrap();
  }

  carousel.owlCarousel({
    loop: true,
    nav: false,
    dots: false,
    autoplay: false,
    smartSpeed: 650,
    stagePadding: 0,
    responsive: {
      0: {
        items: 1.2,
        margin: 16,
      },
      640: {
        items: 1.25,
        margin: 16,
      },
      1024: {
        items: 2.15,
        margin: 16,
      },
      1280: {
        items: 2.45,
        margin: 16,
      },
      1536: {
        items: 2.55,
        margin: 16,
      },
    },
  });
}

function initFaqAccordion() {
  const faqItems = document.querySelectorAll("[data-faq-item]");

  if (!faqItems.length) return;

  function closeItem(item) {
    const button = item.querySelector("[data-faq-button]");
    const content = item.querySelector("[data-faq-content]");
    const icon = item.querySelector("[data-faq-icon]");
    const title = button?.querySelector("span");
    const text = content?.querySelector("p");

    item.dataset.active = "false";

    item.classList.remove("bg-brand");
    item.classList.add("bg-white");

    content?.classList.add("hidden");

    icon?.classList.remove("bi-dash-lg", "text-white");
    icon?.classList.add("bi-plus-lg", "text-brand");

    title?.classList.remove("text-white");
    title?.classList.add("text-content-title");

    text?.classList.remove("text-white/90");
    text?.classList.add("text-content-grey");
  }

  function openItem(item) {
    const button = item.querySelector("[data-faq-button]");
    const content = item.querySelector("[data-faq-content]");
    const icon = item.querySelector("[data-faq-icon]");
    const title = button?.querySelector("span");
    const text = content?.querySelector("p");

    item.dataset.active = "true";

    item.classList.remove("bg-white");
    item.classList.add("bg-brand");

    content?.classList.remove("hidden");

    icon?.classList.remove("bi-plus-lg", "text-brand");
    icon?.classList.add("bi-dash-lg", "text-white");

    title?.classList.remove("text-content-title");
    title?.classList.add("text-white");

    text?.classList.remove("text-content-grey");
    text?.classList.add("text-white/90");
  }

  faqItems.forEach((item) => {
    const button = item.querySelector("[data-faq-button]");

    button?.addEventListener("click", () => {
      const isActive = item.dataset.active === "true";

      faqItems.forEach(closeItem);

      if (!isActive) {
        openItem(item);
      }
    });
  });

  // Pastikan FAQ ke-2 aktif saat awal.
  const activeItem =
    document.querySelector('[data-faq-item][data-active="true"]') ||
    faqItems[1];

  faqItems.forEach(closeItem);

  if (activeItem) {
    openItem(activeItem);
  }
}

function initAosAnimations() {
  if (typeof AOS === "undefined") return;

  const sections = document.querySelectorAll("main > section");

  sections.forEach((section, index) => {
    // Marquee tetap boleh ikut fade-up.
    // Kalau tidak ingin marquee fade-up, aktifkan kondisi di bawah:
    // if (section.classList.contains("brand-marquee-section")) return;

    section.setAttribute("data-aos", "fade-up");
    section.setAttribute("data-aos-duration", "800");
    section.setAttribute("data-aos-easing", "ease-out-cubic");
    section.setAttribute("data-aos-once", "true");
    section.setAttribute("data-aos-offset", "120");

    // Delay kecil agar section tidak muncul terlalu kaku
    const delay = index === 0 ? 0 : 80;
    section.setAttribute("data-aos-delay", String(delay));
  });

  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 120,
    delay: 0,
  });

  setTimeout(() => {
    AOS.refreshHard();
  }, 500);
}

function initSmoothScroll() {
  const links = document.querySelectorAll("[data-smooth-scroll]");

  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      const extraDown = 30;
      const navbarOffset = 60;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navbarOffset +
        extraDown;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });
  });
}

function initAboutTabs() {
  const tabs = document.querySelectorAll("[data-about-tab]");
  const contents = document.querySelectorAll("[data-about-content]");

  if (!tabs.length || !contents.length) return;

  function activateTab(activeTab) {
    const targetId = activeTab.dataset.aboutTarget;

    tabs.forEach((tab) => {
      tab.dataset.active = tab === activeTab ? "true" : "false";
    });

    contents.forEach((content) => {
      content.classList.toggle("hidden", content.id !== targetId);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  const defaultTab =
    document.querySelector('[data-about-tab][data-active="true"]') || tabs[0];

  activateTab(defaultTab);
}

function initAboutValueCards() {
  const preview = document.getElementById("aboutValuePreview");
  const cards = document.querySelectorAll("[data-about-value-card]");

  if (!preview || !cards.length) return;

  function activateCard(activeCard) {
    cards.forEach((card) => {
      card.dataset.active = card === activeCard ? "true" : "false";
    });

    const img = activeCard.dataset.img;
    const alt = activeCard.dataset.alt || "Nilai inti Grand Ontama";

    if (img) {
      preview.style.opacity = "0";

      setTimeout(() => {
        preview.src = img;
        preview.alt = alt;
        preview.style.opacity = "1";
      }, 180);
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => activateCard(card));
  });

  activateCard(cards[0]);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");

  if (!counters.length) return;

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.counterEnd || 0);
    const duration = 1300;
    const startTime = performance.now();

    function update(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const value = Math.floor(progress * target);

      counter.textContent = String(value);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = String(target);
      }
    }

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.4,
    },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initPropertyReadMore() {
  const buttons = document.querySelectorAll("[data-readmore-button]");

  if (!buttons.length) return;

  buttons.forEach((button) => {
    const targetSelector = button.dataset.target;
    const target = document.querySelector(targetSelector);

    if (!target) return;

    button.addEventListener("click", () => {
      const expanded = target.dataset.expanded === "true";

      target.dataset.expanded = expanded ? "false" : "true";
      target.classList.toggle("line-clamp-3", expanded);

      button.textContent = expanded ? "Read More..." : "Show Less";
    });
  });
}

function initPropertyAccordions() {
  const accordions = document.querySelectorAll("[data-property-accordion]");

  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const button = accordion.querySelector("[data-property-accordion-button]");
    const content = accordion.querySelector(
      "[data-property-accordion-content]",
    );
    const icon = accordion.querySelector("[data-property-accordion-icon]");

    if (!button || !content) return;

    function setState(isOpen) {
      accordion.dataset.active = isOpen ? "true" : "false";
      button.setAttribute("aria-expanded", String(isOpen));

      content.classList.toggle("hidden", !isOpen);
      icon?.classList.toggle("rotate-180", isOpen);
    }

    setState(accordion.dataset.active === "true");

    button.addEventListener("click", () => {
      const isOpen = accordion.dataset.active === "true";
      setState(!isOpen);
    });
  });
}

function initDestinationFilter() {
  const filters = document.querySelectorAll("[data-destination-filter]");
  const items = document.querySelectorAll("[data-destination-item]");

  if (!filters.length || !items.length) return;

  function activateFilter(activeFilter) {
    const category = activeFilter.dataset.destinationFilter;

    filters.forEach((filter) => {
      filter.dataset.active = filter === activeFilter ? "true" : "false";

      filter.classList.toggle("bg-brand", filter === activeFilter);
      filter.classList.toggle("text-white", filter === activeFilter);
      filter.classList.toggle("bg-neutral-100", filter !== activeFilter);
      filter.classList.toggle("text-content-grey", filter !== activeFilter);
    });

    items.forEach((item) => {
      const show = item.dataset.cat === category;

      item.classList.toggle("hidden", !show);
      item.classList.toggle("flex", show);
    });
  }

  filters.forEach((filter) => {
    filter.addEventListener("click", () => activateFilter(filter));
  });

  const activeFilter =
    document.querySelector('[data-destination-filter][data-active="true"]') ||
    filters[0];

  activateFilter(activeFilter);
}

function initVisitModal() {
  const modal = document.getElementById("visitModal");
  const openButton = document.getElementById("openVisitModal");
  const submitButton = document.getElementById("vmSubmit");
  const dateInput = document.getElementById("vmDate");
  const notesInput = document.getElementById("vmNotes");

  if (!modal || !openButton) return;

  function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
  }

  openButton.addEventListener("click", openModal);

  modal
    .querySelectorAll('[data-modal-close="visitModal"]')
    .forEach((button) => {
      button.addEventListener("click", closeModal);
    });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  submitButton?.addEventListener("click", () => {
    const dateValue = dateInput?.value || "";
    const notesValue = notesInput?.value || "";
    const propertyName =
      document.querySelector("[data-property-name]")?.dataset.propertyName ||
      "Grand Ontama";

    const message = encodeURIComponent(
      `Halo Grand Ontama, saya ingin jadwalkan kunjungan rumah ${propertyName}.\nTanggal: ${dateValue || "-"
      }\nCatatan: ${notesValue || "-"}`,
    );

    window.open(`https://wa.me/6285888090888?text=${message}`, "_blank");
  });
}

function initShareModal() {
  const modal = document.getElementById("shareModal");
  const openButton = document.getElementById("lxShare");
  const linkInput = document.getElementById("smLinkInput");
  const copyButton = document.getElementById("smCopyButton");
  const toast = document.getElementById("smToast");

  if (!modal || !openButton) return;

  const pageUrl = window.location.href;
  const pageTitle = document.title;

  function openModal() {
    if (linkInput) linkInput.value = pageUrl;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
  }

  function getShareUrl(app) {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(pageTitle);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      instagram: `https://www.instagram.com/`,
      tiktok: `https://www.tiktok.com/`,
      discord: `https://discord.com/`,
    };

    return urls[app] || pageUrl;
  }

  openButton.addEventListener("click", openModal);

  modal
    .querySelectorAll('[data-modal-close="shareModal"]')
    .forEach((button) => {
      button.addEventListener("click", closeModal);
    });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  modal.querySelectorAll("[data-share-app]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const app = link.dataset.shareApp;

      if (!app) return;

      event.preventDefault();
      window.open(getShareUrl(app), "_blank", "noopener,noreferrer");
    });
  });

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      linkInput?.select();
      document.execCommand("copy");
    }

    toast?.classList.remove("hidden");

    setTimeout(() => {
      toast?.classList.add("hidden");
    }, 1600);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (!modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

const BLOG_POSTS = [
  {
    slug: "mimpi-beli-rumah",
    href: "mimpi-beli-rumah",
    date: "Kamis • 28 Mei 2026",
    image: "assets/img/thumbnail-blog/sampul-mimpi-beli-rumah.webp",
    alt: "mimpi-beli-rumah",
    title: "Arti Mimpi Membeli Rumah Baru Menurut Primbon Jawa dan Islam",
    excerpt:
      "Temukan jawaban lengkap di balik mimpi beli rumah. Simak arti mimpi membeli rumah dari sudut pandang psikologi hingga kondisi rumahnya di sini!",
  },
  {
    slug: "pajak-jual-beli-rumah",
    href: "pajak-jual-beli-rumah",
    date: "Selasa • 19 Mei 2026",
    image: "assets/img/thumbnail-blog/sampul-pajak-jual-beli-rumah.webp",
    alt: "pajak-jual-beli-rumah",
    title: "Pajak Jual Beli Rumah Terbaru: Detail Tarif & Cara Hitungnya",
    excerpt:
      "Ingin transaksi properti aman? Simak rincian pajak jual beli rumah untuk penjual & pembeli, aturan tarif terbaru, serta simulasi cara menghitungnya!",
  },
  {
    slug: "tips-jual-rumah",
    href: "tips-jual-rumah",
    date: "Senin • 23 Mar 2026",
    image: "assets/img/thumbnail-blog/tips-jual-rumah.webp",
    alt: "tips-jual-rumah",
    title: "Persiapan Jual Rumah untuk Menarik Calon Pembeli Potensial",
    excerpt:
      "Persiapan Jual Rumah untuk Menarik Calon Pembeli Potensial. Menjual properti di tengah persaingan pasar yang ketat memerlukan strategi yang tepat.",
  },
  {
    slug: "harga-pasaran-rumah-2026",
    href: "harga-pasaran-rumah-2026",
    date: "Senin • 12 Jan 2026",
    image: "assets/img/thumbnail-blog/harga-pasaran-rumah-2026.webp",
    alt: "harga-pasaran-rumah-2026",
    title: "Cara Menentukan Harga Jual Rumah yang Tepat agar Cepat Laku",
    excerpt:
      "Menjual rumah bukan hanya soal pasang papan “Dijual” di depan pagar. Salah satu faktor terpenting agar rumah cepat terjual adalah menentukan harga yang tepat.",
  },
];

function getCurrentPostSlug() {
  const fromDataset = document.querySelector("[data-current-post]")?.dataset
    .currentPost;

  if (fromDataset) return fromDataset;

  const pathname = window.location.pathname;
  const filename = pathname.split("/").filter(Boolean).pop() || "";

  return filename.replace(".html", "");
}

function createRelatedPostCard(post) {
  return `
    <article
      class="w-[78vw] shrink-0 overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl sm:w-[46vw] md:w-[42vw] lg:w-auto lg:shrink"
    >
      <div>
        <img
          src="${post.image}"
          alt="${post.alt}"
          class="h-56 w-full object-cover"
        />

        <div class="p-5">
          <span class="text-xs font-medium text-content-grey">
            ${post.date}
          </span>

          <h3
            class="lg:mt-3 line-clamp-2 text-xl font-semibold leading-6.2 text-content-title"
          >
            ${post.title}
          </h3>

          <p
            class="mt-4 line-clamp-2 text-base leading-6.2 text-content-grey"
          >
            ${post.excerpt}
          </p>

          <a
            href="${post.href}"
            aria-label="Baca artikel ${post.title}"
            class="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 lg:px-7 lg:py-3 text-base font-medium text-white transition hover:bg-brand-dark hover:gap-3"
          >
            Read More
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </article>
  `;
}

function initRelatedPosts() {
  const container = document.querySelector("[data-related-posts]");
  if (!container) return;

  const currentSlug = getCurrentPostSlug();

  const relatedPosts = BLOG_POSTS.filter(
    (post) => post.slug !== currentSlug,
  ).slice(0, 3);

  container.innerHTML = relatedPosts.map(createRelatedPostCard).join("");

  if (window.AOS) {
    AOS.refreshHard();
  }
}

function initGlobalAudio() {
  if (window.__grandAudioInit) return;
  window.__grandAudioInit = true;

  const TIME_KEY = "grand_ontama_audio_time";
  const PREF_KEY = "grand_ontama_audio_pref";
  const AUDIO_SRC = `${APP_BASE}assets/audio/Grand_Ontama.mp3`;

  let audio = null;
  let saveTimer = null;
  let hasRestoredTime = false;

  function loadPref() {
    try {
      return JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function savePref(pref) {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(pref || {}));
    } catch (error) { }
  }

  function getSavedTime() {
    try {
      const savedTime = parseFloat(localStorage.getItem(TIME_KEY));

      if (Number.isFinite(savedTime) && savedTime > 0) {
        return savedTime;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  function ensureAudio() {
    if (audio) return audio;

    audio = document.getElementById("site-music");

    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "site-music";
      audio.loop = true;
      audio.preload = "metadata";
      audio.setAttribute("playsinline", "");
      audio.style.display = "none";

      const source = document.createElement("source");
      source.src = AUDIO_SRC;
      source.type = "audio/mpeg";

      audio.appendChild(source);
      document.body.appendChild(audio);
    }

    audio.muted = false;
    audio.volume = 1;

    return audio;
  }

  function restoreAudioTime(audioElement) {
    if (!audioElement || hasRestoredTime) return;

    const savedTime = getSavedTime();

    if (!savedTime) return;

    function applySavedTime() {
      try {
        audioElement.currentTime = savedTime;
        hasRestoredTime = true;
      } catch (error) { }
    }

    if (audioElement.readyState >= 1) {
      applySavedTime();
    } else {
      audioElement.addEventListener("loadedmetadata", applySavedTime, {
        once: true,
      });
    }
  }

  function saveAudioTime(audioElement = audio) {
    if (!audioElement || audioElement.ended) return;

    try {
      const currentTime = audioElement.currentTime;

      if (Number.isFinite(currentTime) && currentTime > 0) {
        localStorage.setItem(TIME_KEY, String(currentTime));
      }
    } catch (error) { }
  }

  function startSavingAudioTime(audioElement) {
    if (saveTimer) return;

    saveTimer = setInterval(() => {
      saveAudioTime(audioElement);
    }, 500);

    audioElement.addEventListener("timeupdate", () => {
      saveAudioTime(audioElement);
    });
  }

  async function playAudio({ fromInteraction = false } = {}) {
    const audioElement = ensureAudio();

    restoreAudioTime(audioElement);

    try {
      await audioElement.play();

      savePref({
        hasStartedMusic: true,
      });

      startSavingAudioTime(audioElement);
      removeInteractionListeners();
    } catch (error) {
      if (!fromInteraction) {
        addInteractionListeners();
      }
    }
  }

  function handleFirstInteraction() {
    playAudio({
      fromInteraction: true,
    });
  }

  function addInteractionListeners() {
    window.addEventListener("scroll", handleFirstInteraction, true);
    window.addEventListener("wheel", handleFirstInteraction, true);
    window.addEventListener("touchmove", handleFirstInteraction, true);
    window.addEventListener("pointerdown", handleFirstInteraction, true);
    window.addEventListener("mousedown", handleFirstInteraction, true);
    window.addEventListener("click", handleFirstInteraction, true);
    window.addEventListener("touchstart", handleFirstInteraction, true);
    window.addEventListener("keydown", handleFirstInteraction, true);
  }

  function removeInteractionListeners() {
    window.removeEventListener("scroll", handleFirstInteraction, true);
    window.removeEventListener("wheel", handleFirstInteraction, true);
    window.removeEventListener("touchmove", handleFirstInteraction, true);
    window.removeEventListener("pointerdown", handleFirstInteraction, true);
    window.removeEventListener("mousedown", handleFirstInteraction, true);
    window.removeEventListener("click", handleFirstInteraction, true);
    window.removeEventListener("touchstart", handleFirstInteraction, true);
    window.removeEventListener("keydown", handleFirstInteraction, true);
  }

  function isInternalLink(link) {
    if (!link || !link.href) return false;

    try {
      const url = new URL(link.href, window.location.href);

      return (
        url.origin === window.location.origin &&
        url.protocol !== "tel:" &&
        url.protocol !== "mailto:" &&
        !link.hasAttribute("download") &&
        link.target !== "_blank"
      );
    } catch (error) {
      return false;
    }
  }

  function saveBeforeNavigation(event) {
    const link = event.target.closest("a");

    if (!isInternalLink(link)) return;

    saveAudioTime(audio);
  }

  document.addEventListener("touchstart", saveBeforeNavigation, true);
  document.addEventListener("pointerdown", saveBeforeNavigation, true);
  document.addEventListener("click", saveBeforeNavigation, true);

  window.addEventListener("pagehide", () => {
    saveAudioTime(audio);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveAudioTime(audio);
    }
  });

  const pref = loadPref();

  if (pref.hasStartedMusic) {
    playAudio({
      fromInteraction: false,
    });
  } else {
    addInteractionListeners();
  }
}

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        `${APP_BASE}sw.js`
      );

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("Versi baru website tersedia.");
          }
        });
      });

      console.log("Service worker aktif:", registration.scope);
    } catch (error) {
      console.warn("Service worker gagal didaftarkan:", error);
    }
  });
}