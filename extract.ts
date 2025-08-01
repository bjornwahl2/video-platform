import { chromium } from 'playwright';

export interface Recording {
  id: string;
  title: string;
  timestamp: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
}

export async function extractLatestVideo(): Promise<Recording | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://video.skynordic.no/videoviewer/vd4.aspx?station=Osfossen');

  const link = await page.locator('select#ddlVideo option').first();
  const value = await link.getAttribute('value');
  const text = await link.textContent();
  await browser.close();

  if (!value || !text) return null;

  const videoUrl = `https://video.skynordic.no/FileHandler.ashx?${value}`;
  const id = value.split('=')[1].split('&')[0];
  return {
    id,
    title: text.trim(),
    timestamp: new Date().toISOString(),
    duration: 'unknown',
    videoUrl,
    thumbnail: `/thumbnails/${id}.jpg`
  };
}