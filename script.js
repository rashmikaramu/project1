/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Theme toggle (remembers choice) ---------- */
const root = document.documentElement;
const themeBtn = $(".theme-toggle");

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "Light" : "Dark";
  try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) { /* ignore */ }
applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

/* ---------- Mobile menu ---------- */
const navToggle = $(".nav-toggle");
const nav = $(".nav");

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
$$(".nav a").forEach(link =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Hero: API response typed out ---------- */
const developer = {
  name: "Aarav Raman",
  role: "Full Stack Developer",
  location: "Coimbatore, India",
  yearsExperience: 4,
  stack: ["React", "Node.js", "PostgreSQL"],
  openToWork: true,
  contact: "aarav@example.com"
};

// Turn the object into colored HTML so keys, strings and numbers are easy to read
function renderJSON(obj, indent = 1) {
  const pad = "  ".repeat(indent);
  const lines = Object.entries(obj).map(([key, value]) => {
    let out;
    if (Array.isArray(value)) {
      out = "[" + value.map(v => `<span class="t-str">"${v}"</span>`).join(", ") + "]";
    } else if (typeof value === "string") {
      out = `<span class="t-str">"${value}"</span>`;
    } else {
      out = `<span class="t-num">${value}</span>`;
    }
    return `${pad}<span class="t-key">"${key}"</span>: ${out}`;
  });
  return "{\n" + lines.join(",\n") + "\n}";
}

const output = $("#terminal-output");
const status = '<span class="t-num">200 OK</span>\n\n';
const fullHTML = status + renderJSON(developer);

// Typing reveals the final HTML character by character, without breaking tags
function typeHTML(html, el, speed = 12) {
  let i = 0;
  const caret = '<span class="caret"></span>';
  (function step() {
    // Jump over a whole tag at once
    if (html[i] === "<") i = html.indexOf(">", i) + 1;
    else i++;
    el.innerHTML = html.slice(0, i) + caret;
    if (i < html.length) setTimeout(step, speed);
  })();
}

if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  output.innerHTML = fullHTML;
} else {
  typeHTML(fullHTML, output);
}

/* ---------- Project filters ---------- */
const filterButtons = $$(".filter");
const projects = $$(".project");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const type = btn.dataset.filter;
    projects.forEach(card => {
      card.hidden = type !== "all" && card.dataset.type !== type;
    });
  });
});

/* ---------- Contact form ---------- */
const form = $("#contact-form");
const formStatus = $("#form-status");

const rules = {
  name: v => v.trim().length >= 2 || "Enter your name.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address, like name@example.com.",
  message: v => v.trim().length >= 10 || "Write at least 10 characters so I know how to help."
};

function validateField(field) {
  const result = rules[field.name](field.value);
  const errorEl = $(`.error[data-for="${field.name}"]`);
  const valid = result === true;
  errorEl.textContent = valid ? "" : result;
  field.classList.toggle("invalid", !valid);
  return valid;
}

$$("input, textarea", form).forEach(field =>
  field.addEventListener("blur", () => validateField(field))
);

form.addEventListener("submit", async event => {
  event.preventDefault();
  formStatus.textContent = "";

  const fields = $$("input, textarea", form);
  const allValid = fields.map(validateField).every(Boolean);
  if (!allValid) {
    fields.find(f => f.classList.contains("invalid")).focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  const button = $("button[type=submit]", form);
  button.disabled = true;
  button.textContent = "Sending…";

  try {
    /* Connect your backend here. Example:
       const res = await fetch("/api/contact", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data)
       });
       if (!res.ok) throw new Error("Request failed");
    */
    await new Promise(resolve => setTimeout(resolve, 600)); // demo delay
    console.log("Form data ready to send:", data);
    formStatus.textContent = "Message sent. I’ll reply within a day.";
    form.reset();
  } catch (err) {
    formStatus.textContent = "Message not sent. Check your connection and try again.";
  } finally {
    button.disabled = false;
    button.textContent = "Send message";
  }
});
