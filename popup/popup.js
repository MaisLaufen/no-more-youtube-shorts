const toggle = document.getElementById("toggleShorts");

chrome.storage.sync.get(["shortsEnabled"], ({ shortsEnabled }) => {
  toggle.checked = shortsEnabled !== false;
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ shortsEnabled: toggle.checked });
});