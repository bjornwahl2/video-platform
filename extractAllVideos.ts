import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { createThumbnail } from './thumbnail';
import { Video } from './types';

export async function extractAllVideos(): Promise<Video[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://video.skynordic.no/videoviewer/vd4.aspx?station=Osfossen');
  await page.waitForSelector('select[id="DropDownList1"]');

  const options = await page.$$eval('select[id="DropDownList1"] option', opts =>
    opts.map(o => ({ value: o.getAttribute('value'), title: o.textContent?.trim() || '' }))
  );

  const existingVideos: Video[] = await fs.readFile('videos.json', 'utf-8')
    .then(data => JSON.parse(data))
    .catch(() => []);

  const existingIds = new Set(existingVideos.map(v => v.id));
  const newVideos: Video[] = [];

  for (const { value, title } of options) {
    if (!value || value === 'Velg opptak') continue;

    const normalized = value.replace(/\\/g, '/');
    const fileName = path.basename(normalized);
    const videoUrl = `https://video.skynordic.no/videoviewer/FileHandler.ashx?Fila=${value}`;
    const id = fileName;

    if (existingIds.has(id)) continue;

    await createThumbnail(videoUrl, id);

    newVideos.push({
      id,
      title,
      videoUrl,
      thumbnail: `thumbnails/${id}.jpg`,
      timestamp: new Date().toISOString(),
      duration: '00:00' // placeholder
    });
  }

  const allVideos = [...existingVideos, ...newVideos];
  await fs.writeFile('videos.json', JSON.stringify(allVideos, null, 2));
  await browser.close();

  return allVideos;
}

// Run directly if executed from CLI
if (import.meta.url.endsWith(process.argv[1])) {
  extractAllVideos()
    .then(() => console.log('✅ Video scraping complete.'))
    .catch(err => console.error('❌ Error during scraping:', err));
}