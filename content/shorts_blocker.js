function loadBlockedShortsUI(callback) {
  const cssId = 'blockedshorts-css';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('ui/blockedshorts.css');
    document.head.appendChild(link);
  }

  fetch(chrome.runtime.getURL('ui/blockedshorts.html'))
    .then(response => response.text())
    .then(html => {
      callback(html);
    });
}

function disableShortsNavigation() {
  const removeNavElements = () => {
    document.querySelectorAll('ytd-reel-player-overlay-renderer, ytd-reel-player-header-renderer').forEach(el => el.remove());
    document.querySelectorAll('.navigation-container.style-scope.ytd-shorts').forEach(el => el.remove());
  };

  const waitForBody = setInterval(() => {
    if (!document.body) return;
    clearInterval(waitForBody);

    removeNavElements();
    const observer = new MutationObserver(removeNavElements);
    observer.observe(document.body, { childList: true, subtree: true });
  }, 100);

  const blockKeys = (e) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  window.addEventListener("keydown", blockKeys, true);

  const blockWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  window.addEventListener("wheel", blockWheel, { passive: false, capture: true });

  const blockTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  window.addEventListener("touchstart", blockTouch, { passive: false });
  window.addEventListener("touchmove", blockTouch, { passive: false });
  window.addEventListener("touchend", blockTouch, { passive: false });

  const blockScroll = () => {
    const containers = document.querySelectorAll("ytd-reel-video-renderer, #shorts-inner-container, ytd-shorts");
    containers.forEach(el => {
      el.style.overflow = "hidden";
      el.style.overscrollBehavior = "none";
      el.style.scrollBehavior = "auto";
    });
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  };

  const waitForScrollTarget = setInterval(() => {
    if (!document.body) return;
    clearInterval(waitForScrollTarget);

    blockScroll();
    const scrollObserver = new MutationObserver(blockScroll);
    scrollObserver.observe(document.body, { childList: true, subtree: true });
  }, 100);

  window.onscroll = () => window.scrollTo(0, 0);
  document.onscroll = () => window.scrollTo(0, 0);
}

const videoId = window.location.pathname.split("/").pop();

chrome.storage.sync.get(["shortsEnabled", "shortsTemporarilyAllowed"], ({ shortsEnabled, shortsTemporarilyAllowed }) => {
  const isTemporarilyAllowed = shortsTemporarilyAllowed?.includes(videoId) ?? false;
  const isFullyAllowed = shortsEnabled === false;
  if (isFullyAllowed) return;

  if (isTemporarilyAllowed) {
    disableShortsNavigation();
    watchUrlAndReloadIfNotShorts();
    return;
  }

  const interval = setInterval(() => {
    const shortsContainer = document.querySelector("ytd-shorts.style-scope.ytd-page-manager");
    if (!shortsContainer) return;

    clearInterval(interval);

    loadBlockedShortsUI(html => {
      shortsContainer.innerHTML = html;
      const bannerDiv = document.getElementById("shorts-banner");
      if (bannerDiv) {
        const img = document.createElement("img");
        img.src = chrome.runtime.getURL("img/banner.gif");
        img.alt = "stop watching those stupid stupid videos";
        img.className = "placeholder";
        bannerDiv.appendChild(img);
      }

      document.getElementById("watch-once").onclick = () => {
        chrome.storage.sync.get(["shortsTemporarilyAllowed"], ({ shortsTemporarilyAllowed }) => {
          const updated = shortsTemporarilyAllowed || [];
          if (!updated.includes(videoId)) updated.push(videoId);
          chrome.storage.sync.set({ shortsTemporarilyAllowed: updated }, () => {
            location.reload();
          });
        });
      };

      document.getElementById("enable-shorts").onclick = () => {
        chrome.storage.sync.set({ shortsEnabled: false }, () => location.reload());
      };
    });
  }, 300);
});

function watchUrlAndReloadIfNotShorts() {
  let lastUrl = location.href;

  const checkUrl = () => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (!currentUrl.includes('/shorts/')) {
        location.reload();
      }
    }
  };

  setInterval(checkUrl, 500);

  const _pushState = history.pushState;
  history.pushState = function () {
    _pushState.apply(this, arguments);
    checkUrl();
  };
  window.addEventListener('popstate', checkUrl);
}
