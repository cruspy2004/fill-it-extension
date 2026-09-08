// Service worker: onboarding, badge, and per-site opt-in registration.

importScripts("lib/fields.js");

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  // Seed the default field set immediately. Without this, an auto-detect capture that
  // happens before the user ever opens the options page would save every field as a junk
  // custom field AND leave the defaults permanently uncreated.
  const { profile } = await chrome.storage.sync.get("profile");
  if (!profile || !profile.length) {
    await chrome.storage.sync.set({ profile: DEFAULT_FIELDS.map(f => ({ ...f })) });
  }

  if (reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "pendingReady") {
    chrome.action.setBadgeText({ text: " " });
    chrome.action.setBadgeBackgroundColor({ color: "#16a34a" });
  }

  if (msg.type === "openReview") {
    chrome.action.openPopup?.().catch(() => {
      // openPopup isn't available in every context; badge is the fallback cue.
      chrome.action.setBadgeText({ text: " " });
    });
  }

  if (msg.type === "clearBadge") {
    chrome.action.setBadgeText({ text: "" });
  }

  if (msg.type === "enableHere") {
    enableOnOrigin(msg.origin).then(sendResponse);
    return true; // async
  }
});

async function enableOnOrigin(origin) {
  const pattern = origin + "/*";
  const granted = await chrome.permissions.request({ origins: [pattern] });
  if (!granted) return { ok: false };

  try {
    await chrome.scripting.registerContentScripts([{
      id: "autodetect-" + origin.replace(/[^a-z0-9]/gi, "_"),
      matches: [pattern],
      js: ["lib/match.js", "autodetect.js"],
      runAt: "document_idle"
    }]);
  } catch (e) {
    // already registered — fine
    if (!String(e).includes("Duplicate")) return { ok: false, error: String(e) };
  }
  return { ok: true };
}
