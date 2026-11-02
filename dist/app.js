"use strict";
const $ = (s, root = document) => root.querySelector(s);

const menuToggle = $(".menu-toggle");
const mainNav = $("#main-nav");
const mobileMenu = matchMedia("(max-width: 760px)");
function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fermer la navigation" : "Ouvrir la navigation");
  mainNav.inert = mobileMenu.matches && !open;
}
function closeMenu(restoreFocus = false) {
  setMenu(false);
  if (restoreFocus) menuToggle.focus();
}
menuToggle.hidden = false;
document.documentElement.classList.add("menu-ready");
setMenu(false);
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  setMenu(!open);
});
mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true")
    closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header")) closeMenu();
});
document.addEventListener("focusin", (event) => {
  if (!event.target.closest(".header")) closeMenu();
});
mobileMenu.addEventListener("change", () => {
  const focusHidden = mobileMenu.matches && mainNav.contains(document.activeElement);
  closeMenu(focusHidden);
});

const themeMedia = matchMedia("(prefers-color-scheme: dark)");
let manualTheme = null;
try {
  const saved = localStorage.getItem("eri-theme");
  if (saved === "light" || saved === "dark") manualTheme = saved;
} catch {}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const dark = theme === "dark",
    label = dark ? "Activer le mode clair" : "Activer le mode sombre";
  const toggle = $("#theme-toggle");
  toggle.setAttribute("aria-label", label);
  toggle.setAttribute("title", label);
  toggle.setAttribute("aria-pressed", String(dark));
  $('meta[name="theme-color"]').content = dark ? "#0f1720" : "#f5f4f0";
  $('link[rel="icon"]').href = dark
    ? "assets/logo-symbol-grey.svg"
    : "assets/logo-symbol-navy.svg";
}
applyTheme(manualTheme || (themeMedia.matches ? "dark" : "light"));
$("#theme-toggle").addEventListener("click", () => {
  manualTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("eri-theme", manualTheme);
  } catch {}
  applyTheme(manualTheme);
});
const followSystemTheme = (e) => {
  if (!manualTheme) applyTheme(e.matches ? "dark" : "light");
};
if (themeMedia.addEventListener)
  themeMedia.addEventListener("change", followSystemTheme);
else themeMedia.addListener(followSystemTheme);

$("#year").textContent = new Date().getFullYear();
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
$("#back-top").addEventListener("click", () => {
  $("#accueil").scrollIntoView({
    behavior: reducedMotion.matches ? "instant" : "smooth",
  });
  $(".wordmark").focus({ preventScroll: true });
});
// Deux plans dans le document : le texte défile normalement ;
// Le logo compense 65 % du scroll, limité aux deux premiers écrans.
const logoLayer = $(".brand-background img");
let depthFrame = 0;
function renderDepth() {
  depthFrame = 0;
  const distance = Math.max(0, scrollY);
  const compensation = reducedMotion.matches ? 0 : Math.min(distance, innerHeight * 2) * 0.65;
  logoLayer.style.setProperty("--depth-y", `${compensation.toFixed(2)}px`);
}
function requestDepth() {
  if (!depthFrame && !document.hidden)
    depthFrame = requestAnimationFrame(renderDepth);
}
addEventListener("scroll", requestDepth, { passive: true });
addEventListener("resize", requestDepth, { passive: true });
function syncDepthPreference() {
  if (depthFrame) cancelAnimationFrame(depthFrame);
  depthFrame = 0;
  renderDepth();
}
if (reducedMotion.addEventListener)
  reducedMotion.addEventListener("change", syncDepthPreference);
else reducedMotion.addListener(syncDepthPreference);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (depthFrame) cancelAnimationFrame(depthFrame);
    depthFrame = 0;
  } else renderDepth();
});
renderDepth();
const chat = $("#chat-dialog");
document.querySelectorAll("[data-open-chat]").forEach((b) =>
  b.addEventListener("click", () => {
    chat.showModal();
    $("#chat-input").focus();
  }),
);
$("#privacy-open").addEventListener("click", () =>
  $("#privacy-dialog").showModal(),
);
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelector(".close-dialog")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    if (
      e.target === dialog &&
      (e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom)
    )
      dialog.close();
  });
});
const answers = {
  informatique: {
    text: "Nous accompagnons la maintenance de vos postes, serveurs et logiciels. Parlons de vos équipements et de votre besoin.",
    href: "#expertises",
    label: "Explorer nos expertises",
    section: 0,
  },
  cloud: {
    text: "Sauvegarde, protection des postes et e-mails, hébergement et travail à distance : nous étudions votre environnement pour définir une solution adaptée.",
    href: "#expertises",
    label: "Cloud & sécurité",
    section: 1,
  },
  developpement: {
    text: "Un site web, une application métier ou une connexion entre vos logiciels ? Nous pouvons étudier votre idée avec vous.",
    href: "#expertises",
    label: "Notre approche du développement",
    section: 6,
  },
  assistance: {
    text: "Déjà client ? Retrouvez le portail d’assistance, ou appelez le 04 77 23 91 70. Cette démo ne crée pas de ticket.",
    href: "https://e-r-i.freshdesk.com/",
    label: "Rejoindre l’assistance",
  },
  contact: {
    text: "Vous pouvez nous joindre au 04 77 23 91 70 ou à contact@e-r-i.fr. Nous sommes au 4 rue Jean Jaurès à Roanne.",
    href: "#contact",
    label: "Nos coordonnées",
  },
  unknown: {
    text: "Je suis une démonstration avec des réponses préparées. Pour préciser une offre, un tarif ou un délai, le mieux est d’échanger avec l’équipe.",
    href: "#contact",
    label: "Parler à E-R.I",
  },
};
const log = $("#chat-log");
function addMessage(text, kind, answer) {
  const node = document.createElement("div");
  node.className = `message ${kind}`;
  node.textContent = text;
  if (answer) {
    const a = document.createElement("a");
    a.href = answer.href;
    if (answer.href === "#expertises" && !$("#expertises"))
      a.href = "index.html#expertises";
    a.textContent = answer.label + " ↗";
    if (answer.href.startsWith("#"))
      a.addEventListener("click", () => {
        if (answer.section !== undefined) {
          document
            .querySelectorAll(".expertise")
            .forEach((d, i) => (d.open = i === answer.section));
        }
        chat.close();
      });
    else {
      a.target = "_blank";
      a.rel = "noopener";
    }
    node.append(a);
  }
  log.append(node);
  while (log.children.length > 24) log.firstElementChild.remove();
  log.scrollTop = log.scrollHeight;
}
function reply(text, topic) {
  addMessage(text, "user");
  const answer = answers[topic] || answers.unknown;
  addMessage(answer.text, "bot", answer);
}
$(".chat-choices")
  .querySelectorAll("button")
  .forEach((b) =>
    b.addEventListener("click", () => reply(b.textContent, b.dataset.topic)),
  );
function classify(text) {
  const s = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/prix|tarif|devis|cout|delai/.test(s)) return "unknown";
  if (/panne|assistance|support|probleme|ticket/.test(s)) return "assistance";
  if (/site|web|application|develop|api|code/.test(s)) return "developpement";
  if (
    /cloud|secur|sauvegarde|virus|donnee|mailinblack|heberg|distance|teletravail/.test(
      s,
    )
  )
    return "cloud";
  if (/maint|parc|infoger|ordinateur|logiciel|compta|ebp|microsoft/.test(s))
    return "informatique";
  if (/contact|appel|horaire|adresse|roanne|telephone|bonjour|salut/.test(s))
    return "contact";
  return "unknown";
}
$("#chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#chat-input"),
    text = input.value.trim();
  if (!text) return;
  reply(text, classify(text));
  input.value = "";
  input.focus();
});
// Compatibilité : un seul accordéon ouvert, même sans prise en charge de details[name].
document.querySelectorAll(".expertise").forEach((detail) =>
  detail.addEventListener("toggle", () => {
    if (detail.open)
      document.querySelectorAll(".expertise").forEach((other) => {
        if (other !== detail) other.open = false;
      });
  }),
);

// Apparitions propres à chaque section. Sans JavaScript, tout reste visible.
const motionGroups = [
  { selector: ".hero-topline", style: "fade", duration: 950 },
  { selector: ".hero h1", style: "title", duration: 1850, origin: "20% 50%" },
  { selector: ".hero h1 > span", style: "line", duration: 1550, delay: 180 },
  { selector: ".hero-baseline", style: "fade", duration: 1300, delay: 270 },
  {
    selector: ".expertises .section-intro",
    style: "horizontal",
    duration: 1550,
    origin: "left center",
  },
  {
    selector: ".expertise",
    style: "row",
    duration: 1450,
    stagger: 130,
    origin: "left center",
  },
  { selector: ".about > .label", style: "fade", duration: 950 },
  {
    selector: ".about-content > h2",
    style: "soft",
    duration: 1700,
    origin: "left center",
  },
  {
    selector: ".about-bottom",
    style: "soft",
    duration: 1550,
    delay: 130,
    origin: "left top",
  },
  { selector: ".reviews-heading", style: "fade", duration: 1000 },
  {
    selector: ".review-grid figure",
    style: "quote",
    duration: 1600,
    stagger: 160,
  },
  { selector: ".reviews-source", style: "fade", duration: 950 },
  { selector: ".contact > .label", style: "fade", duration: 950 },
  {
    selector: ".contact-title h2",
    style: "rise",
    duration: 1950,
    origin: "left center",
  },
  {
    selector: ".contact-title > span",
    style: "arrow",
    duration: 1450,
    delay: 160,
  },
  { selector: ".contact-bottom", style: "fade", duration: 1300, delay: 160 },
];
const motionFrames = {
  fade: [{ opacity: 0 }, { opacity: 1 }],
  // Dézoom du titre : le texte se pose dans le premier plan.
  title: [
    { opacity: 0, transform: "scale(1.035)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  line: [
    { opacity: 0, transform: "translateY(10px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  // Zoom des expertises, avec une translation secondaire très courte.
  horizontal: [
    { opacity: 0, transform: "translateX(-10px) scale(.98)" },
    { opacity: 1, transform: "translateX(0) scale(1)" },
  ],
  row: [
    { opacity: 0, transform: "translateY(8px) scale(.985)" },
    { opacity: 1, transform: "translateY(0) scale(1)" },
  ],
  // Présentation : zoom doux, sans translation.
  soft: [
    { opacity: 0, transform: "scale(.975)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  // Avis : dézoom léger pour contraster avec la présentation.
  quote: [
    { transform: "translateX(32px)" },
    { transform: "translateX(0)" },
  ],
  // Contact : dézoom plus lent, accompagné d’une remontée de 8 px.
  rise: [
    { opacity: 0, transform: "translateY(8px) scale(1.04)" },
    { opacity: 1, transform: "translateY(0) scale(1)" },
  ],
  arrow: [
    { opacity: 0, transform: "translate(-8px,8px) scale(.94)" },
    { opacity: 1, transform: "translate(0,0) scale(1)" },
  ],
};
const motionTargets = new Map(),
  runningMotion = new Set();
let sectionObserver = null;
function enterElement(element) {
  const config = motionTargets.get(element);
  if (!config || element.dataset.motionDone) return;
  element.dataset.motionDone = "true";
  sectionObserver?.unobserve(element);
  if (
    reducedMotion.matches ||
    !element.animate ||
    element.contains(document.activeElement)
  )
    return;
  const animation = element.animate(
    motionFrames[config.style].map((frame) => ({
      ...frame,
      transformOrigin: config.origin || "center center",
    })),
    {
      duration: config.duration,
      delay: config.delay || 0,
      easing:
        config.style === "fade" ? "ease-in-out" : "cubic-bezier(.22,.35,.3,1)",
      fill: "backwards",
    },
  );
  runningMotion.add(animation);
  // Libérer l’effet après lecture pour laisser les survols et états natifs agir.
  animation.finished
    .then(() => {
      runningMotion.delete(animation);
      animation.cancel();
    })
    .catch(() => runningMotion.delete(animation));
}
if ("IntersectionObserver" in window && Element.prototype.animate) {
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) enterElement(entry.target);
      });
    },
    { threshold: 0.06, rootMargin: "0px 0px 35px 0px" },
  );
  motionGroups.forEach((config) =>
    document.querySelectorAll(config.selector).forEach((element, index) => {
      element.dataset.motion = config.style;
      motionTargets.set(element, {
        ...config,
        delay: (config.delay || 0) + (config.stagger || 0) * index,
      });
      if (element.getBoundingClientRect().bottom <= 0)
        element.dataset.motionDone = "true";
      else sectionObserver.observe(element);
    }),
  );
}
// Ne jamais faire attendre un contrôle atteint au clavier.
document.addEventListener("focusin", (event) => {
  for (const [element] of motionTargets)
    if (element.contains(event.target)) {
      element.dataset.motionDone = "true";
      sectionObserver?.unobserve(element);
      for (const animation of element.getAnimations())
        if (runningMotion.has(animation)) {
          runningMotion.delete(animation);
          animation.cancel();
        }
    }
});
function stopSectionMotion() {
  if (!reducedMotion.matches) return;
  for (const animation of runningMotion) animation.cancel();
  runningMotion.clear();
  for (const [element] of motionTargets) {
    element.dataset.motionDone = "true";
    sectionObserver?.unobserve(element);
  }
}
if (reducedMotion.addEventListener)
  reducedMotion.addEventListener("change", stopSectionMotion);
else reducedMotion.addListener(stopSectionMotion);
stopSectionMotion();


(() => {
  const section = $(".reviews");
  if (!section) return;
  const grid = $(".review-grid", section);
  const slides = [...grid.children];
  const viewport = document.createElement("div");
  viewport.className = "review-viewport";
  grid.before(viewport);
  viewport.append(grid);
  grid.classList.add("review-track");
  slides.forEach((slide) => {
    const quote = $("blockquote", slide);
    quote.tabIndex = 0;
    quote.setAttribute("aria-label", "Avis de " + $("figcaption", slide).firstChild.textContent.trim());
  });
  const controls = $(".review-controls", section);
  const pause = $('[data-review="pause"]', controls);
  const position = $(".review-position", controls);
  const mobile = matchMedia("(max-width: 760px)");
  let index = 0;
  let paused = reducedMotion.matches;
  let timer;
  let slideAnimation;
  const count = () => mobile.matches ? 1 : 2;
  function render(animate = true) {
    const previous = getComputedStyle(grid).transform;
    slideAnimation?.cancel();
    slides.forEach((slide, i) => {
      const inactive = i < index || i >= index + count();
      slide.inert = inactive;
      slide.setAttribute("aria-hidden", String(inactive));
    });
    const step = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(grid).columnGap);
    const transform = `translateX(${-index * step}px)`;
    grid.style.transform = transform;
    if (animate && !reducedMotion.matches && grid.animate) {
      slideAnimation = grid.animate([{ transform: previous }, { transform }], {
        duration: 450,
        easing: "cubic-bezier(.22, 1, .36, 1)",
      });
    }
    position.textContent = (index + 1) + "–" + Math.min(index + count(), slides.length) + " / " + slides.length;
  }
  function schedule() {
    clearInterval(timer);
    const label = paused ? "Reprendre le défilement" : "Mettre en pause";
    pause.setAttribute("aria-label", label);
    pause.title = label;
    $("path", pause).setAttribute("d", paused ? "M4 2l10 6-10 6z" : "M4 2h3v12H4zm5 0h3v12H9z");
    if (!paused && !reducedMotion.matches && !document.hidden &&
        !section.matches(":hover") && !section.contains(document.activeElement)) {
      timer = setInterval(() => { index = (index + count()) % slides.length; render(); }, 6500);
    }
  }
  controls.addEventListener("click", (event) => {
    const action = event.target.closest("button")?.dataset.review;
    if (!action) return;
    if (action === "pause") paused = !paused;
    else {
      index = (index + (action === "next" ? count() : -count()) + slides.length) % slides.length;
      render();
    }
    schedule();
  });
  section.addEventListener("mouseenter", schedule);
  section.addEventListener("mouseleave", schedule);
  section.addEventListener("focusin", schedule);
  section.addEventListener("focusout", () => setTimeout(schedule, 0));
  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", () => { slideAnimation?.cancel(); paused = reducedMotion.matches; schedule(); });
  mobile.addEventListener("change", () => { index = 0; render(false); schedule(); });
  addEventListener("resize", () => render(false), { passive: true });
  controls.hidden = false;
  render(false);
  schedule();
})();
