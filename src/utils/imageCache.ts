// In src/utils/imageCache.ts
const imageCache: { [url: string]: Promise<string> | string } = {};
const pendingRequests: { [url: string]: Promise<string> } = {};

export function loadImage(url: string, fallbackUrl: string): Promise<string> {
  // Return cached image if available
  if (imageCache[url]) {
    return Promise.resolve(imageCache[url]);
  }

  // Return pending request if already fetching
  if (typeof pendingRequests[url] !== "undefined") {
    return pendingRequests[url];
  }

  // Start new request
  const promise = new Promise<string>((resolve) => {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      imageCache[url] = url; // Cache the successful URL
      delete pendingRequests[url];
      resolve(url);
    };

    img.onerror = () => {
      imageCache[url] = fallbackUrl; // Cache the fallback URL
      delete pendingRequests[url];
      resolve(fallbackUrl);
    };
  });

  pendingRequests[url] = promise;
  return promise;
}
