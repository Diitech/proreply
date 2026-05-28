// ProReply Service Worker
console.log("[ProReply SW] Started");

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.get(null, (existing) => {
      if (!existing || Object.keys(existing).length === 0) {
        chrome.storage.local.set({
          isActive: false,
          automationActive: false,
          isPro: false,
          templates: [],
          rules: [],
          user: {},
          usage: { messagesCount: 0 },
          settings: { sendNotifications: true },
        });
      }
    });
  }
});

chrome.alarms.create("dailyReset", { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyReset") {
    chrome.storage.local.get(["usage"], (data) => {
      chrome.storage.local.set({ usage: { messagesCount: 0 } });
    });
  }
});

chrome.runtime.onMessage.addListener((req, sender, respond) => {
  respond({ ok: true });
  return true;
});

console.log("[ProReply SW] Ready");
