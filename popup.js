const statusEl = document.getElementById("status");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function inject(tabId, files) {
  await chrome.scripting.executeScript({ target: { tabId }, files });
}

async function callInPage(tabId, fnName) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (name) => window[name](),
    args: [fnName]
  });
  return result;
}

document.getElementById("fill").addEventListener("click", async () => {
  statusEl.textContent = "Filling...";
  try {
    const tab = await getActiveTab();
    await inject(tab.id, ["lib/match.js", "content.js"]);
    const { filled, skipped } = await callInPage(tab.id, "__fillItFill");
    statusEl.textContent = `${filled} filled, ${skipped} skipped`;
  } catch (e) {
    statusEl.textContent = "Couldn't fill this page.";
    console.error(e);
  }
});

let pendingCapture = [];

document.getElementById("save").addEventListener("click", async () => {
  statusEl.textContent = "Reading form...";
  try {
    const tab = await getActiveTab();
    await inject(tab.id, ["lib/match.js", "content.js"]);
    const results = await callInPage(tab.id, "__fillItCapture");
    pendingCapture = results;

    if (!results.length) {
      statusEl.textContent = "Nothing new to save.";
      return;
    }

    statusEl.textContent = "";
    renderCaptureReview(results);
  } catch (e) {
    statusEl.textContent = "Couldn't read this page.";
    console.error(e);
  }
});

function renderCaptureReview(results) {
  const container = document.getElementById("capture-review");
  const list = document.getElementById("capture-list");
  list.innerHTML = "";

  results.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <input type="checkbox" data-idx="${i}" checked>
      <label>${escapeHtml(r.label)}<br><span class="val">${escapeHtml(r.newValue)}</span>
        <span class="tag ${r.status}">${r.status}</span>
      </label>
    `;
    list.appendChild(row);
  });

  container.style.display = "block";
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

document.getElementById("confirm-save").addEventListener("click", async () => {
  const checkboxes = document.querySelectorAll("#capture-list input[type=checkbox]:checked");
  const toSave = Array.from(checkboxes).map(cb => pendingCapture[Number(cb.dataset.idx)]);

  const { profile = [] } = await chrome.storage.sync.get("profile");

  for (const item of toSave) {
    if (item.key) {
      const field = profile.find(f => f.key === item.key);
      if (field) field.value = item.newValue;
    } else {
      // unmatched field — add as a new custom field
      profile.push({
        key: "custom_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        label: item.label,
        value: item.newValue,
        aliases: [item.label.toLowerCase()]
      });
    }
  }

  await chrome.storage.sync.set({ profile });
  document.getElementById("capture-review").style.display = "none";
  statusEl.textContent = `Saved ${toSave.length} field(s).`;
});

document.getElementById("edit").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
