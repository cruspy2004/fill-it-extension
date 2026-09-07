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
    const forLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (forLabel && forLabel.textContent.trim()) return forLabel.textContent;
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
