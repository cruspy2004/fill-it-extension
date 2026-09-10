// Injected on demand by popup.js. Does the DOM work.
// Exposes window.__fillItFill() and window.__fillItWrite().

function setNativeValue(el, value) {
  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement : window.HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function mouse(el, types) {
  for (const type of types) {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
  }
}

function outline(el, color) {
  const target = el.closest('[class*="select__"], [class*="Select__"]') || el;
  target.style.outline = `2px solid ${color}`;
  target.style.outlineOffset = "1px";
}

// --- combobox ---------------------------------------------------------------

// React needs a paint before options exist. 300ms floor, then poll.
function waitForOptions(timeout = 1500) {
  return new Promise(resolve => {
    const start = Date.now();
    setTimeout(function poll() {
      const opts = visibleOptions();
      if (opts.length) return resolve(opts);
      if (Date.now() - start > timeout) return resolve([]);
      setTimeout(poll, 50);
    }, 300);
  });
}

function pickBest(options, value) {
  const want = value.trim().toLowerCase();
  const text = o => o.textContent.trim().toLowerCase();
  return options.find(o => text(o) === want)
      || options.find(o => text(o).startsWith(want))
      || options.find(o => text(o).includes(want))
      || options.find(o => want.includes(text(o)))
      || null;
}

// Did the widget actually commit a value, or is the input just holding loose text?
function readBack(el) {
  if (el.value && el.value.trim()) return el.value.trim();
  const wrapper = el.closest('[class*="select__"], [class*="Select__"], [class*="-select"]');
  if (wrapper) {
    const single = wrapper.querySelector('[class*="singleValue"], [class*="multiValue"]');
    if (single && single.textContent.trim()) return single.textContent.trim();
  }
  return "";
}

async function fillCombobox(el, value) {
  el.focus();
  mouse(el, ["mousedown", "mouseup"]);
  el.click();

  setNativeValue(el, value); // kicks off the async option fetch

  const options = await waitForOptions();
  const hit = options.length ? pickBest(options, value) : null;

  if (!hit) {
    // Never leave uncommitted text — it submits as blank anyway, and looks filled.
    setNativeValue(el, "");
    el.blur();
    return false;
  }

  // react-select commits on mousedown, not click.
  mouse(hit, ["mousedown", "mouseup"]);
  hit.click();

  await new Promise(r => setTimeout(r, 80));
  return readBack(el) !== "";
}

// --- plain controls ---------------------------------------------------------

function fillSelect(el, value) {
  const want = value.trim().toLowerCase();
  const options = Array.from(el.options);
  const match = options.find(o => o.value.toLowerCase() === want)
             || options.find(o => o.textContent.trim().toLowerCase() === want)
             || options.find(o => o.textContent.trim().toLowerCase().includes(want));
  if (!match) return false;
  el.value = match.value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function fillCheckboxOrRadio(el, value) {
  const wantChecked = ["yes", "true", "1", "on"].includes(value.trim().toLowerCase());
  if (el.checked !== wantChecked) el.click();
  return true;
}

// Writes one value into one control, reusing the same routines fill uses.
// Shared by the main fill pass and the popup's "Save & fill" write-back.
async function writeValue(el, value) {
  if (isCombobox(el)) return fillCombobox(el, value);
  if (el.tagName === "SELECT") return fillSelect(el, value);
  if (el.type === "checkbox" || el.type === "radio") return fillCheckboxOrRadio(el, value);
  setNativeValue(el, value);
  return true;
}

// A field belongs in the popup's "fill these in yourself" table only if a short
// text answer actually makes sense for it — not a paragraph box, not a toggle.
function belongsInTable(el) {
  if (el.tagName === "TEXTAREA") return false;
  if (el.type === "checkbox" || el.type === "radio") return false;
  return true;
}

function currentDisplayValue(el) {
  if (el.tagName === "SELECT") {
    const opt = el.selectedOptions[0];
    return opt && opt.value ? opt.textContent.trim() : "";
  }
  if (isCombobox(el)) return comboboxDisplayValue(el);
  return (el.value || "").trim();
}

let refCounter = 0;
function refFor(el) {
  if (!el.dataset.fillitRef) el.dataset.fillitRef = "fillit-" + (++refCounter) + "-" + Date.now();
  return el.dataset.fillitRef;
}

// --- entry points -----------------------------------------------------------

window.__fillItFill = async function () {
  const { profile = [] } = await chrome.storage.sync.get("profile");
  const fields = profile.filter(f => f.value && f.value.trim());
  const els = collectFillableFields();

  let filled = 0, skipped = 0;
  const unmatched = [];

  for (const el of els) {
    const label = resolveLabel(el);
    const match = bestMatch(label, fields);

    if (!match) {
      outline(el, "#e6a700");
      skipped++;
      if (belongsInTable(el)) {
        unmatched.push({ ref: refFor(el), label: label || el.name || el.id || "(unlabeled field)",
                          value: currentDisplayValue(el) });
      }
      continue;
    }

    const ok = await writeValue(el, match.field.value);
    outline(el, ok ? "#16a34a" : "#e6a700");
    ok ? filled++ : skipped++;
  }

  return { filled, skipped, unmatched };
};

// Called after the popup's table is filled in. Writes each answer into its field
// and reports which ones actually committed, so the popup only offers to remember
// answers that really landed on the page.
window.__fillItWrite = async function (answers) {
  const results = [];
  for (const { ref, label, value } of answers) {
    if (!value || !value.trim()) continue;
    const el = document.querySelector(`[data-fillit-ref="${CSS.escape(ref)}"]`);
    if (!el) { results.push({ label, value, ok: false }); continue; }
    const ok = await writeValue(el, value.trim());
    outline(el, ok ? "#16a34a" : "#e6a700");
    results.push({ label, value: value.trim(), ok });
  }
  return results;
};
