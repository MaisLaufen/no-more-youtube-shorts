if (typeof browser === "undefined") {
  var browser = chrome;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    shortsEnabled: true,
    shortsTemporarilyAllowed: []
  });
});