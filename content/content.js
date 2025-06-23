chrome.storage.sync.get(["shortsEnabled"], ({ shortsEnabled }) => {
  if (shortsEnabled === false) return;

  function hideShortsElements() {
    document.querySelectorAll('a[title="Shorts"]').forEach(el => {
      el.style.display = "none";
    });

    document.querySelectorAll('ytd-rich-section-renderer').forEach(section => {
      const header = section.querySelector('#title');
      if (header && /shorts/i.test(header.textContent)) {
        section.style.display = "none";
      }
    });

    document.querySelectorAll('ytd-grid-video-renderer, ytd-video-renderer').forEach(video => {
      const badge = video.querySelector('ytd-badge-supported-renderer');
      if (badge && /shorts/i.test(badge.textContent)) {
        video.style.display = "none";
      }
    });
  }

  hideShortsElements();

  const observer = new MutationObserver(() => {
    hideShortsElements();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});