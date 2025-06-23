chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    shortsEnabled: true,
    shortsTemporarilyAllowed: []
  });
});