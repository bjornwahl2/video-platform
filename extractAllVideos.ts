import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { createThumbnail } from './thumbnail';
import { Video } from './types';

export async function extractAllVideos(): Promise<Video[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://video.skynordic.no/videoviewer/vd4.aspx?station=Osfossen');

  // Wait for dropdown to load
  await page.waitForSelector('select[id="DropDownList1"]');

  const options = await page.$$eval('select[id="DropDownList1"] option', opts =>
    opts.map(o => ({ value: o.getAttribute('value'), title: o.textContent?.trim() || '' }))
  );

  const videos: Video[] = [];

  for (const { value, title } of options) {
    if (!value || value === 'Velg opptak') continue;

    const fileName = path.basename(value.replace(/\\/g, '/'));
    const videoUrl = `https://video.skynordic.no/videoviewer/FileHandler.ashx?Fila=${encodeURIComponent(value)}`;
    const id = fileName;
    await createThumbnail(videoUrl, id);

    videos.push({
      id,
      title,
      videoUrl,
      thumbnail: `thumbnails/${id}.jpg`,
      timestamp: new Date().toISOString(),
      duration: '00:00' // placeholder — update if duration logic is added
    });
  }

  await fs.writeFile('videos.json', JSON.stringify(videos, null, 2));
  await browser.close();

  return videos;
}

// Run immediately if this is a direct script call
if (import.meta.url.endsWith(process.argv[1])) {
  extractAllVideos()
    .then(() => console.log('✅ Video scraping complete.'))
    .catch(err => console.error('❌ Error during scraping:', err));
}