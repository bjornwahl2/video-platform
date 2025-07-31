const { chromium } = require('playwright');
const { saveVideoIfNew } = require('./db');
const { generateThumbnail } = require('./ffmpeg');
const { parse } = require('path');
const fs = require('fs/promises');

const TARGET_URL = 'https://video.skynordic.no/videoviewer/vd4.aspx?station=Osfossen&alle=Alle&height=480&width=600';
const CHECK_INTERVAL_MS = 5000;

async function extractVideoLinks(page: any): Promise<string[]> {
  return await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('select#ddlVideos option'));
    return options.map(opt => (opt as HTMLOptionElement).value).filter(v => v.includes('FileHandler.ashx'));
  });
}

async function scrape() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(TARGET_URL);

  while (true) {
    try {
      await page.reload();
      const urls = await extractVideoLinks(page);
      for (const url of urls) {
        const saved = await saveVideoIfNew(url);
        if (saved) {
          const id = saved.id;
          const thumbnailPath = `./thumbnails/${id}.jpg`;
          await generateThumbnail(url, thumbnailPath);
          console.log(`Saved new video: ${url}`);
        }
      }
    } catch (err) {
      console.error('Scraper error:', err);
    }
    await new Promise(res => setTimeout(res, CHECK_INTERVAL_MS));
  }
}

scrape();