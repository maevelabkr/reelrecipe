export function detectPlatform(url: string) {
  if (/youtube\.com\/shorts|youtu\.be/.test(url)) return 'youtube';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/instagram\.com\/reels/.test(url)) return 'instagram';
  return null;
}

export function extractVideoId(url: string, platform: string) {
  if (platform === 'youtube') {
    const m = url.match(/shorts\/([^?]+)|youtu\.be\/([^?]+)/);
    return m?.[1] ?? m?.[2] ?? null;
  }
  if (platform === 'tiktok') {
    return url.match(/video\/(\d+)/)?.[1] ?? null;
  }
  return null;
}