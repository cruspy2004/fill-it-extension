// Service worker. That's the whole job: seed defaults, open the welcome page.
importScripts("lib/fields.js");

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const { profile } = await chrome.storage.sync.get("profile");
  if (!profile || !profile.length) {
    await chrome.storage.sync.set({ profile: DEFAULT_FIELDS.map(f => ({ ...f })) });
  }

  if (reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
  }
});
