// Shared by content.js for both filling and capturing.
// No dependencies, plain functions, works as a classic script (loaded via executeScript files:[]).

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/\*/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Resolve the human-readable label for a form control.
function resolveLabel(el) {
  // aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const parts = labelledBy.split(/\s+/)
      .map(id => document.getElementById(id))
      .filter(Boolean)
      .map(node => node.textContent);
    if (parts.length) return parts.join(" ");
  }

  // <label for="id">
  if (el.id) {
    try {
      const escaped = (window.CSS && CSS.escape)
        ? CSS.escape(el.id)
        : el.id.replace(/["\\]/g, function (m) { return "\\" + m; });
      const forLabel = document.querySelector(`label[for="${escaped}"]`);
      if (forLabel && forLabel.textContent.trim()) return forLabel.textContent;
    } catch (e) { /* malformed id — fall through to the next strategy */ }
  }

  // ancestor <label>
  const ancestorLabel = el.closest("label");
  if (ancestorLabel && ancestorLabel.textContent.trim()) return ancestorLabel.textContent;

  // aria-label
  if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");

  // placeholder
  if (el.placeholder) return el.placeholder;

  // nearest preceding text in the same container (common on custom-styled forms)
  const container = el.closest("div, li, fieldset, p");
  if (container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        // skip text that's inside the field itself
        if (el.contains(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node, text = "";
    while ((node = walker.nextNode())) text += " " + node.textContent;
    if (text.trim()) return text;
  }

  return el.name || el.id || "";
}

// Score a normalized label against one field's aliases. Higher = better match.
function scoreField(normalizedLabel, field) {
  if (!normalizedLabel) return 0;
  let best = 0;
  const labelWords = new Set(normalizedLabel.split(" "));

  for (const alias of field.aliases) {
    const normAlias = normalize(alias);
    if (!normAlias) continue;

    if (normalizedLabel === normAlias) {
      best = Math.max(best, 100);
      continue;
    }
    if (normalizedLabel.includes(normAlias) || normAlias.includes(normalizedLabel)) {
      best = Math.max(best, 60);
      continue;
    }
    const aliasWords = normAlias.split(" ");
    const overlap = aliasWords.filter(w => labelWords.has(w)).length;
    if (overlap > 0) best = Math.max(best, overlap * 20);
  }
  return best;
}

// Find the best-matching field for a given label text. Returns {field, score} or null.
function bestMatch(labelText, fields, threshold = 40) {
  const normalized = normalize(labelText);
  let best = null;
  for (const field of fields) {
    const score = scoreField(normalized, field);
    if (score >= threshold && (!best || score > best.score)) {
      best = { field, score };
    }
  }
  return best;
}

function isFillable(el) {
  if (el.disabled || el.readOnly) return false;
  if (el.offsetParent === null && el.tagName !== "SELECT") return false; // invisible
  const tag = el.tagName;
  if (tag === "INPUT") {
    const type = (el.type || "text").toLowerCase();
    const skip = ["password", "hidden", "submit", "button", "image", "reset", "file"];
    if (skip.includes(type)) return false;
    const autocomplete = (el.getAttribute("autocomplete") || "").toLowerCase();
    if (autocomplete.startsWith("cc-")) return false;
    return true;
  }
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  return false;
}

function collectFillableFields() {
  const els = Array.from(document.querySelectorAll("input, textarea, select"));
  return els.filter(isFillable);
}

if (typeof module !== "undefined") {
  module.exports = { normalize, resolveLabel, scoreField, bestMatch, isFillable, collectFillableFields };
}

// --- combobox support -------------------------------------------------------
// react-select / Ashby / Greenhouse location widgets are a text <input> plus a
// portal-rendered fake list. They are NOT <select>, so .value does nothing useful.

function isCombobox(el) {
  if (el.tagName !== "INPUT") return false;
  if (el.getAttribute("role") === "combobox") return true;
  if (el.getAttribute("aria-autocomplete") === "list") return true;
  if (el.hasAttribute("aria-expanded")) return true;

  const controls = el.getAttribute("aria-controls");
  if (controls) {
    const target = document.getElementById(controls);
    if (target && (target.getAttribute("role") === "listbox" || target.querySelector("[role=option]"))) {
      return true;
    }
  }

  // react-select renders the input inside a wrapper with a select-ish class
  if (el.closest('[class*="select__"], [class*="Select__"], [class*="-select"]')) return true;

  return false;
}

// Options usually render in a portal at the end of <body>, outside the input's
// own subtree — so this searches the whole document on purpose.
const OPTION_SELECTOR = [
  "[role=option]",
  "[role=listbox] li",
  '[class*="option"]:not([class*="options"])'
].join(", ");

function visibleOptions() {
  return Array.from(document.querySelectorAll(OPTION_SELECTOR))
    .filter(o => o.offsetParent !== null && o.textContent.trim());
}

if (typeof module !== "undefined") {
  module.exports.isCombobox = isCombobox;
  module.exports.visibleOptions = visibleOptions;
  module.exports.OPTION_SELECTOR = OPTION_SELECTOR;
}

// --- reading what's on the page --------------------------------------------
// Shared by manual "Save this form" (content.js) and auto-detect (autodetect.js).

function comboboxDisplayValue(el) {
  if (el.value && el.value.trim()) return el.value.trim();
  const wrapper = el.closest('[class*="select__"], [class*="Select__"], [class*="-select"]');
  if (wrapper) {
    const single = wrapper.querySelector('[class*="singleValue"]');
    if (single && single.textContent.trim()) return single.textContent.trim();
  }
  return "";
}

function readPageValues() {
  const out = [];
  for (const el of collectFillableFields()) {
    let value = "";
    if (el.tagName === "SELECT") {
      const opt = el.selectedOptions[0];
      // an option with an empty value is a placeholder ("Select...", "Pick") — not an answer
      if (!opt || !opt.value) continue;
      value = opt.textContent.trim();
    } else if (el.type === "checkbox" || el.type === "radio") {
      continue; // booleans are too ambiguous to learn from
    } else if (isCombobox(el)) {
      value = comboboxDisplayValue(el);
    } else {
      value = el.value;
    }
    if (!value || !value.trim()) continue;
    out.push({ label: resolveLabel(el) || el.name || el.id || "(unlabeled field)", value: value.trim() });
  }
  return out;
}

// Returns only what's genuinely new or changed — never "same".
function diffAgainstProfile(pageValues, profile) {
  const results = [];
  const seen = new Set();

  for (const { label, value } of pageValues) {
    const match = bestMatch(label, profile);
    if (match) {
      const existing = (match.field.value || "").trim();
      if (existing === value) continue;
      if (seen.has(match.field.key)) continue;
      seen.add(match.field.key);
      results.push({
        key: match.field.key,
        label: match.field.label,
        oldValue: existing,
        newValue: value,
        status: existing ? "changed" : "new"
      });
    } else {
      results.push({ key: null, label, oldValue: "", newValue: value, status: "unmatched" });
    }
  }
  return results;
}

if (typeof module !== "undefined") {
  module.exports.readPageValues = readPageValues;
  module.exports.diffAgainstProfile = diffAgainstProfile;
}
