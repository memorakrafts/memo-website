/* ==========================================================================
   Memorakrafts: site behaviour
   ========================================================================== */

/* ---------- Hamper gallery data ---------- */
const hampers = [
  { n: "01", title: "Festive Copper Hamper", cat: "festive", label: "Festive" },
  { n: "02", title: "Executive Diary Hamper", cat: "corporate", label: "Corporate" },
  { n: "03", title: "Executive Carry Hamper", cat: "corporate", label: "Corporate" },
  { n: "04", title: "Traveller’s Sweets Hamper", cat: "corporate", label: "Corporate" },
  { n: "05", title: "Festive Celebration Hamper", cat: "festive", label: "Festive" },
  { n: "06", title: "Heritage Copper Hamper", cat: "festive", label: "Festive" },
  { n: "07", title: "Mugs & Greens Hamper", cat: "corporate", label: "Corporate" },
  { n: "08", title: "Modern Gentleman Hamper", cat: "corporate", label: "Corporate" },
  { n: "09", title: "Cozy Comfort Hamper", cat: "corporate", label: "Corporate" },
  { n: "10", title: "Welcome to the Family", cat: "welcome", label: "Welcome Kit" },
  { n: "11", title: "Personalised Welcome Kit", cat: "welcome", label: "Welcome Kit" },
  { n: "12", title: "Welcome Aboard Hamper", cat: "welcome", label: "Welcome Kit" },
  { n: "13", title: "Festive Gourmet Hamper", cat: "gourmet", label: "Gourmet" }
];

const grid = document.getElementById("grid");

hampers.forEach(h => {
  const card = document.createElement("article");
  card.className = "card reveal";
  card.dataset.cat = h.cat;

  const imgWrap = document.createElement("div");
  imgWrap.className = "card-img";
  imgWrap.setAttribute("role", "button");
  imgWrap.setAttribute("tabindex", "0");
  imgWrap.setAttribute("aria-label", "View " + h.title);

  const img = document.createElement("img");
  img.src = `assets/hamper-${h.n}.jpg`;
  img.alt = h.title;
  img.loading = "lazy";

  const badge = document.createElement("span");
  badge.className = "cat";
  badge.textContent = h.label;

  imgWrap.append(img, badge);

  const info = document.createElement("div");
  info.className = "card-info";

  const title = document.createElement("h3");
  title.textContent = h.title;

  const enquire = document.createElement("a");
  enquire.href = "#contact";
  enquire.textContent = "Enquire →";
  enquire.dataset.hamper = h.title;

  info.append(title, enquire);
  card.append(imgWrap, info);
  grid.appendChild(card);
});

/* ---------- Filters ---------- */
const filters = document.getElementById("filters");

function applyFilter(f) {
  filters.querySelectorAll("button").forEach(b => {
    b.classList.toggle("on", b.dataset.f === f);
  });
  document.querySelectorAll(".card").forEach(c => {
    c.classList.toggle("hide", f !== "all" && c.dataset.cat !== f);
  });
}

filters.addEventListener("click", e => {
  const btn = e.target.closest("button[data-f]");
  if (btn) applyFilter(btn.dataset.f);
});

document.querySelectorAll(".coll").forEach(c => {
  c.addEventListener("click", () => {
    applyFilter(c.dataset.filter);
    document.getElementById("hampers").scrollIntoView({ behavior: "smooth" });
  });
});

/* ---------- Lightbox ---------- */
const lb = document.getElementById("lb");
const lbImg = lb.querySelector("img");
const lbClose = lb.querySelector(".lb-close");

function openLightbox(src, alt) {
  lbImg.src = src;
  lbImg.alt = alt;
  lb.classList.add("on");
  lbClose.focus();
}

function closeLightbox() {
  lb.classList.remove("on");
  lbImg.removeAttribute("src");
}

grid.addEventListener("click", e => {
  const imgWrap = e.target.closest(".card-img");
  if (imgWrap) {
    const img = imgWrap.querySelector("img");
    openLightbox(img.src, img.alt);
    return;
  }
  const enquire = e.target.closest("a[data-hamper]");
  if (enquire) {
    const msgField = document.querySelector('[name="msg"]');
    msgField.value = "I am interested in: " + enquire.dataset.hamper;
  }
});

grid.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card-img")) {
    e.preventDefault();
    e.target.click();
  }
});

lb.addEventListener("click", e => {
  if (e.target === lb || e.target === lbClose) closeLightbox();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && lb.classList.contains("on")) closeLightbox();
});

/* ---------- Mobile menu ---------- */
const menu = document.getElementById("menu");
const mainNav = document.querySelector(".main-nav");
const menuBtn = document.getElementById("menuBtn");

menuBtn.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

menu.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    mainNav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------- Enquiry form ---------- */
const form = document.getElementById("form");
const note = form.querySelector(".note");
const submitBtn = form.querySelector('button[type="submit"]');
const submitLabel = submitBtn.textContent;
const PHONE_PATTERN = /^[+\d\s()-]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_LINE = " Please try again, or call or WhatsApp us on +91 83001 02136.";

function showNote(text, type) {
  note.textContent = text;
  note.className = "note" + (type ? " " + type : "");
}

function setBusy(busy) {
  submitBtn.disabled = busy;
  submitBtn.textContent = busy ? "Submitting..." : submitLabel;
}

async function sendEnquiry(payload) {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  let result = null;
  try {
    result = await response.json();
  } catch (parseError) {
    result = null;
  }

  if (!response.ok || !result || result.success !== true) {
    const error = new Error((result && result.message) || "Server error (" + response.status + ").");
    error.fromServer = true;
    throw error;
  }
  return result;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    fullName: (data.name || "").trim(),
    company: (data.company || "").trim(),
    businessType: data.businessType || "",
    location: (data.location || "").trim(),
    phone: (data.phone || "").trim(),
    email: (data.email || "").trim(),
    eventType: data.type || "",
    quantity: data.qty || "",
    budget: data.budget || "",
    message: (data.msg || "").trim(),
    website: data.website || ""   // honeypot: must stay empty
  };

  if (!payload.fullName) {
    showNote("Please enter your full name.", "error");
    form.querySelector('[name="name"]').focus();
    return;
  }
  if (!PHONE_PATTERN.test(payload.phone)) {
    showNote("Please enter a valid phone number.", "error");
    form.querySelector('[name="phone"]').focus();
    return;
  }
  if (payload.email && !EMAIL_PATTERN.test(payload.email)) {
    showNote("Please enter a valid email address, or leave it empty.", "error");
    form.querySelector('[name="email"]').focus();
    return;
  }

  setBusy(true);
  showNote("Submitting your enquiry securely...", "");

  try {
    await sendEnquiry(payload);
    form.reset();
    showNote("Thank you for submitting the form! Our team will contact you shortly.", "success");
  } catch (err) {
    console.error("Enquiry submission error:", err);
    const reason = err.fromServer ? err.message : "We could not reach the enquiry service.";
    showNote(reason + CONTACT_LINE, "error");
  } finally {
    setBusy(false);
  }
});

/* ---------- Missing images fail quietly ---------- */
document.addEventListener("error", e => {
  if (e.target.tagName === "IMG") e.target.style.opacity = 0;
}, true);
