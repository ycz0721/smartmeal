const UNSPLASH_API = 'https://api.unsplash.com/search/photos';

interface UnsplashResult {
  results: Array<{
    urls: { regular: string };
  }>;
}

export async function searchUnsplashImage(query: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  try {
    const url = `${UNSPLASH_API}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${key}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000); // 5s timeout for China

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      console.error('Unsplash API error:', res.status);
      return null;
    }

    const data: UnsplashResult = await res.json();
    if (data.results.length === 0) return null;

    return data.results[0].urls.regular;
  } catch (error) {
    console.error('Unsplash search failed:', error);
    return null;
  }
}
