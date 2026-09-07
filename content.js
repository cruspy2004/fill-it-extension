// Injected on demand via chrome.scripting.executeScript. Does the actual DOM work.
// Exposes window.__fillItFill() and window.__fillItCapture() for the popup to call.

function setNativeValue(el, value) {
  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement : window.HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillSelect(el, value) {
  const options = Array.from(el.options);
  const match = options.find(o =>
    o.value.toLowerCase() === value.toLowerCase() ||
    o.textContent.trim().toLowerCase() === value.toLowerCase()
  );
  if (!match) return false;
  el.value = match.value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function fillCheckboxOrRadio(el, value) {
  const wantChecked = ["yes", "true", "1", "on"].includes(value.toLowerCase());
  if (el.checked !== wantChecked) el.click();
  return true;
}

function outline(el, color) {
  el.style.outline = `2px solid ${color}`;
  el.style.outlineOffset = "1px";
}

window.__fillItFill = async function () {
  const { profile = [] } = await chrome.storage.sync.get("profile");
  const fields = profile.filter(f => f.value && f.value.trim());
  const els = collectFillableFields();

  let filled = 0, skipped = 0;

  for (const el of els) {
    const label = resolveLabel(el);
    const match = bestMatch(label, fields);

    if (!match) {
      outline(el, "#e6a700"); // amber = unrecognized
      skipped++;
      continue;
    }

    const value = match.field.value;
    let ok = true;
    if (el.tagName === "SELECT") {
      ok = fillSelect(el, value);
    } else if (el.type === "checkbox" || el.type === "radio") {
      ok = fillCheckboxOrRadio(el, value);
    } else {
      setNativeValue(el, value);
    }

    if (ok) {
      outline(el, "#16a34a"); // green = filled
      filled++;
    } else {
      outline(el, "#e6a700");
      skipped++;
    }
  }

  return { filled, skipped };
};

window.__fillItCapture = async function () {
  const { profile = [] } = await chrome.storage.sync.get("profile");
  const els = collectFillableFields();
  const results = [];

  for (const el of els) {
    let value = "";
    if (el.tagName === "SELECT") {
      value = el.selectedOptions[0]?.textContent?.trim() || "";
    } else if (el.type === "checkbox" || el.type === "radio") {
      continue; // skip booleans in capture — too ambiguous to be worth it
    } else {
      value = el.value;
    }
    if (!value || !value.trim()) continue;

    const label = resolveLabel(el);
    const match = bestMatch(label, profile);

    if (match) {
      const existing = match.field.value || "";
      if (existing.trim() === value.trim()) continue; // nothing new
      results.push({
        key: match.field.key,
        label: match.field.label,
        oldValue: existing,
        newValue: value.trim(),
        status: existing ? "changed" : "new"
      });
    } else {
      results.push({
        key: null,
        label: label || el.name || el.id || "(unlabeled field)",
        oldValue: "",
        newValue: value.trim(),
        status: "unmatched"
      });
    }
  }

  return results;
};
