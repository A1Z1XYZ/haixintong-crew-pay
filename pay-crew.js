const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const calculator = document.querySelector("[data-calculator]");
const savingOutput = document.querySelector("[data-saving-output]");
const monthlySaving = document.querySelector("[data-monthly-saving]");
const yearlySaving = document.querySelector("[data-yearly-saving]");

const money = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

function updateHeader() {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 54);
}

function toggleNavigation(forceOpen) {
  if (!nav || !navToggle || !header) return;

  const open =
    typeof forceOpen === "boolean"
      ? forceOpen
      : !nav.classList.contains("is-open");

  nav.classList.toggle("is-open", open);
  header.classList.toggle("nav-active", open);
  document.body.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
}

function calculateSavings() {
  if (!calculator) return;

  const values = new FormData(calculator);
  const crew = Number(values.get("crew")) || 0;
  const transfers = Number(values.get("transfers")) || 0;
  const fee = Number(values.get("fee")) || 0;
  const cash = Number(values.get("cash")) || 0;
  const saving = Number(values.get("saving")) || 0;
  const monthly = Math.round(
    (crew * transfers * fee + cash) * (saving / 100),
  );

  if (savingOutput) savingOutput.textContent = `${saving}%`;
  if (monthlySaving) monthlySaving.textContent = money.format(monthly);
  if (yearlySaving) {
    yearlySaving.textContent = `年化约 ${money.format(monthly * 12)}`;
  }
}

function bindFaq() {
  document.querySelectorAll(".faq-list details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}

function bindForms() {
  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-form-status]");

      if (status) {
        status.textContent = "已收到，我们会尽快联系您安排演示。";
      }

      form.reset();
    });
  });
}

function bindReveal() {
  const targets = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  document.documentElement.classList.add("reveal-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -36px" },
  );

  targets.forEach((target) => observer.observe(target));
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (navToggle) {
  navToggle.addEventListener("click", () => toggleNavigation());
}

if (nav) {
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleNavigation(false));
  });
}

if (calculator) {
  calculator.addEventListener("input", calculateSavings);
  calculateSavings();
}

bindFaq();
bindForms();
bindReveal();

