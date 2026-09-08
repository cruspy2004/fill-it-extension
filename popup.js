const statusEl = document.getElementById("status");
const reviewEl = document.getElementById("review");
const listEl = document.getElementById("review-list");
let pending = [];

const ATS = /greenhouse\.io|lever\.co|ashbyhq\.com|myworkdayjobs\.com|icims\.com|workable\.com|smartrecruiters\.com|jobvite\.com|bamboohr\.com|breezy\.hr|recruitee\.com/;

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function callInPage(tabId, fnName) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["lib/match.js", "content.js"] });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (name) => window[name](),
    args: [fnName]
  });
  return result;
}

// --- fill -------------------------------------------------------------------

document.getElementById("fill").addEventListener("click", async () => {
  statusEl.textContent = "Filling…";
  try {
    const tab = await activeTab();
    const { filled, skipped } = await callInPage(tab.id, "__fillItFill");
    statusEl.textContent = `${filled} filled, ${skipped} skipped`;
  } catch (e) {
    statusEl.textContent = "Couldn't fill this page.";
    console.error(e);
  }
});

// --- manual capture ---------------------------------------------------------

document.getElementById("save").addEventListener("click", async () => {
  statusEl.textContent = "Reading form…";
  try {
    const tab = await activeTab();
    const results = await callInPage(tab.id, "__fillItCapture");
    if (!results.length) {
      statusEl.textContent = "Nothing new to save.";
      return;
    }
    statusEl.textContent = "";
    showReview(results);
  } catch (e) {
    statusEl.textContent = "Couldn't read this page.";
    console.error(e);
  }
});

// --- review list ------------------------------------------------------------

function showReview(items) {
  pending = items;
  listEl.innerHTML = "";
  items.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "row";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = true;
    cb.dataset.idx = i;
    const label = document.createElement("label");
    label.innerHTML = `${esc(r.label)}<br><span class="val">${esc(r.newValue)}</span>` +
                      `<span class="tag ${r.status}">${r.status}</span>`;
    row.append(cb, label);
    listEl.appendChild(row);
  });
  reviewEl.style.display = "block";
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

document.getElementById("confirm-save").addEventListener("click", async () => {
  const checked = document.querySelectorAll("#review-list input:checked");
  const toSave = Array.from(checked).map(cb => pending[Number(cb.dataset.idx)]);
  const { profile = [] } = await chrome.storage.sync.get("profile");

  for (const item of toSave) {
    if (item.key) {
      const field = profile.find(f => f.key === item.key);
      if (field) field.value = item.newValue;
    } else {
      profile.push({
        key: "custom_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        label: item.label,
        value: item.newValue,
        aliases: [item.label.toLowerCase()]
      });
    }
  }

  await chrome.storage.sync.set({ profile });
  await chrome.storage.local.remove("pending");
  chrome.runtime.sendMessage({ type: "clearBadge" });
  reviewEl.style.display = "none";
  document.getElementById("pending-banner").style.display = "none";
  statusEl.textContent = `Saved ${toSave.length} field${toSave.length === 1 ? "" : "s"}.`;
});

// --- per-site opt-in --------------------------------------------------------

document.getElementById("enable-here").addEventListener("click", async () => {
  const tab = await activeTab();
  const origin = new URL(tab.url).origin;
  const res = await chrome.runtime.sendMessage({ type: "enableHere", origin });
  statusEl.textContent = res?.ok
    ? "Auto-detect on. Reload the page."
    : "Permission declined.";
  if (res?.ok) document.getElementById("enable-here").style.display = "none";
});

// --- footer -----------------------------------------------------------------

document.getElementById("edit").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.getElementById("how").addEventListener("click", () =>
  chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") }));

// --- init -------------------------------------------------------------------

(async function init() {
  const { pending: stored } = await chrome.storage.local.get("pending");
  if (stored?.items?.length) {
    const banner = document.getElementById("pending-banner");
    banner.textContent = `${stored.items.length} new answer(s) detected from ${new URL(stored.origin).hostname}`;
    banner.style.display = "block";
    showReview(stored.items);
  }

  const tab = await activeTab();
  if (tab?.url?.startsWith("http") && !ATS.test(tab.url)) {
    const origin = new URL(tab.url).origin;
    const has = await chrome.permissions.contains({ origins: [origin + "/*"] });
    if (!has) document.getElementById("enable-here").style.display = "block";
  }
})();
