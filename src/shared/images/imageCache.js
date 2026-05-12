const warmedImageSources = new Map();

function canUseImages() {
  return typeof window !== "undefined" && typeof Image !== "undefined";
}

export function warmImage(src, options = {}) {
  if (!src || !canUseImages()) return Promise.resolve(false);

  const existing = warmedImageSources.get(src);
  if (existing) return existing;

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = options.decoding ?? "async";

    if (options.fetchPriority) {
      try {
        image.fetchPriority = options.fetchPriority;
      } catch {
        // fetchPriority is not available in every browser.
      }
    }

    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;

    if (typeof image.decode === "function") {
      image.decode().then(() => resolve(true)).catch(() => {
        // onload/onerror will still settle the promise in browsers that need it.
      });
    }
  });

  warmedImageSources.set(src, promise);
  return promise;
}

export function warmImages(sources, options = {}) {
  const uniqueSources = Array.from(new Set((sources ?? []).filter(Boolean)));
  return Promise.all(uniqueSources.map((src) => warmImage(src, options)));
}
