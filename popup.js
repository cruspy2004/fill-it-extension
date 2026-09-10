const statusEl = document.getElementById("status");
const unmatchedBox = document.getElementById("unmatched");
const unmatchedList = document.getElementById("unmatched-list");
const fillBtn = document.getElementById("fill");
let unmatchedFields = [];

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function callInPage(tabId, fnName, args = []) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["lib/match.js", "content.js"] });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (name, a) => window[name](...a),
    args: [fnName, args]
  });
  return result;
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

// --- unmatched-field table ---------------------------------------------------

function renderUnmatched(fields) {
  unmatchedFields = fields;
  if (!fields.length) {
    unmatchedBox.style.display = "none";
    return;
  }
  unmatchedList.innerHTML = "";
  fields.forEach((f, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="rowhead">
        <input type="checkbox" data-idx="${i}" class="remember" checked>
        <label>${esc(f.label)}</label>
      </div>
      <input type="text" data-idx="${i}" class="value" value="${esc(f.value || "")}">
    `;
    unmatchedList.appendChild(row);
  });
  unmatchedBox.style.display = "block";
}

document.getElementById("save-fill").addEventListener("click", async () => {
  const rows = Array.from(unmatchedList.querySelectorAll(".row")).map((row, i) => ({
    ref: unmatchedFields[i].ref,
    label: unmatchedFields[i].label,
    value: row.querySelector(".value").value,
    remember: row.querySelector(".remember").checked
  })).filter(r => r.value && r.value.trim());

  if (!rows.length) {
    unmatchedBox.style.display = "none";
    return;
  }

  try {
    const tab = await activeTab();
    const results = await callInPage(tab.id, "__fillItWrite", [rows]);

    const toRemember = rows.filter((r, i) => r.remember && results[i]?.ok);
    if (toRemember.length) {
      const { profile = [] } = await chrome.storage.sync.get("profile");
      for (const r of toRemember) {
        profile.push({
          key: "custom_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
          label: r.label,
          value: r.value.trim(),
          aliases: [r.label.toLowerCase()]
        });
      }
      await chrome.storage.sync.set({ profile });
    }

    const written = results.filter(r => r.ok).length;
    statusEl.textContent = `${written} more filled${toRemember.length ? `, ${toRemember.length} remembered` : ""}.`;
    unmatchedBox.style.display = "none";
  } catch (e) {
    statusEl.textContent = "Couldn't write those in.";
    console.error(e);
  }
});

// --- fill ---------------------------------------------------------------------

fillBtn.addEventListener("click", async () => {
  statusEl.textContent = "Filling…";
  unmatchedBox.style.display = "none";
  try {
    const tab = await activeTab();
    const { filled, skipped, unmatched } = await callInPage(tab.id, "__fillItFill");
    statusEl.textContent = `${filled} filled, ${skipped} skipped`;
    renderUnmatched(unmatched || []);
  } catch (e) {
    statusEl.textContent = "Couldn't fill this page.";
    console.error(e);
  }
});

// --- footer ---------------------------------------------------------------------

document.getElementById("edit").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.getElementById("how").addEventListener("click", () =>
  chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") }));

// --- init -----------------------------------------------------------------------

(async function init() {
  const { profile = [] } = await chrome.storage.sync.get("profile");
  const hasData = profile.some(f => f.value && f.value.trim());
  if (!hasData) {
    fillBtn.textContent = "Save what I've typed";
  }
})();
