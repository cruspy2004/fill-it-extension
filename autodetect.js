// Runs automatically on known ATS domains (see manifest content_scripts) and on any
// site the user explicitly enabled. Watches what you type, and when you submit,
// offers to remember anything new. Never blocks the form. Never sends anything anywhere.

(() => {
  if (window.__fillItAutodetect) return; // guard against double-injection
  window.__fillItAutodetect = true;

  const ORIGIN = location.origin;
  let debounceTimer = null;
  let snoozed = false;

  chrome.storage.local.get("snoozed").then(({ snoozed: list = [] }) => {
    snoozed = list.includes(ORIGIN);
  });

  // --- snapshot -------------------------------------------------------------

  function snapshot() {
    const values = readPageValues();
    if (!values.length) return;
    chrome.storage.local.set({ ["snap:" + ORIGIN]: { values, at: Date.now() } });
  }

  function scheduleSnapshot() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(snapshot, 500);
  }

  document.addEventListener("change", scheduleSnapshot, true);
  document.addEventListener("blur", scheduleSnapshot, true);

  // --- review trigger -------------------------------------------------------

  async function offerReview() {
    if (snoozed) return;

    snapshot(); // capture whatever is on screen right now, synchronously
    const { profile = [] } = await chrome.storage.sync.get("profile");
    const pending = diffAgainstProfile(readPageValues(), profile);
    if (!pending.length) return;

    await chrome.storage.local.set({ pending: { origin: ORIGIN, items: pending, at: Date.now() } });
    chrome.runtime.sendMessage({ type: "pendingReady", count: pending.length });
    showToast(pending.length);
  }

  document.addEventListener("submit", () => { offerReview(); }, true);

  // Many ATS forms are SPAs and never fire submit — catch the button too.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest('button, input[type=submit], [role=button]');
    if (!btn) return;
    const text = (btn.textContent || btn.value || "").toLowerCase();
    if (/submit|apply|send application|finish/.test(text)) setTimeout(offerReview, 400);
  }, true);

  window.addEventListener("beforeunload", snapshot);

  // SPA route changes
  let lastPath = location.pathname;
  new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      offerReview();
    }
  }).observe(document, { subtree: true, childList: true });

  // --- toast ----------------------------------------------------------------
  // Lives in a shadow root so the page's CSS can't reach in and break it.

  function showToast(count) {
    if (document.getElementById("__fillit_toast")) return;

    const host = document.createElement("div");
    host.id = "__fillit_toast";
    host.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483647;";
    const root = host.attachShadow({ mode: "closed" });

    root.innerHTML = `
      <style>
        .box {
          font: 13px/1.4 -apple-system, "Segoe UI", Arial, sans-serif;
          background: #fff; color: #1a1a1a;
          border: 1px solid #d8d8d8; border-radius: 10px;
          box-shadow: 0 6px 24px rgba(0,0,0,.16);
          padding: 14px 16px; width: 260px;
        }
        .title { font-weight: 600; margin-bottom: 3px; }
        .sub { color: #666; font-size: 12px; margin-bottom: 11px; }
        .btns { display: flex; gap: 8px; }
        button {
          flex: 1; padding: 7px; font-size: 12.5px; border-radius: 6px;
          cursor: pointer; border: 1px solid #ccc; background: #fff;
        }
        .primary { background: #16a34a; border-color: #16a34a; color: #fff; }
      </style>
      <div class="box">
        <div class="title">Save ${count} answer${count === 1 ? "" : "s"} to Fill It?</div>
        <div class="sub">So it can fill them in for you next time.</div>
        <div class="btns">
          <button id="no">Not now</button>
          <button id="yes" class="primary">Review</button>
        </div>
      </div>
    `;

    root.getElementById("yes").onclick = () => {
      chrome.runtime.sendMessage({ type: "openReview" });
      host.remove();
    };
    root.getElementById("no").onclick = async () => {
      const { snoozed: list = [] } = await chrome.storage.local.get("snoozed");
      if (!list.includes(ORIGIN)) {
        list.push(ORIGIN);
        await chrome.storage.local.set({ snoozed: list });
      }
      snoozed = true;
      host.remove();
    };

    document.body.appendChild(host);
    setTimeout(() => host.remove(), 20000);
  }
})();
